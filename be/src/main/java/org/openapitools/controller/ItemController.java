package org.openapitools.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.openapitools.api.ItemsApi;
import org.openapitools.domain.ItemEntity;
import org.openapitools.mapper.ArrangementMapper;
import org.openapitools.mapper.ItemMapper;
import org.openapitools.model.*;
import org.openapitools.service.ArrangementService;
import org.openapitools.service.ItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ItemController implements ItemsApi {

    private final ItemService service;
    private final ItemMapper mapper;
    private final ArrangementMapper arrangementMapper;
    private final ArrangementService arrangementService;

    public ItemController(
            ItemService service,
            ItemMapper mapper,
            ArrangementMapper arrangementMapper,
            ArrangementService arrangementService) {
        this.service = service;
        this.mapper = mapper;
        this.arrangementMapper = arrangementMapper;
        this.arrangementService = arrangementService;
    }

    @Override
    public ResponseEntity<List<Item>> getItems() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<Integer> getRunningItemsCount() {
        return ResponseEntity.ok(service.countRunningItems());
    }

    @Override
    public ResponseEntity<Item> getItemById(@PathVariable("id") String id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/items/{id}/remaining-meters-to-assign")
    public ResponseEntity<Double> getRemainingMetersToAssign(@PathVariable("id") String id) {
        return service.calculateRemainingMetersToAssign(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<ProductionAdvice> getProductionAdviceByItemId(
            @PathVariable("id") String id) {
        if (service.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return service.calculateProductionAdvice(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).build());
    }

    @Override
    public ResponseEntity<Item> createItem(@Valid @RequestBody Item item) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toDto(service.save(mapper.toEntity(item))));
    }

    @Override
    public ResponseEntity<Item> updateItem(
            @PathVariable("id") String id, @Valid @RequestBody Item item) {
        return service.update(id, mapper.toEntity(item))
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/items/{id}/with-arrangement")
    public ResponseEntity<ItemAndArrangementResponse> updateItemAndArrangement(
            @PathVariable("id") String id,
            @Valid @RequestBody UpdateItemAndArrangementRequest request) {
        if (request.getItem().getArrangementId() == null
                || request.getArrangement().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        return arrangementService
                .updateItemAndArrangement(
                        id,
                        mapper.toEntity(request.getItem()),
                        request.getArrangement().getId(),
                        arrangementMapper.toEntity(request.getArrangement()))
                .map(
                        updated ->
                                ResponseEntity.ok(
                                        new ItemAndArrangementResponse(
                                                mapper.toDto(updated.item()),
                                                arrangementMapper.toDto(updated.arrangement()))))
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
            @Valid @RequestBody List<String> requestBody) {
        int deletedCount = service.deleteByIds(requestBody);

        return ResponseEntity.ok(new DeleteMultiItems200Response().deletedCount(deletedCount));
    }

    @Override
    public ResponseEntity<Item> createItemWithArrangement(
            @Valid @RequestBody CreateItemWithArrangementRequest request) {
        ItemEntity createdItem = service.createWithArrangement(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(createdItem));
    }

    @Override
    public ResponseEntity<List<Item>> getItemsArchived() {
        return ResponseEntity.ok(service.findAllArchived().stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<List<Item>> getItemsNotArchived() {
        return ResponseEntity.ok(service.findAllNotArchived().stream().map(mapper::toDto).toList());
    }
}
