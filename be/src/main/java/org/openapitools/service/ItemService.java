package org.openapitools.service;

import org.openapitools.domain.ItemEntity;
import org.openapitools.repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItemService {
    private final ItemRepository repository;

    public ItemService(ItemRepository repository) {
        this.repository = repository;
    }

    public List<ItemEntity> findAll() {
        return repository.findAll();
    }

    public ItemEntity save(ItemEntity item) {
        return repository.save(item);
    }

    public Optional<ItemEntity> findById(String id){
        return repository.findById(id);
    }

    public Optional<ItemEntity> update(String id, ItemEntity entity){
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
