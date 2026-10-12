package org.openapitools.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.openapitools.mapper.DestinationMapper;
import org.openapitools.model.Destination;
import org.openapitools.service.DestinationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class DestinationController {
    private final DestinationService service;
    private final DestinationMapper mapper;

    public DestinationController(DestinationService service, DestinationMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping("/destinations")
    public List<Destination> getDestinations() {
        return service.findAll().stream().map(mapper::toDto).toList();
    }

    @GetMapping("/destinations/{id}")
    public ResponseEntity<Destination> getDestinationById(@PathVariable String id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/destinations")
    public ResponseEntity<Destination> createDestination(
            @Valid @RequestBody Destination destination) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toDto(service.save(mapper.toEntity(destination))));
    }

    @PutMapping("/destinations/{id}")
    public ResponseEntity<Destination> updateDestination(
            @PathVariable String id, @Valid @RequestBody Destination destination) {
        return service.update(id, mapper.toEntity(destination))
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/destinations/{id}")
    public ResponseEntity<Void> deleteDestination(@PathVariable String id) {
        return service.deleteById(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
