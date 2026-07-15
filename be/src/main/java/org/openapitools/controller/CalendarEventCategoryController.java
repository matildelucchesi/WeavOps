package org.openapitools.controller;

import jakarta.validation.Valid;
import org.openapitools.api.CalendarEventCategoriesApi;
import org.openapitools.mapper.CalendarEventCategoryMapper;
import org.openapitools.model.CalendarEventCategory;
import org.openapitools.service.CalendarEventCategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class CalendarEventCategoryController implements CalendarEventCategoriesApi {
    private final CalendarEventCategoryService service;
    private final CalendarEventCategoryMapper mapper;

    public CalendarEventCategoryController(
            CalendarEventCategoryService service,
            CalendarEventCategoryMapper mapper
    ) {
        this.service = service;
        this.mapper = mapper;
    }

    @Override
    public ResponseEntity<List<CalendarEventCategory>> getCalendarEventCategories() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<CalendarEventCategory> getCalendarEventCategoryById(@PathVariable("id") String id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<CalendarEventCategory> createCalendarEventCategory(
            @Valid @RequestBody CalendarEventCategory calendarEventCategory
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toDto(service.save(mapper.toEntity(calendarEventCategory))));
    }

    @Override
    public ResponseEntity<CalendarEventCategory> updateCalendarEventCategory(
            @PathVariable("id") String id,
            @Valid @RequestBody CalendarEventCategory calendarEventCategory
    ) {
        return service.update(id, mapper.toEntity(calendarEventCategory))
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> deleteCalendarEventCategory(@PathVariable("id") String id) {
        return service.deleteById(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
