package org.openapitools.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.openapitools.domain.UserEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalStateException;

class TokenServiceTest {
    private static final String KEY_ONE = "isolated-test-jwt-key-0123456789abcdef";
    private static final String KEY_TWO = "rotated-test-jwt-key-0123456789abcdef";

    @Test
    void acceptsTokenSignedWithConfiguredSecret() {
        TokenService service = new TokenService(new ObjectMapper(), KEY_ONE, 86400, 31536000);
        UserEntity user = new UserEntity();
        user.setId("user-1");
        user.setUsername("alice");

        assertThat(service.validateToken(service.generateToken(user))).isPresent();
    }

    @Test
    void rotationRejectsTokenSignedWithPreviousSecret() {
        TokenService oldService = new TokenService(new ObjectMapper(), KEY_ONE, 86400, 31536000);
        TokenService rotatedService = new TokenService(new ObjectMapper(), KEY_TWO, 86400, 31536000);
        UserEntity user = new UserEntity();
        user.setId("user-1");
        user.setUsername("alice");

        assertThat(rotatedService.validateToken(oldService.generateToken(user))).isEmpty();
    }

    @Test
    void rejectsMissingShortAndKnownDevelopmentSecrets() {
        for (String secret : new String[]{"", "too-short", "weavops-development-secret-change-before-production", "weavops-test-secret"}) {
            assertThatIllegalStateException()
                    .isThrownBy(() -> new TokenService(new ObjectMapper(), secret, 86400, 31536000))
                    .withMessageContaining("WEAVOPS_JWT_SECRET");
        }
    }
}
