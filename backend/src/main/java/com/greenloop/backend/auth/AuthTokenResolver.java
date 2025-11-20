package com.greenloop.backend.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthTokenResolver {
    private final GoogleTokenVerifierService googleVerifier;
    private final LocalJwtService localJwtService;

    public AuthTokenResolver(GoogleTokenVerifierService googleVerifier,
                             LocalJwtService localJwtService) {
        this.googleVerifier = googleVerifier;
        this.localJwtService = localJwtService;
    }

    public AuthenticatedUser resolve(String token) {
        try {
            var gUser = googleVerifier.verify(token);
            return new AuthenticatedUser(gUser.userId(), gUser.email(), gUser.name(), AuthType.GOOGLE);
        } catch (IllegalArgumentException ignored) {
        }

        try {
            Jws<Claims> jws = localJwtService.parseToken(token);
            Claims c = jws.getBody();
            String userId = c.getSubject();
            String email = c.get("email", String.class);
            return new AuthenticatedUser(userId, email, null, AuthType.LOCAL);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
    }

    public record AuthenticatedUser(String userId, String email, String name, AuthType type) {}

    public enum AuthType { GOOGLE, LOCAL }
}

