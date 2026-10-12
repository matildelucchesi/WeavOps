package org.openapitools.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.openapitools.domain.LoomLogEntity;
import org.openapitools.repository.LoomLogRepository;
import org.springframework.stereotype.Service;

@Service
public class LoomLogService {
    private final LoomLogRepository repository;

    public LoomLogService(LoomLogRepository repository) {
        this.repository = repository;
    }

    public List<LoomLogEntity> findAll() {
        return repository.findAll();
    }

    public List<LoomLogEntity> findByLoomIdOrderByCreatedAtDesc(String loomId) {
        return repository.findByLoomIdOrderByCreatedAtDesc(loomId);
    }

    public Optional<LoomLogEntity> findById(String id) {
        return repository.findById(id);
    }

    public LoomLogEntity save(LoomLogEntity entity) {
        if (entity.getId() == null && entity.getCreatedAt() == null) {
            entity.setCreatedAt(Instant.now());
        }
        return repository.save(entity);
    }

    public Optional<LoomLogEntity> update(String id, LoomLogEntity entity) {
        return repository
                .findById(id)
                .map(
                        existing -> {
                            entity.setId(id);
                            entity.setCreatedAt(existing.getCreatedAt());
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
}
