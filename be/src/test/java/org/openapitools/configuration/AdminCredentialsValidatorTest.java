package org.openapitools.configuration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

import org.junit.jupiter.api.Test;

class AdminCredentialsValidatorTest {
    @Test
    void trimsUsernameAndAcceptsFiveCharacters() {
        assertThat(AdminCredentialsValidator.normalizeUsername("  alice ")).isEqualTo("alice");
    }

    @Test
    void rejectsUsernameShorterThanFiveCharacters() {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> AdminCredentialsValidator.normalizeUsername(" abcd "));
    }

    @Test
    void acceptsSixCharacterPasswordAndPreservesSpaces() {
        char[] password = " abcd ".toCharArray();
        AdminCredentialsValidator.validatePassword(password);
        assertThat(password).containsExactly(' ', 'a', 'b', 'c', 'd', ' ');
    }

    @Test
    void rejectsShortAndOverlongBcryptPasswords() {
        assertThatIllegalArgumentException()
                .isThrownBy(
                        () -> AdminCredentialsValidator.validatePassword("abcde".toCharArray()));
        assertThatIllegalArgumentException()
                .isThrownBy(
                        () ->
                                AdminCredentialsValidator.validatePassword(
                                        "é".repeat(37).toCharArray()));
    }
}
