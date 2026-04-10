package com.example.demo.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}") private String SECRET;
    @Value("${jwt.expiration}") private long EXPIRATION;
    @Value("${jwt.refresh-expiration}") private long REFRESH_EXPIRATION;

    private Key getSignKey() { return Keys.hmacShaKeyFor(SECRET.getBytes()); }

    public String generateToken(String email) {
        return Jwts.builder().setSubject(email).setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getSignKey(), SignatureAlgorithm.HS256).compact();
    }

    public String generateToken(String email, String role) {
        return Jwts.builder().setSubject(email).claim("role", role).setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getSignKey(), SignatureAlgorithm.HS256).compact();
    }

    public String generateRefreshToken(String email) {
        return Jwts.builder().setSubject(email).setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION))
                .signWith(getSignKey(), SignatureAlgorithm.HS256).compact();
    }

    public boolean isTokenExpired(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(getSignKey()).build()
                    .parseClaimsJws(token).getBody().getExpiration().before(new Date());
        } catch (ExpiredJwtException e) { return true; }
    }

    public String extractEmail(String token) {
        return Jwts.parserBuilder().setSigningKey(getSignKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public String extractRole(String token) {
        return Jwts.parserBuilder().setSigningKey(getSignKey()).build()
                .parseClaimsJws(token).getBody().get("role", String.class);
    }

    public boolean validateToken(String token, String email) {
        return extractEmail(token).equals(email);
    }
}