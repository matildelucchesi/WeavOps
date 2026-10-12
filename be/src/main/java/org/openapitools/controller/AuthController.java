package org.openapitools.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.openapitools.mapper.UserMapper;
import org.openapitools.model.User;
import org.openapitools.service.TokenService;
import org.openapitools.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final TokenService tokenService;

    public AuthController(
            UserService userService, UserMapper userMapper, TokenService tokenService) {
        this.userService = userService;
        this.userMapper = userMapper;
        this.tokenService = tokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return userService
                .authenticate(request.username(), request.password())
                .map(
                        user ->
                                ResponseEntity.ok(
                                        new LoginResponse(
                                                tokenService.generateToken(user),
                                                "Bearer",
                                                userMapper.toDto(user))))
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {
    }

    public record LoginResponse(String token, String tokenType, User user) {
    }
}
