package org.openapitools.service;

import org.openapitools.constants.CalendarEventConstants;
import org.openapitools.domain.ArrangementEntity;
import org.openapitools.domain.CalendarEventEntity;
import org.openapitools.domain.ItemEntity;
import org.openapitools.domain.LoomEntity;
import org.openapitools.domain.LoomItemAssignmentEntity;
import org.openapitools.domain.ProcessEntity;
import org.openapitools.model.CalendarEvent;
import org.openapitools.repository.ArrangementRepository;
import org.openapitools.repository.CalendarEventRepository;
import org.openapitools.repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static org.openapitools.constants.CalendarEventConstants.DELIVERY_DATE;
import static org.openapitools.constants.CalendarEventConstants.ITEM_EXPECTED_END;
import static org.openapitools.constants.CalendarEventConstants.LOOM_EXPECTED_END;

@Service
public class CalendarEventService {
    private static final Instant TEMPORARY_EXPECTED_END_DATE = Instant.EPOCH;
    private static final ZoneId BUSINESS_TIME_ZONE = ZoneId.of("Europe/Rome");

    private final CalendarEventRepository repository;
    private final ArrangementRepository arrangementRepository;
    private final ItemRepository itemRepository;

    public CalendarEventService(
            CalendarEventRepository repository,
            ArrangementRepository arrangementRepository,
            ItemRepository itemRepository
    ) {
        this.repository = repository;
        this.arrangementRepository = arrangementRepository;
        this.itemRepository = itemRepository;
    }

    public List<CalendarEventEntity> findAll() {
        return repository.findAll();
    }

    public Set<LocalDate> findClosureDates() {
        return repository.findAllByType(CalendarEvent.TypeEnum.CLOSURE).stream()
                .map(CalendarEventEntity::getDate)
                .filter(date -> date != null)
                .map(date -> date.atZone(BUSINESS_TIME_ZONE).toLocalDate())
                .collect(Collectors.toSet());
    }

    public CalendarEventEntity save(CalendarEventEntity entity) {
        return repository.save(entity);
    }

    public Optional<CalendarEventEntity> createOrUpdateDeliveryDateEvent(ArrangementEntity arrangement) {
        if (arrangement == null || isBlank(arrangement.getId())) {
            return Optional.empty();
        }

        Optional<CalendarEventEntity> existingEvent = findDeliveryDateEvent(arrangement.getId());

        if (!hasEventDate(arrangement.getDeliveryDate())) {
            existingEvent.ifPresent(repository::delete);
            return Optional.empty();
        }

        CalendarEventEntity calendarEvent = existingEvent.orElseGet(CalendarEventEntity::new);
        calendarEvent.setType(getType(DELIVERY_DATE));
        calendarEvent.setDate(arrangement.getDeliveryDate());
        calendarEvent.setDescription(buildDescription(DELIVERY_DATE, arrangement.getItemName()));
        calendarEvent.setArrangementId(arrangement.getId());
        calendarEvent.setAssignmentId(null);
        calendarEvent.setLoomId(null);
        calendarEvent.setItemId(null);
        calendarEvent.setProcessId(null);
        calendarEvent.setCategoryId(null);

        return Optional.of(repository.save(calendarEvent));
    }

    public Optional<CalendarEventEntity> createOrUpdateLoomExpectedEndDateEvent(
            LoomItemAssignmentEntity assignment,
            LoomEntity loom,
            ProcessEntity process
    ) {
        if (assignment == null
                || loom == null
                || process == null
                || isBlank(assignment.getId())
                || isBlank(loom.getId())
                || isBlank(process.getId())) {
            return Optional.empty();
        }

        Optional<CalendarEventEntity> existingEvent = findLoomExpectedEndDateEvent(process.getId());

        if (!hasEventDate(process.getExpectedEndDate())) {
            existingEvent.ifPresent(repository::delete);
            return Optional.empty();
        }

        CalendarEventEntity calendarEvent = existingEvent.orElseGet(CalendarEventEntity::new);
        calendarEvent.setType(getType(LOOM_EXPECTED_END));
        calendarEvent.setDate(process.getExpectedEndDate());
        calendarEvent.setDescription(buildDescription(LOOM_EXPECTED_END, loom.getSerialNumber()));
        calendarEvent.setAssignmentId(assignment.getId());
        calendarEvent.setLoomId(loom.getId());
        calendarEvent.setItemId(assignment.getItemId());
        calendarEvent.setProcessId(process.getId());
        calendarEvent.setArrangementId(null);
        calendarEvent.setCategoryId(null);

        return Optional.of(repository.save(calendarEvent));
    }

    public Optional<CalendarEventEntity> createOrUpdateItemExpectedEndDateEvent(ItemEntity item) {
        if (item == null || isBlank(item.getId())) {
            return Optional.empty();
        }

        Optional<CalendarEventEntity> existingEvent = findItemExpectedEndDateEvent(item.getId());

        if (!hasEventDate(item.getExpectedEndDate())) {
            existingEvent.ifPresent(repository::delete);
            return Optional.empty();
        }

        CalendarEventEntity calendarEvent = existingEvent.orElseGet(CalendarEventEntity::new);
        calendarEvent.setType(getType(ITEM_EXPECTED_END));
        calendarEvent.setDate(item.getExpectedEndDate());
        calendarEvent.setDescription(buildDescription(ITEM_EXPECTED_END, getItemName(item)));
        calendarEvent.setItemId(item.getId());
        calendarEvent.setArrangementId(item.getArrangementId());
        calendarEvent.setAssignmentId(null);
        calendarEvent.setLoomId(null);
        calendarEvent.setProcessId(null);
        calendarEvent.setCategoryId(null);

        return Optional.of(repository.save(calendarEvent));
    }

    public Optional<CalendarEventEntity> findById(String id) {
        return isBlank(id) ? Optional.empty() : repository.findById(id);
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

    public int countCurrentWeekPendingDeliveries() {
        LocalDate today = LocalDate.now(BUSINESS_TIME_ZONE);
        LocalDate weekStartDate = today.minusDays(today.getDayOfWeek().getValue() - 1L);
        Instant weekStart = weekStartDate.atStartOfDay(BUSINESS_TIME_ZONE).toInstant();
        Instant nextWeekStart = weekStartDate.plusWeeks(1).atStartOfDay(BUSINESS_TIME_ZONE).toInstant();

        return countPendingDeliveriesBetween(weekStart, nextWeekStart);
    }

    public int countOverdueDeliveries() {
        Instant todayStart = LocalDate.now(BUSINESS_TIME_ZONE).atStartOfDay(BUSINESS_TIME_ZONE).toInstant();

        return (int) itemRepository.findAll().stream()
                .filter(this::isPendingDelivery)
                .map(this::getDeliveryDate)
                .flatMap(Optional::stream)
                .filter(deliveryDate -> deliveryDate.isBefore(todayStart))
                .count();
    }

    private Optional<CalendarEventEntity> findDeliveryDateEvent(String arrangementId) {
        Optional<CalendarEventEntity> event = repository.findFirstByTypeAndArrangementId(
                getType(DELIVERY_DATE),
                arrangementId
        );

        return event.isPresent()
                ? event
                : repository.findFirstByArrangementIdAndTypeIsNull(arrangementId);
    }

    private Optional<CalendarEventEntity> findLoomExpectedEndDateEvent(String processId) {
        Optional<CalendarEventEntity> event = repository.findFirstByTypeAndProcessId(
                getType(LOOM_EXPECTED_END),
                processId
        );

        return event.isPresent()
                ? event
                : repository.findFirstByProcessIdAndTypeIsNull(processId);
    }

    private Optional<CalendarEventEntity> findItemExpectedEndDateEvent(String itemId) {
        Optional<CalendarEventEntity> event = repository.findFirstByTypeAndItemId(
                getType(ITEM_EXPECTED_END),
                itemId
        );

        return event.isPresent()
                ? event
                : repository.findFirstByItemIdAndTypeIsNull(itemId);
    }

    private int countPendingDeliveriesBetween(Instant startInclusive, Instant endExclusive) {
        return (int) itemRepository.findAll().stream()
                .filter(this::isPendingDelivery)
                .map(this::getDeliveryDate)
                .flatMap(Optional::stream)
                .filter(deliveryDate -> !deliveryDate.isBefore(startInclusive) && deliveryDate.isBefore(endExclusive))
                .count();
    }

    private boolean isPendingDelivery(ItemEntity item) {
        return item != null && !Boolean.TRUE.equals(item.getDelivered());
    }

    private Optional<Instant> getDeliveryDate(ItemEntity item) {
        if (item == null || isBlank(item.getArrangementId())) {
            return Optional.empty();
        }

        return arrangementRepository.findById(item.getArrangementId())
                .map(ArrangementEntity::getDeliveryDate)
                .filter(this::hasEventDate);
    }

    private String buildDescription(String eventType, String detail) {
        String description = CalendarEventConstants.EVENT_DESCRIPTIONS.getOrDefault(eventType, "Evento calendario");

        return isBlank(detail) ? description.trim() : description + detail;
    }

    private String getItemName(ItemEntity item) {
        if (item == null || isBlank(item.getArrangementId())) {
            return null;
        }

        return arrangementRepository.findById(item.getArrangementId())
                .map(ArrangementEntity::getItemName)
                .orElse(null);
    }

    private CalendarEvent.TypeEnum getType(String eventType) {
        return CalendarEventConstants.EVENT_TYPE.getOrDefault(
                eventType,
                CalendarEvent.TypeEnum.GENERIC
        );
    }

    private boolean hasEventDate(Instant date) {
        return date != null && !TEMPORARY_EXPECTED_END_DATE.equals(date);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
