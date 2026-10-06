package org.openapitools.configuration;

import java.nio.charset.StandardCharsets;

public final class AdminCredentialsValidator {
    private static final int MIN_USERNAME_CHARACTERS = 5;
    private static final int MIN_PASSWORD_CHARACTERS = 6;
    private static final int MAX_BCRYPT_PASSWORD_BYTES = 72;

    private AdminCredentialsValidator() {
    }

    public static String normalizeUsername(String username) {
        String normalized = username == null ? "" : username.strip();
        if (normalized.codePointCount(0, normalized.length()) < MIN_USERNAME_CHARACTERS) {
            throw new IllegalArgumentException("Lo username deve contenere almeno 5 caratteri.");
        }
        return normalized;
    }

    public static void validatePassword(char[] password) {
        if (password == null) {
            throw new IllegalArgumentException("La password è obbligatoria.");
        }

        String value = new String(password);
        if (value.codePointCount(0, value.length()) < MIN_PASSWORD_CHARACTERS) {
            throw new IllegalArgumentException("La password deve contenere almeno 6 caratteri.");
        }
        if (value.getBytes(StandardCharsets.UTF_8).length > MAX_BCRYPT_PASSWORD_BYTES) {
            throw new IllegalArgumentException("La password supera il limite di 72 byte supportato da BCrypt.");
        }
    }
}
