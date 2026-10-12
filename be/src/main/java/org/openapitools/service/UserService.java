package org.openapitools.service;

import java.util.List;
import java.util.Optional;
import org.openapitools.domain.UserEntity;
import org.openapitools.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserEntity> findAll() {
        return repository.findAll();
    }

    public UserEntity save(UserEntity user) {
        if (user.getId() != null) {
            repository
                    .findById(user.getId())
                    .ifPresent(
                            existing ->
                                    user.setCredentialVersion(existing.getCredentialVersion() + 1));
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return repository.save(user);
    }

    public Optional<UserEntity> findById(String id) {
        return repository.findById(id);
    }

    public Optional<UserEntity> authenticate(String username, String password) {
        if (username == null || password == null) {
            return Optional.empty();
        }

        return repository
                .findByUsername(username)
                .filter(user -> user.getPassword() != null)
                .filter(user -> passwordEncoder.matches(password, user.getPassword()));
    }

    public Optional<UserEntity> update(String id, UserEntity entity) {
        return repository
                .findById(id)
                .map(
                        existing -> {
                            entity.setId(id);
                            if (entity.getCompanyName() == null) {
                                entity.setCompanyName(existing.getCompanyName());
                            }
                            if (entity.getVatNumber() == null) {
                                entity.setVatNumber(existing.getVatNumber());
                            }

                            if (entity.getPassword() == null || entity.getPassword().isBlank()) {
                                entity.setPassword(existing.getPassword());
                                entity.setCredentialVersion(existing.getCredentialVersion());
                            } else {
                                entity.setPassword(passwordEncoder.encode(entity.getPassword()));
                                entity.setCredentialVersion(existing.getCredentialVersion() + 1);
                            }

                            return repository.save(entity);
                        });
    }

    public boolean deleteById(String id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    public boolean existsById(String id) {
        return repository.existsById(id);
    }
}
