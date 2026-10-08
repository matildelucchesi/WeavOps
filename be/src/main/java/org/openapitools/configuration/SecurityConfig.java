package org.openapitools.configuration;

import jakarta.servlet.http.HttpServletResponse;
import org.openapitools.security.JwtAuthenticationFilter;
import org.openapitools.service.MobileTokenAuthorizationService;
import org.openapitools.service.TokenService;
import org.openapitools.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            TokenService tokenService,
            UserRepository userRepository,
            MobileTokenAuthorizationService mobileTokenAuthorizationService
    ) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                        // Operazioni disponibili dalla vista mobile aperta tramite QR code.
                        .requestMatchers(HttpMethod.GET,
                                "/looms/*",
                                "/items/*",
                                "/arrangements/*",
                                "/processes/*",
                                "/loom-logs/loom/*",
                                "/loom-item-assignments/loom/*",
                                "/loom-item-assignments/loom/*/running"
                        ).access(mobileTokenAuthorizationService::authorize)
                        .requestMatchers(HttpMethod.PUT,
                                "/looms/*",
                                "/looms/*/add-pieces",
                                "/loom-item-assignments/*"
                        ).access(mobileTokenAuthorizationService::authorize)
                        .requestMatchers(HttpMethod.POST, "/looms/*/knotting")
                        .access(mobileTokenAuthorizationService::authorize)
                        .requestMatchers(
                                "/",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs",
                                "/v3/api-docs/**"
                        ).permitAll()
                        .anyRequest().hasAuthority("USER")
                )
                .exceptionHandling(exception -> exception.authenticationEntryPoint(
                        (request, response, authException) ->
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED)
                ))
                .addFilterBefore(new JwtAuthenticationFilter(tokenService, userRepository), UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            throw new UsernameNotFoundException(username);
        };
    }
}
