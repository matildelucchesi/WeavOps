package org.openapitools.service;

import org.openapitools.domain.CustomerEntity;
import org.openapitools.domain.LoomEntity;
import org.openapitools.repository.LoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class LoomService {
    private final LoomRepository repository;

    public LoomService(LoomRepository repository) {
        this.repository = repository;
    }

    public List<LoomEntity> findAll() {
        return repository.findAll();
    }

    public LoomEntity save(LoomEntity loom) {
        return repository.save(loom);
    }

    public Optional<LoomEntity> findById(String id){
        return repository.findById(id);
    }

    public Optional<LoomEntity> findBySerialNumber(String serialNumber){
        return repository.findBySerialNumber(serialNumber);
    }

    public Optional<LoomEntity> update(String id, LoomEntity entity){
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

    @Transactional(rollbackFor = Exception.class)
    public int deleteByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }

        List<String> sanitizedIds = ids.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(id -> !id.isEmpty())
                .distinct()
                .toList();

        if (sanitizedIds.isEmpty()) {
            return 0;
        }

        List<LoomEntity> looms = new ArrayList<>();
        repository.findAllById(sanitizedIds).forEach(looms::add);
        repository.deleteAll(looms);

        return looms.size();
    }
}

