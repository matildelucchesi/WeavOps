package org.openapitools.mapper;

import org.openapitools.domain.LoomLogEntity;
import org.openapitools.model.LoomLog;
import org.springframework.stereotype.Component;

import java.time.ZoneOffset;

@Component
public class LoomLogMapper {
    public LoomLog toDto(LoomLogEntity entity) {
        if (entity == null) {
            return null;
        }

        LoomLog dto = new LoomLog();
        dto.setId(entity.getId());
        dto.setKey(entity.getKey());
        dto.setLoomId(entity.getLoomId());
        dto.setLoomCode(entity.getLoomCode());
        dto.setLoomStatus(entity.getLoomStatus());
        dto.setItemId(entity.getItemId());
        dto.setItemName(entity.getItemName());
        dto.setMetersAdded(entity.getMetersAdded());
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().atOffset(ZoneOffset.UTC) : null);
        return dto;
    }

    public LoomLogEntity toEntity(LoomLog dto) {
        if (dto == null) {
            return null;
        }

        LoomLogEntity entity = new LoomLogEntity();
        entity.setId(dto.getId());
        entity.setKey(dto.getKey());
        entity.setLoomId(dto.getLoomId());
        entity.setLoomCode(dto.getLoomCode());
        entity.setLoomStatus(dto.getLoomStatus());
        entity.setItemId(dto.getItemId());
        entity.setItemName(dto.getItemName());
        entity.setMetersAdded(dto.getMetersAdded());
        entity.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt().toInstant() : null);
        return entity;
    }
}
