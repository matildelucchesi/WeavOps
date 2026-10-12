package org.openapitools.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.openapitools.api.ProcessesApi;
import org.openapitools.domain.ProcessEntity;
import org.openapitools.mapper.ItemMapper;
import org.openapitools.mapper.LoomItemAssignmentMapper;
import org.openapitools.mapper.ProcessMapper;
import org.openapitools.model.AssignedProcessResponse;
import org.openapitools.model.CreateAssignedProcessRequest;
import org.openapitools.model.Process;
import org.openapitools.service.ProcessService;
import org.openapitools.service.ProductionForecastService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProcessController implements ProcessesApi {

    private final ProcessService service;
    private final ProductionForecastService productionForecastService;
    private final ProcessMapper mapper;
    private final LoomItemAssignmentMapper assignmentMapper;
    private final ItemMapper itemMapper;

    public ProcessController(
            ProcessService service,
            ProductionForecastService productionForecastService,
            ProcessMapper mapper,
            LoomItemAssignmentMapper assignmentMapper,
            ItemMapper itemMapper) {
        this.service = service;
        this.productionForecastService = productionForecastService;
        this.mapper = mapper;
        this.assignmentMapper = assignmentMapper;
        this.itemMapper = itemMapper;
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

        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(service.create(entity)));
    }

    @PostMapping("/items/{itemId}/processes")
    public ResponseEntity<AssignedProcessResponse> createAssignedProcess(
            @PathVariable String itemId, @Valid @RequestBody CreateAssignedProcessRequest request) {
        ProcessService.AssignedProcess created =
                service.createAssignedProcess(itemId, mapper.toEntity(request.getProcess()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        new AssignedProcessResponse(
                                mapper.toDto(created.process()),
                                assignmentMapper.toDto(created.assignment()),
                                itemMapper.toDto(created.item())));
    }

    @Override
    public ResponseEntity<Process> updateProcess(
            @PathVariable("id") String id, @Valid @RequestBody Process process) {
        ProcessEntity entity = mapper.toEntity(process);
        entity.setDays(service.calculateDays(entity));
        entity.setExpectedEndDate(null);

        return service.update(id, entity)
                .map(
                        updatedProcess -> {
                            productionForecastService.recalculateProductionForecastForProcess(
                                    updatedProcess.getId());

                            return service.findById(updatedProcess.getId()).orElse(updatedProcess);
                        })
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
