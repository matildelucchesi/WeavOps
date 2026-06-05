package org.openapitools.controller;

import org.openapitools.api.ReferentsApi;
import org.openapitools.mapper.ReferentMapper;
import org.openapitools.model.Referent;
import org.openapitools.service.ReferentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.util.List;

@RestController
public class ReferentController implements ReferentsApi {

    private final ReferentService service;
    private final ReferentMapper mapper;

    public ReferentController(ReferentService service, ReferentMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<List<Referent>> getReferents() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<Referent> getReferentById(@PathVariable("id") String id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Referent> createReferent(@Valid @RequestBody Referent referent) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toDto(service.save(mapper.toEntity(referent))));
    }

    @Override
    public ResponseEntity<Referent> updateReferent(@PathVariable("id") String id, @Valid @RequestBody Referent referent) {
        return service.update(id, mapper.toEntity(referent))
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> deleteReferent(@PathVariable("id") String id) {
        return service.deleteById(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}