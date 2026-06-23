package org.openapitools.controller;

import org.openapitools.api.ItemsApi;
import org.openapitools.domain.ItemEntity;
import org.openapitools.mapper.ItemMapper;
import org.openapitools.model.*;
import org.openapitools.service.ItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.util.List;

@RestController
public class ItemController implements ItemsApi {

    private final ItemService service;
    private final ItemMapper mapper;

    public ItemController(ItemService service, ItemMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<List<Item>> getItems() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<Item> getItemById(@PathVariable("id") String id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Item> createItem(@Valid @RequestBody Item item) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toDto(service.save(mapper.toEntity(item))));
    }

    @Override
    public ResponseEntity<Item> updateItem(@PathVariable("id") String id, @Valid @RequestBody Item item) {
        return service.update(id, mapper.toEntity(item))
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> deleteItem(@PathVariable("id") String id) {
        return service.deleteById(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @Override
    public ResponseEntity<DeleteMultiItems200Response> deleteMultiItems(
            @Valid @RequestBody List<String> requestBody
    ) {
        int deletedCount = service.deleteByIds(requestBody);

        return ResponseEntity.ok(new DeleteMultiItems200Response().deletedCount(deletedCount));
    }

    @Override
    public ResponseEntity<Item> createItemWithArrangement(
            @Valid @RequestBody CreateItemWithArrangementRequest request
    ) {
        ItemEntity createdItem = service.createWithArrangement(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toDto(createdItem));
    }
}