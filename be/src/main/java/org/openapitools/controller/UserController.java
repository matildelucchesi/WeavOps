package org.openapitools.controller;

import org.openapitools.api.UsersApi;
import org.openapitools.mapper.UserMapper;
import org.openapitools.model.User;
import org.openapitools.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.util.List;

@RestController
public class UserController implements UsersApi {

    private final UserService service;
    private final UserMapper mapper;

    public UserController(UserService service, UserMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<User> getUserById(@PathVariable("id") String id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toDto(service.save(mapper.toEntity(user))));
    }

    @Override
    public ResponseEntity<User> updateUser(@PathVariable("id") String id, @Valid @RequestBody User user) {
        return service.update(id, mapper.toEntity(user))
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> deleteUser(@PathVariable("id") String id) {
        return service.deleteById(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}