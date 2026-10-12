package org.openapitools.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.openapitools.domain.UserEntity;
import org.openapitools.repository.UserRepository;
import org.openapitools.service.TokenService;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final TokenService tokenService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(TokenService tokenService, UserRepository userRepository) {
        this.tokenService = tokenService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authorizationHeader != null && authorizationHeader.startsWith(BEARER_PREFIX)) {
            String token = authorizationHeader.substring(BEARER_PREFIX.length());

            tokenService
                    .validateToken(token)
                    .ifPresent(
                            payload -> {
                                boolean mobileToken = "loom-mobile".equals(payload.purpose());
                                if (!mobileToken && !isCurrentUserToken(payload)) {
                                    return;
                                }
                                UsernamePasswordAuthenticationToken authentication =
                                        new UsernamePasswordAuthenticationToken(
                                                payload,
                                                null,
                                                List.of(
                                                        new SimpleGrantedAuthority(
                                                                mobileToken
                                                                        ? "LOOM_MOBILE"
                                                                        : "USER")));
                                authentication.setDetails(
                                        new WebAuthenticationDetailsSource().buildDetails(request));

                                SecurityContext securityContext =
                                        SecurityContextHolder.createEmptyContext();
                                securityContext.setAuthentication(authentication);
                                SecurityContextHolder.setContext(securityContext);
                            });
        }

        filterChain.doFilter(request, response);
    }

    private boolean isCurrentUserToken(TokenService.TokenPayload payload) {
        if (payload.userId() == null || payload.credentialVersion() == null) {
            return false;
        }
        return userRepository
                .findById(payload.userId())
                .filter(user -> user.getCredentialVersion() == payload.credentialVersion())
                .map(UserEntity::getUsername)
                .filter(payload.username()::equals)
                .isPresent();
    }
}
