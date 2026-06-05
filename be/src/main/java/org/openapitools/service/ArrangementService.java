package org.openapitools.service;

import org.openapitools.domain.ArrangementEntity;
import org.openapitools.repository.ArrangementRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ArrangementService {
    private final ArrangementRepository repository;

    public ArrangementService(ArrangementRepository repository) {
        this.repository = repository;
    }

    public List<ArrangementEntity> findAll() {
        return repository.findAll();
    }

    public ArrangementEntity save(ArrangementEntity arrangement) {
        return repository.save(arrangement);
    }

    public Optional<ArrangementEntity> findById(String id){
        return repository.findById(id);
    }

    public Optional<ArrangementEntity> update(String id, ArrangementEntity entity){
        if (!repository.existsById(id)) {
            return Optional.empty();
        }
        entity.setId(id);
        return Optional.of(repository.save(entity));
    }

    public boolean deleteById(String id){
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    public boolean existsById(String id){
        return repository.existsById(id);
    }
}
