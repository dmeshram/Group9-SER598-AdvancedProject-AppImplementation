package com.greenloop.backend.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
public class LocalJwtService {
    private final String jwtSecret;
    private final String issuer;

    public LocalJwtService(
            @Value("${auth.jwt-secret}") String jwtSecret,
            @Value("${auth.jwt-issuer}") String issuer) {
        this.jwtSecret = jwtSecret;
        this.issuer = issuer;
    }

    public String generateToken(Long userId, String email) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(userId.toString())
                .claim("email", email)
                .setIssuer(issuer)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plus(7, ChronoUnit.DAYS)))
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                .compact();
    }

    public Jws<Claims> parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                .requireIssuer(issuer)
                .build()
                .parseClaimsJws(token);
    }
}
