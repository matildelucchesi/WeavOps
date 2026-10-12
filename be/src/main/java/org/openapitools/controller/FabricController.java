package org.openapitools.controller;

import java.util.List;
import org.openapitools.mapper.FabricMapper;
import org.openapitools.model.Fabric;
import org.openapitools.service.FabricService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class FabricController {
    private final FabricService service;
    private final FabricMapper mapper;

    public FabricController(FabricService service, FabricMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping("/fabrics")
    public List<Fabric> getFabrics(@RequestParam(required = false) String itemId) {
        return service.findAll(itemId).stream().map(mapper::toDto).toList();
    }

    @GetMapping("/fabrics/{id}")
    public ResponseEntity<Fabric> getFabricById(@PathVariable String id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
