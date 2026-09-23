package org.openapitools.controller;

import jakarta.validation.Valid;
import org.openapitools.api.LoomLogsApi;
import org.openapitools.mapper.LoomLogMapper;
import org.openapitools.model.LoomLog;
import org.openapitools.service.LoomLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class LoomLogController implements LoomLogsApi {
    private final LoomLogService service;
    private final LoomLogMapper mapper;

    public LoomLogController(LoomLogService service, LoomLogMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<List<LoomLog>> getLoomLogs() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/loom-logs/loom/{loomId}")
    public ResponseEntity<List<LoomLog>> getLoomLogsByLoomId(@PathVariable String loomId) {
        return ResponseEntity.ok(service.findByLoomIdOrderByCreatedAtDesc(loomId).stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<LoomLog> createLoomLog(@Valid @RequestBody LoomLog loomLog) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toDto(service.save(mapper.toEntity(loomLog))));
    }

    @Override
    public ResponseEntity<LoomLog> getLoomLogById(@PathVariable("id") String id) {
        return service.findById(id).map(mapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<LoomLog> updateLoomLog(@PathVariable("id") String id, @Valid @RequestBody LoomLog loomLog) {
        return service.update(id, mapper.toEntity(loomLog)).map(mapper::toDto).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> deleteLoomLog(@PathVariable("id") String id) {
        return service.deleteById(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
