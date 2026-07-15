package org.openapitools.service;

import org.openapitools.domain.CustomerItemHistoryEntity;
import org.openapitools.repository.CustomerItemHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerItemHistoryService {
    private final CustomerItemHistoryRepository repository;

    public CustomerItemHistoryService(CustomerItemHistoryRepository repository) {
        this.repository = repository;
    }

    public List<CustomerItemHistoryEntity> findAll() {
        return repository.findAll();
    }

    public Optional<CustomerItemHistoryEntity> findById(String id) {
        return repository.findById(id);
    }

    public CustomerItemHistoryEntity save(CustomerItemHistoryEntity entity) {
        return repository.save(entity);
    }

    public Optional<CustomerItemHistoryEntity> update(String id, CustomerItemHistoryEntity entity) {
        if (!repository.existsById(id)) {
            return Optional.empty();
        }

        entity.setId(id);
        return Optional.of(repository.save(entity));
    }

    public boolean deleteById(String id) {
        if (!repository.existsById(id)) {
            return false;
        }

        repository.deleteById(id);
        return true;
    }
}
