package org.openapitools.service;

import org.openapitools.domain.CalendarEventCategoryEntity;
import org.openapitools.domain.CalendarEventEntity;
import org.openapitools.repository.CalendarEventCategoryRepository;
import org.openapitools.repository.CalendarEventRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CalendarEventCategoryService {
    private final CalendarEventCategoryRepository repository;
    private final CalendarEventRepository calendarEventRepository;

    public CalendarEventCategoryService(
            CalendarEventCategoryRepository repository,
            CalendarEventRepository calendarEventRepository
    ) {
        this.repository = repository;
        this.calendarEventRepository = calendarEventRepository;
    }

    public List<CalendarEventCategoryEntity> findAll() {
        return repository.findAll();
    }

    public Optional<CalendarEventCategoryEntity> findById(String id) {
        return isBlank(id) ? Optional.empty() : repository.findById(id);
    }

    public CalendarEventCategoryEntity save(CalendarEventCategoryEntity entity) {
        entity.setStandard(false);
        return repository.save(entity);
    }

    public Optional<CalendarEventCategoryEntity> update(String id, CalendarEventCategoryEntity entity) {
        if (isBlank(id) || entity == null) {
            return Optional.empty();
        }

        return repository.findById(id)
                .filter(existingEntity -> !Boolean.TRUE.equals(existingEntity.getStandard()))
                .map(existingEntity -> {
                    entity.setId(id);
                    entity.setStandard(false);
                    return repository.save(entity);
                });
    }

    public boolean deleteById(String id) {
        Optional<CalendarEventCategoryEntity> category = findById(id)
                .filter(entity -> !Boolean.TRUE.equals(entity.getStandard()));

        if (category.isEmpty()) {
            return false;
        }

        for (CalendarEventEntity calendarEvent : calendarEventRepository.findAllByCategoryId(id)) {
            calendarEvent.setCategoryId(null);
            calendarEventRepository.save(calendarEvent);
        }

        repository.deleteById(id);
        return true;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
