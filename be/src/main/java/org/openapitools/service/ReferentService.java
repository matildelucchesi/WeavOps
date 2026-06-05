package org.openapitools.service;

import org.openapitools.domain.ReferentEntity;
import org.openapitools.repository.ReferentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReferentService {
    private final ReferentRepository repository;

    public ReferentService(ReferentRepository repository) {
        this.repository = repository;
    }

    public List<ReferentEntity> findAll() {
        return repository.findAll();
    }

    public ReferentEntity save(ReferentEntity referent) {
        return repository.save(referent);
    }

    public Optional<ReferentEntity> findById(String id){
        return repository.findById(id);
    }

    public Optional<ReferentEntity> update(String id, ReferentEntity entity){
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
