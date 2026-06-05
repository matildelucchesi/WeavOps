package org.openapitools.service;

import org.openapitools.domain.CustomerEntity;
import org.openapitools.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {
    private final CustomerRepository repository;

    public CustomerService(CustomerRepository repository) {
        this.repository = repository;
    }

    public List<CustomerEntity> findAll() {
        return repository.findAll();
    }

    public CustomerEntity save(CustomerEntity customer) {
        return repository.save(customer);
    }

    public Optional<CustomerEntity> findById(String id){
        return repository.findById(id);
    }

    public Optional<CustomerEntity> update(String id, CustomerEntity entity){
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
