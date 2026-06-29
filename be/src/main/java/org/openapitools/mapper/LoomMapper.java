package org.openapitools.mapper;

import org.openapitools.domain.LoomEntity;
import org.openapitools.model.Loom;
import org.springframework.stereotype.Component;

@Component
public class LoomMapper {

    public Loom toDto(LoomEntity entity) {
        if (entity == null) {
            return null;
        }

        Loom dto = new Loom();
        dto.setId(entity.getId());
        dto.setSerialNumber(entity.getSerialNumber());
        dto.setStatus(entity.getStatus());
        dto.setIsAssigned(entity.isAssigned());
        dto.setActualItemId(entity.getActualItemId());
        return dto;
    }

    public LoomEntity toEntity(Loom dto) {
        if (dto == null) {
            return null;
        }

        LoomEntity entity = new LoomEntity();
        entity.setId(dto.getId());
        entity.setSerialNumber(dto.getSerialNumber());
        entity.setStatus(dto.getStatus());
        entity.setAssigned(dto.getIsAssigned() != null ? dto.getIsAssigned() : false);
        entity.setActualItemId(dto.getActualItemId());
        return entity;
    }
}