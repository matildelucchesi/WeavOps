package org.openapitools.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.openapitools.domain.UserEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class TokenService {

    private final ObjectMapper objectMapper;
    private final String jwtSecret;
    private final long expirationSeconds;

    public TokenService(
            ObjectMapper objectMapper,
            @Value("${app.auth.jwt-secret}") String jwtSecret,
            @Value("${app.auth.jwt-expiration-seconds:86400}") long expirationSeconds
    ) {
        this.objectMapper = objectMapper;
        this.jwtSecret = jwtSecret;
        this.expirationSeconds = expirationSeconds;
    }

    public String generateToken(UserEntity user) {
        Instant now = Instant.now();

        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", user.getUsername());
        payload.put("userId", user.getId());
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", now.plusSeconds(expirationSeconds).getEpochSecond());

        String unsignedToken = base64UrlEncode(header) + "." + base64UrlEncode(payload);
        return unsignedToken + "." + sign(unsignedToken);
    }

    public Optional<TokenPayload> validateToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return Optional.empty();
        }

        String unsignedToken = parts[0] + "." + parts[1];
        if (!signatureMatches(parts[2], sign(unsignedToken))) {
            return Optional.empty();
        }

        try {
            Map<String, Object> header = readBase64UrlJson(parts[0]);
            if (!"HS256".equals(header.get("alg"))) {
                return Optional.empty();
            }

            Map<String, Object> payload = readBase64UrlJson(parts[1]);
            String username = asString(payload.get("sub"));
            String userId = asString(payload.get("userId"));
            Long expiresAt = asLong(payload.get("exp"));

            if (username == null || expiresAt == null || expiresAt <= Instant.now().getEpochSecond()) {
                return Optional.empty();
            }

            return Optional.of(new TokenPayload(username, userId));
        } catch (Exception exception) {
            return Optional.empty();
        }
    }

    private String base64UrlEncode(Object value) {
        try {
            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(objectMapper.writeValueAsBytes(value));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to serialize JWT content", exception);
        }
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(key);
            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to sign JWT token", exception);
        }
    }

    private boolean signatureMatches(String actualSignature, String expectedSignature) {
        return MessageDigest.isEqual(
                actualSignature.getBytes(StandardCharsets.UTF_8),
                expectedSignature.getBytes(StandardCharsets.UTF_8)
        );
    }

    private Map<String, Object> readBase64UrlJson(String value) throws IOException {
        byte[] bytes = Base64.getUrlDecoder().decode(value);
        return objectMapper.readValue(bytes, new TypeReference<>() {
        });
    }

    private String asString(Object value) {
        return value instanceof String stringValue ? stringValue : null;
    }

    private Long asLong(Object value) {
        if (value instanceof Number numberValue) {
            return numberValue.longValue();
        }
        return null;
    }

    public record TokenPayload(String username, String userId) {
    }
}
