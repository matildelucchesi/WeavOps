package org.openapitools.service;

import java.util.List;
import java.util.Optional;
import org.openapitools.domain.LoomProcessHistoryEntity;
import org.openapitools.repository.LoomProcessHistoryRepository;
import org.springframework.stereotype.Service;

@Service
public class LoomProcessHistoryService {
    private final LoomProcessHistoryRepository repository;

    public LoomProcessHistoryService(LoomProcessHistoryRepository repository) {
        this.repository = repository;
    }

    public List<LoomProcessHistoryEntity> findAll() {
        return repository.findAll();
    }

    public Optional<LoomProcessHistoryEntity> findById(String id) {
        return repository.findById(id);
    }

    public LoomProcessHistoryEntity save(LoomProcessHistoryEntity entity) {
        return repository.save(entity);
    }

    public Optional<LoomProcessHistoryEntity> update(String id, LoomProcessHistoryEntity entity) {
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
