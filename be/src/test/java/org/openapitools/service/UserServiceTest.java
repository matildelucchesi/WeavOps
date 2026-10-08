package org.openapitools.service;

import org.junit.jupiter.api.Test;
import org.openapitools.domain.UserEntity;
import org.openapitools.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceTest {
    @Test
    void changingPasswordIncrementsCredentialVersion() {
        UserRepository repository = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        UserService service = new UserService(repository, encoder);
        UserEntity current = user(4);
        when(repository.findById("user-1")).thenReturn(Optional.of(current));
        when(encoder.encode("new-password")).thenReturn("new-hash");
        when(repository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        UserEntity update = new UserEntity();
        update.setPassword("new-password");

        UserEntity saved = service.update("user-1", update).orElseThrow();

        assertThat(saved.getCredentialVersion()).isEqualTo(5);
        assertThat(saved.getPassword()).isEqualTo("new-hash");
    }

    @Test
    void profileUpdatePreservesCredentialVersionAndPassword() {
        UserRepository repository = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        UserService service = new UserService(repository, encoder);
        UserEntity current = user(4);
        when(repository.findById("user-1")).thenReturn(Optional.of(current));
        when(repository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        UserEntity update = new UserEntity();
        update.setFirstName("Alice");

        UserEntity saved = service.update("user-1", update).orElseThrow();

        assertThat(saved.getCredentialVersion()).isEqualTo(4);
        assertThat(saved.getPassword()).isEqualTo("existing-hash");
        verifyNoInteractions(encoder);
    }

    private UserEntity user(long credentialVersion) {
        UserEntity user = new UserEntity();
        user.setId("user-1");
        user.setUsername("alice");
        user.setPassword("existing-hash");
        user.setCredentialVersion(credentialVersion);
        return user;
    }
}
