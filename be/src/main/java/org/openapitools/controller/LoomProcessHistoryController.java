package org.openapitools.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.openapitools.api.LoomProcessHistoriesApi;
import org.openapitools.mapper.LoomProcessHistoryMapper;
import org.openapitools.model.LoomProcessHistory;
import org.openapitools.service.LoomProcessHistoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoomProcessHistoryController implements LoomProcessHistoriesApi {
    private final LoomProcessHistoryService service;
    private final LoomProcessHistoryMapper mapper;

    public LoomProcessHistoryController(
            LoomProcessHistoryService service, LoomProcessHistoryMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<List<LoomProcessHistory>> getLoomProcessHistories() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<LoomProcessHistory> getLoomProcessHistoryById(
            @PathVariable("id") String id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<LoomProcessHistory> createLoomProcessHistory(
            @Valid @RequestBody LoomProcessHistory loomProcessHistory) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toDto(service.save(mapper.toEntity(loomProcessHistory))));
    }

    @Override
    public ResponseEntity<LoomProcessHistory> updateLoomProcessHistory(
            @PathVariable("id") String id,
            @Valid @RequestBody LoomProcessHistory loomProcessHistory) {
        return service.update(id, mapper.toEntity(loomProcessHistory))
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> deleteLoomProcessHistory(@PathVariable("id") String id) {
        return service.deleteById(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
