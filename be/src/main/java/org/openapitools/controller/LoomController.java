package org.openapitools.controller;

import org.openapitools.api.LoomsApi;
import org.openapitools.mapper.LoomMapper;
import org.openapitools.model.Loom;
import org.openapitools.service.LoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.util.List;

@RestController
public class LoomController implements LoomsApi {

    private final LoomService service;
    private final LoomMapper mapper;

    public LoomController(LoomService service, LoomMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<List<Loom>> getLooms() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<Loom> getLoomById(@PathVariable("id") String id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Loom> createLoom(@Valid @RequestBody Loom loom) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toDto(service.save(mapper.toEntity(loom))));
    }

    @Override
    public ResponseEntity<Loom> updateLoom(@PathVariable("id") String id, @Valid @RequestBody Loom loom) {
        return service.update(id, mapper.toEntity(loom))
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> deleteLoom(@PathVariable("id") String id) {
        return service.deleteById(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}