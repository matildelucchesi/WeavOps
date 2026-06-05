package org.openapitools.service;

import org.openapitools.domain.ProcessEntity;
import org.openapitools.repository.ProcessRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProcessService {
    private final ProcessRepository repository;

    public ProcessService(ProcessRepository repository) {
        this.repository = repository;
    }

    public List<ProcessEntity> findAll() {
        return repository.findAll();
    }

    public ProcessEntity save(ProcessEntity process) {
        return repository.save(process);
    }

    public Optional<ProcessEntity> findById(String id){
        return repository.findById(id);
    }

    public Optional<ProcessEntity> update(String id, ProcessEntity entity){
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
