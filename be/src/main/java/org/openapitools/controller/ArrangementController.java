package org.openapitools.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.openapitools.api.ArrangementsApi;
import org.openapitools.mapper.ArrangementMapper;
import org.openapitools.model.Arrangement;
import org.openapitools.service.ArrangementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ArrangementController implements ArrangementsApi {

    private final ArrangementService service;
    private final ArrangementMapper mapper;

    public ArrangementController(ArrangementService service, ArrangementMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<List<Arrangement>> getArrangements() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<Arrangement> getArrangementById(@PathVariable("id") String id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Arrangement> createArrangement(
            @Valid @RequestBody Arrangement arrangement) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toDto(service.save(mapper.toEntity(arrangement))));
    }

    @Override
    public ResponseEntity<Arrangement> updateArrangement(
            @PathVariable("id") String id, @Valid @RequestBody Arrangement arrangement) {
        return service.update(id, mapper.toEntity(arrangement))
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> deleteArrangement(@PathVariable("id") String id) {
        return service.deleteById(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
