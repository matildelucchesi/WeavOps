package org.openapitools.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.openapitools.domain.CertificationEntity;
import org.openapitools.model.Certification;
import org.openapitools.repository.CertificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class CertificationController {
    private final CertificationRepository repository;

    public CertificationController(CertificationRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/certifications")
    public List<Certification> getCertifications() {
        return repository.findAll().stream()
                .map(
                        entity ->
                                new Certification(entity.getValue(), entity.getDescription())
                                        .id(entity.getId()))
                .toList();
    }

    @PostMapping("/certifications")
    @ResponseStatus(HttpStatus.CREATED)
    public Certification createCertification(@Valid @RequestBody Certification certification) {
        String value =
                certification.getValue() == null
                        ? ""
                        : certification.getValue().trim().toUpperCase(java.util.Locale.ROOT);
        String description =
                certification.getDescription() == null ? "" : certification.getDescription().trim();
        if (value.isEmpty() || description.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Codice e descrizione sono obbligatori");
        }
        if (repository.findAll().stream()
                .anyMatch(entity -> value.equalsIgnoreCase(entity.getValue()))) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Codice certificazione già presente");
        }
        CertificationEntity entity = new CertificationEntity();
        entity.setValue(value);
        entity.setDescription(description);
        entity = repository.save(entity);
        return new Certification(entity.getValue(), entity.getDescription()).id(entity.getId());
    }
}
