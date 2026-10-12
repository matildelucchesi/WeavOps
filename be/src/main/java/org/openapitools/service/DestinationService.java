package org.openapitools.service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import org.openapitools.domain.DestinationEntity;
import org.openapitools.repository.CustomerRepository;
import org.openapitools.repository.DestinationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DestinationService {
    private final DestinationRepository repository;
    private final CustomerRepository customerRepository;

    public DestinationService(
            DestinationRepository repository, CustomerRepository customerRepository) {
        this.repository = repository;
        this.customerRepository = customerRepository;
    }

    public List<DestinationEntity> findAll() {
        return repository.findAll();
    }

    public Optional<DestinationEntity> findById(String id) {
        return repository.findById(id);
    }

    public DestinationEntity save(DestinationEntity entity) {
        validate(entity);
        entity.setId(null);
        return repository.save(entity);
    }

    public Optional<DestinationEntity> update(String id, DestinationEntity entity) {
        if (!repository.existsById(id)) {
            return Optional.empty();
        }
        validate(entity);
        entity.setId(id);
        return Optional.of(repository.save(entity));
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean deleteById(String id) {
        if (!repository.existsById(id)) {
            return false;
        }
        if (customerRepository.existsByDestinationId(id)) {
            throw new DestinationValidationException(
                    HttpStatus.CONFLICT,
                    "La destinazione è associata a clienti: rimuovere prima le associazioni.");
        }
        repository.deleteById(id);
        return true;
    }

    private void validate(DestinationEntity entity) {
        entity.setName(required(entity.getName(), "Nome azienda").toUpperCase(Locale.ROOT));
        entity.setStreet(required(entity.getStreet(), "Via/piazza").toUpperCase(Locale.ROOT));
        entity.setStreetNumber(
                required(entity.getStreetNumber(), "Numero civico").toUpperCase(Locale.ROOT));
        entity.setCity(required(entity.getCity(), "Comune").toUpperCase(Locale.ROOT));
        entity.setPostalCode(required(entity.getPostalCode(), "CAP"));
        entity.setProvinceCode(
                required(entity.getProvinceCode(), "Sigla provincia").toUpperCase(Locale.ROOT));
        if (!entity.getPostalCode().matches("[0-9]{5}")) {
            throw new DestinationValidationException(
                    HttpStatus.BAD_REQUEST, "Il CAP deve contenere 5 cifre.");
        }
        if (!entity.getProvinceCode().matches("[A-Z]{2}")) {
            throw new DestinationValidationException(
                    HttpStatus.BAD_REQUEST, "La sigla provincia deve contenere 2 lettere.");
        }
    }

    private String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new DestinationValidationException(
                    HttpStatus.BAD_REQUEST, label + " obbligatorio.");
        }
        return value.trim();
    }
}
