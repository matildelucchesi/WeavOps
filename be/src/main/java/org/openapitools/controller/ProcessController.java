package org.openapitools.controller;

import org.openapitools.api.ProcessesApi;
import org.openapitools.domain.ProcessEntity;
import org.openapitools.mapper.ProcessMapper;
import org.openapitools.model.Process;
import org.openapitools.service.ProcessService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.util.List;

@RestController
public class ProcessController implements ProcessesApi {

    private final ProcessService service;
    private final ProcessMapper mapper;

    public ProcessController(ProcessService service, ProcessMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<List<Process>> getProcesses() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<Process> getProcessById(@PathVariable("id") String id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Process> createProcess(@Valid @RequestBody Process process) {
        ProcessEntity entity = mapper.toEntity(process);
        entity.setDays(service.calculateDays(entity));
        process.setDays(entity.getDays());
        entity = mapper.toEntity(process);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toDto(service.save(entity)));
    }

    @Override
    public ResponseEntity<Process> updateProcess(@PathVariable("id") String id, @Valid @RequestBody Process process) {
        ProcessEntity entity = mapper.toEntity(process);
        entity.setDays(service.calculateDays(entity));
        process.setDays(entity.getDays());
        process.setExpectedEndDate(service.calculateExpectedEndDate(entity));
        entity = mapper.toEntity(process);

        return service.update(id, entity)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> deleteProcess(@PathVariable("id") String id) {
        return service.deleteById(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
