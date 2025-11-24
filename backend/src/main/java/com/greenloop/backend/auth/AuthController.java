package com.greenloop.backend.auth;

import com.greenloop.backend.user.UserEntity;
import com.greenloop.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User login, registration, and Google OAuth")
public class AuthController {
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final LocalJwtService jwtService;
    private final AuthTokenResolver tokenResolver;
    private final GoogleTokenVerifierService googleTokenVerifierService;

    public AuthController(UserRepository userRepo,
                          PasswordEncoder passwordEncoder,
                          LocalJwtService jwtService,
                          AuthTokenResolver tokenResolver,
                          GoogleTokenVerifierService googleTokenVerifierService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenResolver = tokenResolver;
        this.googleTokenVerifierService = googleTokenVerifierService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register new user account")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (userRepo.existsByEmail(req.email().toLowerCase())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already in use");
        }

        UserEntity user = new UserEntity();
        user.setEmail(req.email().toLowerCase());
        user.setName(req.name());
        user.setPassword(passwordEncoder.encode(req.password()));

        userRepo.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email + password")
    public LoginResponse login(@RequestBody LoginRequest req) {
        var user = userRepo.findByEmail(req.email().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());

        return new LoginResponse(
                token,
                new LoginUserDto(user.getId(), user.getName(), user.getEmail())
        );
    }

    @PostMapping("/google")
    @Operation(summary = "Login with Google OAuth")
    public LoginResponse googleLogin(@RequestBody GoogleLoginRequest req){
        if (req.credential() == null || req.credential().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing Google credential");
        }
        var googleUser = googleTokenVerifierService.verify(req.credential());
        var existingGoogleId = userRepo.findByGoogleId(googleUser.userId());
        UserEntity user;
        if (existingGoogleId.isPresent()) {
            user = existingGoogleId.get();
        } else {
            var existsByEmail = userRepo.findByEmail(googleUser.email().toLowerCase());
            if (existsByEmail.isPresent()) {
                user = existsByEmail.get();
                user.setGoogleId(googleUser.userId());
            } else {
                user = new UserEntity();
                user.setGoogleId(googleUser.userId());
                user.setEmail(googleUser.email().toLowerCase());
                user.setName(googleUser.name());
            }
            userRepo.save(user);
        }
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new LoginResponse(token, new LoginUserDto(user.getId(), user.getName(), user.getEmail()));
    }

    @GetMapping("/me")
    public AuthTokenResolver.AuthenticatedUser me(@RequestHeader("Authorization") String authHeader) {
        String token = extractBearer(authHeader);
        return tokenResolver.resolve(token);
    }

    private String extractBearer(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing bearer token");
        }
        return authHeader.substring("Bearer ".length());
    }

    public record RegisterRequest(String name, String email, String password) {}
    public record LoginRequest(String email, String password) {}
    public record LoginUserDto(Long id, String name, String email) {}
    public record LoginResponse(String token, LoginUserDto user) {}
    public record GoogleLoginRequest (String credential) {}
}
