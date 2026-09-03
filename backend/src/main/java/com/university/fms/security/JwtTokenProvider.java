package com.university.fms.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    // ── Key ──────────────────────────────────────────────────────
    private SecretKey signingKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ── Generate ─────────────────────────────────────────────────
    public String generateAccessToken(Authentication auth) {
        return buildToken(auth.getName(), jwtExpirationMs);
    }

    public String generateRefreshToken(Authentication auth) {
        return buildToken(auth.getName(), refreshExpirationMs);
    }

    private String buildToken(String subject, long expiryMs) {
        return Jwts.builder()
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiryMs))
                .signWith(signingKey())
                .compact();
    }

    // ── Extract ──────────────────────────────────────────────────
    public String getEmailFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    public Date getExpirationFromToken(String token) {
        return parseClaims(token).getExpiration();
    }

    // ── Validate ─────────────────────────────────────────────────
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e)  { log.warn("JWT expired: {}", e.getMessage()); }
          catch (MalformedJwtException e) { log.warn("Malformed JWT: {}", e.getMessage()); }
          catch (JwtException e)          { log.warn("Invalid JWT: {}", e.getMessage()); }
        return false;
    }

    public boolean validateTokenForUser(String token, UserDetails userDetails) {
        return getEmailFromToken(token).equals(userDetails.getUsername()) && validateToken(token);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
