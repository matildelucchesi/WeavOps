package org.openapitools.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.openapitools.domain.UserEntity;
import org.openapitools.repository.UserRepository;
import org.openapitools.service.TokenService;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

class JwtAuthenticationFilterTest {
    private static final String SECRET = "isolated-test-jwt-key-0123456789abcdef";

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void rejectsTokenWhenUserHasBeenDeleted() throws Exception {
        UserRepository repository = mock(UserRepository.class);
        UserEntity user = user(0);
        when(repository.findById("user-1")).thenReturn(Optional.empty());

        assertUnauthenticated(user, repository);
    }

    @Test
    void rejectsTokenWhenPasswordChangeAdvancedCredentialVersion() throws Exception {
        UserRepository repository = mock(UserRepository.class);
        UserEntity user = user(0);
        when(repository.findById("user-1")).thenReturn(Optional.of(user(1)));

        assertUnauthenticated(user, repository);
    }

    @Test
    void acceptsTokenWhenUserAndCredentialVersionAreCurrent() throws Exception {
        UserRepository repository = mock(UserRepository.class);
        UserEntity user = user(2);
        when(repository.findById("user-1")).thenReturn(Optional.of(user(2)));
        MockHttpServletRequest request = request(user);

        new JwtAuthenticationFilter(tokenService(), repository)
                .doFilter(request, new MockHttpServletResponse(), mock(FilterChain.class));

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
    }

    private void assertUnauthenticated(UserEntity user, UserRepository repository)
            throws Exception {
        new JwtAuthenticationFilter(tokenService(), repository)
                .doFilter(request(user), new MockHttpServletResponse(), mock(FilterChain.class));

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    private MockHttpServletRequest request(UserEntity user) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + tokenService().generateToken(user));
        return request;
    }

    private UserEntity user(long credentialVersion) {
        UserEntity user = new UserEntity();
        user.setId("user-1");
        user.setUsername("alice");
        user.setCredentialVersion(credentialVersion);
        return user;
    }

    private TokenService tokenService() {
        return new TokenService(new ObjectMapper(), SECRET, 86400, 31536000);
    }
}
