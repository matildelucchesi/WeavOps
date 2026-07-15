package org.openapitools.mapper;

import org.openapitools.domain.ArrangementEntity;
import org.openapitools.domain.CalendarEventEntity;
import org.openapitools.model.Arrangement;
import org.openapitools.model.CalendarEvent;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Component
public class CalendarEventMapper {
    public CalendarEvent toDto(CalendarEventEntity entity) {
        if (entity == null) {
            return null;
        }

        CalendarEvent dto = new CalendarEvent();
        dto.setId(entity.getId());
        dto.setDate(toOffsetDateTime(entity.getDate()));
        dto.setDescription(entity.getDescription());
        dto.setItemId(entity.getItemId());
        dto.setProcessId(entity.getProcessId());
        dto.setLoomId(entity.getLoomId());
        dto.setAssignmentId(entity.getAssignmentId());
        dto.setArrangementId(entity.getArrangementId());
        dto.setCategoryId(entity.getCategoryId());
        dto.setType(entity.getType());
        return dto;
    }

    public CalendarEventEntity toEntity(CalendarEvent dto) {
        if (dto == null) {
            return null;
        }

        CalendarEventEntity entity = new CalendarEventEntity();
        entity.setId(dto.getId());
        entity.setDate(toInstant(dto.getDate()));
        entity.setDescription(dto.getDescription());
        entity.setItemId(dto.getItemId());
        entity.setProcessId(dto.getProcessId());
        entity.setLoomId(dto.getLoomId());
        entity.setAssignmentId(dto.getAssignmentId());
        entity.setArrangementId(dto.getArrangementId());
        entity.setCategoryId(dto.getCategoryId());
        entity.setType(dto.getType());
        return entity;
    }

    private OffsetDateTime toOffsetDateTime(Instant value) {
        return value == null ? null : OffsetDateTime.ofInstant(value, ZoneOffset.UTC);
    }

    private Instant toInstant(OffsetDateTime value) {
        return value == null ? null : value.toInstant();
    }
}
