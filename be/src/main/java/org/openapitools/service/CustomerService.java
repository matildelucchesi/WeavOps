package org.openapitools.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.openapitools.domain.CustomerEntity;
import org.openapitools.domain.ReferentEntity;
import org.openapitools.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

    private static final String SAVE_ERROR_MESSAGE =
            "Errore durante il salvataggio del customer. Nessun dato e stato salvato.";

    @Autowired private ReferentService referentService;

    @Autowired private org.openapitools.repository.DestinationRepository destinationRepository;

    private final CustomerRepository repository;

    public CustomerService(CustomerRepository repository) {
        this.repository = repository;
    }

    public List<CustomerEntity> findAll() {
        return repository.findAll();
    }

    @Transactional(rollbackFor = Exception.class)
    public CustomerEntity save(CustomerEntity customer) {
        validateCustomerData(customer);
        List<ReferentEntity> savedReferents = new ArrayList<>();
        CustomerEntity savedCustomer = null;

        try {
            List<ReferentEntity> referents = customer.getReferents();
            if (referents != null) {
                for (ReferentEntity referent : referents) {
                    if (!Objects.equals(referent.getFirstName(), "")
                            && !Objects.equals(referent.getLastName(), "")) {
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
            RuntimeException originalException) {
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

    public Optional<CustomerEntity> findById(String id) {
        return repository.findById(id);
    }

    public Optional<CustomerEntity> findByName(String name) {
        return repository.findByName(name);
    }

    public Optional<CustomerEntity> update(String id, CustomerEntity entity) {
        if (!repository.existsById(id)) {
            return Optional.empty();
        }
        validateCustomerData(entity);
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

    @Transactional(rollbackFor = Exception.class)
    public int deleteByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }

        List<String> sanitizedIds =
                ids.stream()
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

    private String trimAddress(String value) {
        return value == null ? "" : value.trim();
    }

    private void validateCustomerData(CustomerEntity entity) {
        String vatNumber = entity.getVatNumber() == null ? "" : entity.getVatNumber().trim();
        if (!vatNumber.matches("[A-Za-z0-9]+")) {
            throw new DestinationValidationException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "La partita IVA è obbligatoria e può contenere solo lettere e cifre.");
        }
        entity.setVatNumber(vatNumber);
        if (entity.getName() == null || entity.getName().isBlank()) {
            throw new DestinationValidationException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Il nome cliente è obbligatorio.");
        }
        entity.setName(entity.getName().trim().toUpperCase(java.util.Locale.ROOT));
        entity.setStreet(trimAddress(entity.getStreet()).toUpperCase(java.util.Locale.ROOT));
        entity.setStreetNumber(
                trimAddress(entity.getStreetNumber()).toUpperCase(java.util.Locale.ROOT));
        entity.setCity(trimAddress(entity.getCity()).toUpperCase(java.util.Locale.ROOT));
        entity.setPostalCode(trimAddress(entity.getPostalCode()));
        entity.setProvinceCode(
                trimAddress(entity.getProvinceCode()).toUpperCase(java.util.Locale.ROOT));
        if (!entity.getPostalCode().isEmpty() && !entity.getPostalCode().matches("[0-9]{5}")) {
            throw new DestinationValidationException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Il CAP deve contenere 5 cifre.");
        }
        if (!entity.getProvinceCode().isEmpty() && !entity.getProvinceCode().matches("[A-Z]{2}")) {
            throw new DestinationValidationException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "La sigla provincia deve contenere 2 lettere.");
        }
        List<String> ids =
                entity.getDestinationIds() == null ? List.of() : entity.getDestinationIds();
        if (ids.stream().anyMatch(value -> value == null || value.isBlank())) {
            throw new DestinationValidationException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Identificativo destinazione non valido.");
        }
        List<String> normalizedIds = ids.stream().map(String::trim).distinct().toList();
        for (String destinationId : normalizedIds) {
            if (!destinationRepository.existsById(destinationId)) {
                throw new DestinationValidationException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Una destinazione selezionata non esiste più.");
            }
        }
        entity.setDestinationIds(new ArrayList<>(normalizedIds));
    }

    public boolean existsById(String id) {
        return repository.existsById(id);
    }
}
