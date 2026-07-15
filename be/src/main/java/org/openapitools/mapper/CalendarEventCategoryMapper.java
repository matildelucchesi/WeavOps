package org.openapitools.mapper;

import org.openapitools.domain.CalendarEventCategoryEntity;
import org.openapitools.model.CalendarEventCategory;
import org.springframework.stereotype.Component;

@Component
public class CalendarEventCategoryMapper {
    public CalendarEventCategory toDto(CalendarEventCategoryEntity entity) {
        if (entity == null) {
            return null;
        }

        CalendarEventCategory dto = new CalendarEventCategory();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setColor(entity.getColor());
        dto.setStandard(entity.getStandard());
        return dto;
    }

    public CalendarEventCategoryEntity toEntity(CalendarEventCategory dto) {
        if (dto == null) {
            return null;
        }

        CalendarEventCategoryEntity entity = new CalendarEventCategoryEntity();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setColor(dto.getColor());
        entity.setStandard(dto.getStandard());
        return entity;
    }
}
