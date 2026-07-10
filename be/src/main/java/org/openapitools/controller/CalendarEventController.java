package org.openapitools.controller;

import org.openapitools.api.CalendarEventsApi;
import org.openapitools.mapper.CalendarEventMapper;
import org.openapitools.model.CalendarEvent;
import org.openapitools.service.CalendarEventService;
import org.openapitools.service.ProductionForecastService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.util.List;

@RestController
public class CalendarEventController implements CalendarEventsApi {

    private final CalendarEventService service;
    private final ProductionForecastService productionForecastService;
    private final CalendarEventMapper mapper;

    public CalendarEventController(
            CalendarEventService service,
            CalendarEventMapper mapper,
            ProductionForecastService productionForecastService
    ) {
        this.service = service;
        this.mapper = mapper;
        this.productionForecastService = productionForecastService;
    }

    @Override
    public ResponseEntity<List<CalendarEvent>> getCalendarEvents() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<CalendarEvent> getCalendarEventById(@PathVariable("id") String id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<CalendarEvent> createCalendarEvent(@Valid @RequestBody CalendarEvent calendarEvent) {
        CalendarEvent createdEvent = mapper.toDto(service.save(mapper.toEntity(calendarEvent)));
        recalculateForecastsIfClosure(createdEvent);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }

    @Override
    public ResponseEntity<CalendarEvent> updateCalendarEvent(
            @PathVariable("id") String id,
            @Valid @RequestBody CalendarEvent calendarEvent
    ) {
        boolean wasClosure = service.findById(id)
                .map(event -> event.getType() == CalendarEvent.TypeEnum.CLOSURE)
                .orElse(false);

        return service.update(id, mapper.toEntity(calendarEvent))
                .map(mapper::toDto)
                .map(updatedEvent -> {
                    if (wasClosure || updatedEvent.getType() == CalendarEvent.TypeEnum.CLOSURE) {
                        productionForecastService.recalculateAllProductionForecasts();
                    }

                    return ResponseEntity.ok(updatedEvent);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<Void> deleteCalendarEvent(@PathVariable("id") String id) {
        boolean isClosure = service.findById(id)
                .map(event -> event.getType() == CalendarEvent.TypeEnum.CLOSURE)
                .orElse(false);

        return service.deleteById(id)
                ? deleteCalendarEventResponse(isClosure)
                : ResponseEntity.notFound().build();
    }

    private ResponseEntity<Void> deleteCalendarEventResponse(boolean isClosure) {
        if (isClosure) {
            productionForecastService.recalculateAllProductionForecasts();
        }

        return ResponseEntity.noContent().build();
    }

    private void recalculateForecastsIfClosure(CalendarEvent calendarEvent) {
        if (calendarEvent.getType() == CalendarEvent.TypeEnum.CLOSURE) {
            productionForecastService.recalculateAllProductionForecasts();
        }
    }
}
