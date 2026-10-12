package org.openapitools.configuration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.openapitools.domain.UserEntity;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.crypto.password.PasswordEncoder;

class AdminProvisioningServiceTest {
    private final MongoTemplate mongoTemplate = mock(MongoTemplate.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final AdminProvisioningService service =
            new AdminProvisioningService(
                    mongoTemplate, passwordEncoder, "mongodb://localhost:27017/weavops");

    @Test
    void insertsOnlyFirstUserWithNormalizedUsernameAndEncodedPassword() {
        when(mongoTemplate.count(any(Query.class), eq(UserEntity.class))).thenReturn(0L);
        when(passwordEncoder.encode("secret1")).thenReturn("bcrypt-hash");

        service.provisionUser("  alice ", "secret1".toCharArray());

        verify(mongoTemplate)
                .upsert(any(Query.class), any(Update.class), eq("weavops_provisioning"));
        var inserted = org.mockito.ArgumentCaptor.forClass(UserEntity.class);
        verify(mongoTemplate).insert(inserted.capture());
        assertThat(inserted.getValue().getUsername()).isEqualTo("alice");
        assertThat(inserted.getValue().getPassword()).isEqualTo("bcrypt-hash");
        assertThat(inserted.getValue().getId()).isNull();
    }

    @Test
    void refusesExistingUsersWithoutInsertingOrChangingAnAccount() {
        when(mongoTemplate.count(any(Query.class), eq(UserEntity.class))).thenReturn(1L);

        assertThatThrownBy(() -> service.provisionUser("alice", "secret1".toCharArray()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Esistono già utenti");

        verify(mongoTemplate, never()).insert(any(UserEntity.class));
    }
}
