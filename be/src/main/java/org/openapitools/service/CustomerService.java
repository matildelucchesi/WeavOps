package org.openapitools.service;

import org.openapitools.domain.CustomerEntity;
import org.openapitools.domain.ReferentEntity;
import org.openapitools.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class CustomerService {

    private static final String SAVE_ERROR_MESSAGE = "Errore durante il salvataggio del customer. Nessun dato e stato salvato.";

    @Autowired
    private ReferentService referentService;

    private final CustomerRepository repository;

    public CustomerService(CustomerRepository repository) {
        this.repository = repository;
    }

    public List<CustomerEntity> findAll() {
        return repository.findAll();
    }

    @Transactional(rollbackFor = Exception.class)
    public CustomerEntity save(CustomerEntity customer) {
        List<ReferentEntity> savedReferents = new ArrayList<>();
        CustomerEntity savedCustomer = null;

        try {
            List<ReferentEntity> referents = customer.getReferents();
            if (referents != null) {
                for (ReferentEntity referent : referents) {
                    if(!Objects.equals(referent.getFirstName(), "") && !Objects.equals(referent.getLastName(), "")) {
                        savedReferents.add(this.referentService.save(referent));
                    }
                }
                customer.setReferents(savedReferents);
            }

            savedCustomer = repository.save(customer);
            return savedCustomer;
        } catch (RuntimeException ex) {
            rollbackSavedEntities(savedCustomer, savedReferents, ex);
            throw new CustomerSaveException(buildSaveErrorMessage(ex), ex);
        }
    }

    private void rollbackSavedEntities(
            CustomerEntity savedCustomer,
            List<ReferentEntity> savedReferents,
            RuntimeException originalException
    ) {
        try {
            if (savedCustomer != null && savedCustomer.getId() != null) {
                repository.deleteById(savedCustomer.getId());
            }

            for (ReferentEntity referent : savedReferents) {
                if (referent.getId() != null) {
                    referentService.deleteById(referent.getId());
                }
            }
        } catch (RuntimeException rollbackException) {
            originalException.addSuppressed(rollbackException);
        }
    }

    private String buildSaveErrorMessage(RuntimeException ex) {
        return ex.getMessage() == null || ex.getMessage().isBlank()
                ? SAVE_ERROR_MESSAGE
                : SAVE_ERROR_MESSAGE + " Dettaglio: " + ex.getMessage();
    }

    public Optional<CustomerEntity> findById(String id){
        return repository.findById(id);
    }

    public Optional<CustomerEntity> findByName(String name){
        return repository.findByName(name);
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

        List<CustomerEntity> customers = new ArrayList<>();
        repository.findAllById(sanitizedIds).forEach(customers::add);
        repository.deleteAll(customers);

        return customers.size();
    }

    public boolean existsById(String id){
        return repository.existsById(id);
    }
}
