package org.openapitools.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.openapitools.api.CustomerItemHistoriesApi;
import org.openapitools.mapper.CustomerItemHistoryMapper;
import org.openapitools.model.CustomerItemHistory;
import org.openapitools.service.CustomerItemHistoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CustomerItemHistoryController implements CustomerItemHistoriesApi {
    private final CustomerItemHistoryService service;
    private final CustomerItemHistoryMapper mapper;

    public CustomerItemHistoryController(
            CustomerItemHistoryService service, CustomerItemHistoryMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<List<CustomerItemHistory>> getCustomerItemHistories() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<CustomerItemHistory> getCustomerItemHistoryById(
            @PathVariable("id") String id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<CustomerItemHistory> createCustomerItemHistory(
            @Valid @RequestBody CustomerItemHistory customerItemHistory) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toDto(service.save(mapper.toEntity(customerItemHistory))));
    }

    @Override
    public ResponseEntity<CustomerItemHistory> updateCustomerItemHistory(
            @PathVariable("id") String id,
            @Valid @RequestBody CustomerItemHistory customerItemHistory) {
        return service.update(id, mapper.toEntity(customerItemHistory))
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> deleteCustomerItemHistory(@PathVariable("id") String id) {
        return service.deleteById(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
