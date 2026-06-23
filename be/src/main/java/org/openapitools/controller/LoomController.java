package org.openapitools.controller;

import org.openapitools.api.LoomsApi;
import org.openapitools.mapper.LoomMapper;
import org.openapitools.model.DeleteMultiCustomers200Response;
import org.openapitools.model.DeleteMultiLooms200Response;
import org.openapitools.model.Loom;
import org.openapitools.service.LoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
public class LoomController implements LoomsApi {

    private static final String DUPLICATE_SERIAL_NUMBER_MESSAGE = "Telaio con numero seriale già esistente";

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
    @SuppressWarnings("unchecked")
    public ResponseEntity<Loom> createLoom(@Valid @RequestBody Loom loom) {
        if(service.findBySerialNumber(loom.getSerialNumber()).isPresent()){
            return (ResponseEntity<Loom>) (ResponseEntity<?>) ResponseEntity.badRequest()
                    .body(Map.of("message", DUPLICATE_SERIAL_NUMBER_MESSAGE));
        }else {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(mapper.toDto(service.save(mapper.toEntity(loom))));
        }
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

    @Override
    public ResponseEntity<DeleteMultiLooms200Response> deleteMultiLooms(
            @Valid @RequestBody List<String> requestBody
    ) {
        int deletedCount = service.deleteByIds(requestBody);

        return ResponseEntity.ok(new DeleteMultiLooms200Response().deletedCount(deletedCount));
    }
}
