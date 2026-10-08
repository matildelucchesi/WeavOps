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
    private final long mobileExpirationSeconds;

    public TokenService(
            ObjectMapper objectMapper,
            @Value("${app.auth.jwt-secret}") String jwtSecret,
            @Value("${app.auth.jwt-expiration-seconds:86400}") long expirationSeconds,
            @Value("${app.auth.mobile-token-expiration-seconds:31536000}") long mobileExpirationSeconds
    ) {
        validateJwtSecret(jwtSecret);
        this.objectMapper = objectMapper;
        this.jwtSecret = jwtSecret;
        this.expirationSeconds = expirationSeconds;
        this.mobileExpirationSeconds = mobileExpirationSeconds;
    }

    private void validateJwtSecret(String secret) {
        int secretLength = secret == null ? 0 : secret.getBytes(StandardCharsets.UTF_8).length;
        if (secret == null || secret.isBlank() || secretLength < 32
                || "weavops-development-secret-change-before-production".equals(secret)
                || "weavops-test-secret".equals(secret)) {
            throw new IllegalStateException(
                    "WEAVOPS_JWT_SECRET è obbligatorio e deve contenere almeno 32 byte UTF-8. "
                            + "Genera un nuovo segreto e configuralo fuori dal repository.");
        }
    }

    public String generateToken(UserEntity user) {
        Instant now = Instant.now();

        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", user.getUsername());
        payload.put("userId", user.getId());
        payload.put("credentialVersion", user.getCredentialVersion());
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", now.plusSeconds(expirationSeconds).getEpochSecond());

        String unsignedToken = base64UrlEncode(header) + "." + base64UrlEncode(payload);
        return unsignedToken + "." + sign(unsignedToken);
    }

    public String generateMobileToken(String loomId) {
        Instant now = Instant.now();

        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", "loom-mobile");
        payload.put("purpose", "loom-mobile");
        payload.put("loomId", loomId);
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", now.plusSeconds(mobileExpirationSeconds).getEpochSecond());

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
            String purpose = asString(payload.get("purpose"));
            String loomId = asString(payload.get("loomId"));
            Long expiresAt = asLong(payload.get("exp"));
            Long credentialVersion = asLong(payload.get("credentialVersion"));

            boolean validMobileToken = "loom-mobile".equals(purpose) && loomId != null && !loomId.isBlank();
            boolean validUserToken = purpose == null && username != null && userId != null
                    && credentialVersion != null;
            if ((!validMobileToken && !validUserToken)
                    || expiresAt == null || expiresAt <= Instant.now().getEpochSecond()) {
                return Optional.empty();
            }

            return Optional.of(new TokenPayload(username, userId, purpose, loomId, credentialVersion));
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

    public record TokenPayload(
            String username,
            String userId,
            String purpose,
            String loomId,
            Long credentialVersion
    ) {
    }
}
