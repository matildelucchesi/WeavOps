package org.openapitools.service;

import org.openapitools.constants.CalendarEventConstants;
import org.openapitools.domain.ArrangementEntity;
import org.openapitools.domain.CalendarEventEntity;
import org.openapitools.domain.ItemEntity;
import org.openapitools.domain.LoomEntity;
import org.openapitools.domain.LoomItemAssignmentEntity;
import org.openapitools.domain.ProcessEntity;
import org.openapitools.model.CalendarEvent;
import org.openapitools.repository.CalendarEventRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import static org.openapitools.constants.CalendarEventConstants.DELIVERY_DATE;
import static org.openapitools.constants.CalendarEventConstants.EXPECTED_END_DATE;
import static org.openapitools.constants.CalendarEventConstants.LOOM_PRODUCTION_END;

@Service
public class CalendarEventService {

    private final CalendarEventRepository repository;

    public CalendarEventService(CalendarEventRepository repository) {
        this.repository = repository;
    }

    public List<CalendarEventEntity> findAll() {
        return repository.findAll();
    }

    public CalendarEventEntity save(CalendarEventEntity entity) {
        return repository.save(entity);
    }

    public Optional<CalendarEventEntity> createOrUpdateDeliveryDateEvent(ArrangementEntity arrangement) {
        if (arrangement == null || isBlank(arrangement.getId())) {
            return Optional.empty();
        }

        Optional<CalendarEventEntity> existingEvent = findDeliveryDateEvent(arrangement);

        if (arrangement.getDeliveryDate() == null) {
            existingEvent.ifPresent(repository::delete);
            return Optional.empty();
        }

        CalendarEventEntity calendarEvent = existingEvent.orElseGet(CalendarEventEntity::new);
        calendarEvent.setEventType(DELIVERY_DATE);
        calendarEvent.setDate(arrangement.getDeliveryDate());
        calendarEvent.setDescription(buildDescription(DELIVERY_DATE, arrangement.getItemName()));
        calendarEvent.setImportance(getImportance(DELIVERY_DATE));
        calendarEvent.setArrangementId(arrangement.getId());
        calendarEvent.setAssignmentId(null);
        calendarEvent.setLoomId(null);
        calendarEvent.setItemId(null);
        calendarEvent.setProcessId(null);

        return Optional.of(repository.save(calendarEvent));
    }

    public Optional<CalendarEventEntity> createOrUpdateLoomExpectedEndDateEvent(
            LoomItemAssignmentEntity assignment,
            LoomEntity loom,
            ProcessEntity process
    ) {
        if (assignment == null || loom == null || process == null || isBlank(process.getId())) {
            return Optional.empty();
        }

        Optional<CalendarEventEntity> existingEvent = findLoomExpectedEndDateEvent(process.getId());

        if (process.getExpectedEndDate() == null) {
            existingEvent.ifPresent(repository::delete);
            return Optional.empty();
        }

        CalendarEventEntity calendarEvent = existingEvent.orElseGet(CalendarEventEntity::new);
        calendarEvent.setEventType(LOOM_PRODUCTION_END);
        calendarEvent.setDate(process.getExpectedEndDate());
        calendarEvent.setDescription(buildDescription(LOOM_PRODUCTION_END, loom.getSerialNumber()));
        calendarEvent.setImportance(getImportance(LOOM_PRODUCTION_END));
        calendarEvent.setAssignmentId(assignment.getId());
        calendarEvent.setLoomId(loom.getId());
        calendarEvent.setItemId(assignment.getItemId());
        calendarEvent.setProcessId(process.getId());
        calendarEvent.setArrangementId(null);

        return Optional.of(repository.save(calendarEvent));
    }

    public Optional<CalendarEventEntity> createOrUpdateItemExpectedEndDateEvent(ItemEntity item) {
        if (item == null || isBlank(item.getId())) {
            return Optional.empty();
        }

        Optional<CalendarEventEntity> existingEvent = findItemExpectedEndDateEvent(item.getId());

        if (item.getExpectedEndDate() == null) {
            existingEvent.ifPresent(repository::delete);
            return Optional.empty();
        }

        CalendarEventEntity calendarEvent = existingEvent.orElseGet(CalendarEventEntity::new);
        calendarEvent.setEventType(EXPECTED_END_DATE);
        calendarEvent.setDate(item.getExpectedEndDate());
        calendarEvent.setDescription(getDescription(EXPECTED_END_DATE));
        calendarEvent.setImportance(getImportance(EXPECTED_END_DATE));
        calendarEvent.setItemId(item.getId());
        calendarEvent.setArrangementId(item.getArrangementId());
        calendarEvent.setAssignmentId(null);
        calendarEvent.setLoomId(null);
        calendarEvent.setProcessId(null);

        return Optional.of(repository.save(calendarEvent));
    }

    public Optional<CalendarEventEntity> findById(String id) {
        if (isBlank(id)) {
            return Optional.empty();
        }

        return repository.findById(id);
    }

    public Optional<CalendarEventEntity> update(String id, CalendarEventEntity entity) {
        if (isBlank(id) || entity == null || !repository.existsById(id)) {
            return Optional.empty();
        }

        entity.setId(id);
        return Optional.of(repository.save(entity));
    }

    public boolean deleteById(String id) {
        if (isBlank(id) || !repository.existsById(id)) {
            return false;
        }

        repository.deleteById(id);
        return true;
    }

    private String buildDescription(String eventType, String detail) {
        if (isBlank(detail)) {
            return getDescription(eventType);
        }

        return getDescription(eventType) + detail;
    }

    private Optional<CalendarEventEntity> findDeliveryDateEvent(ArrangementEntity arrangement) {
        Optional<CalendarEventEntity> event = repository.findByEventTypeAndArrangementId(
                DELIVERY_DATE,
                arrangement.getId()
        );

        if (event.isPresent()) {
            return event;
        }

        Optional<CalendarEventEntity> legacyEventById = repository.findFirstByArrangementIdAndEventTypeIsNull(
                arrangement.getId()
        );

        if (legacyEventById.isPresent() || isBlank(arrangement.getItemName())) {
            return legacyEventById;
        }

        return repository.findFirstByArrangementIdAndEventTypeIsNull(arrangement.getItemName());
    }

    private Optional<CalendarEventEntity> findLoomExpectedEndDateEvent(String processId) {
        Optional<CalendarEventEntity> event = repository.findByEventTypeAndProcessId(
                LOOM_PRODUCTION_END,
                processId
        );

        return event.isPresent()
                ? event
                : repository.findFirstByProcessIdAndEventTypeIsNull(processId);
    }

    private Optional<CalendarEventEntity> findItemExpectedEndDateEvent(String itemId) {
        Optional<CalendarEventEntity> event = repository.findByEventTypeAndItemId(
                EXPECTED_END_DATE,
                itemId
        );

        return event.isPresent()
                ? event
                : repository.findFirstByItemIdAndEventTypeIsNull(itemId);
    }

    private String getDescription(String eventType) {
        return CalendarEventConstants.EVENT_DESCRIPTIONS.getOrDefault(eventType, "Evento calendario");
    }

    private CalendarEvent.ImportanceEnum getImportance(String eventType) {
        return CalendarEventConstants.EVENT_IMPORTANCE.getOrDefault(
                eventType,
                CalendarEvent.ImportanceEnum.MEDIUM
        );
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
