package org.openapitools.mapper;

import org.openapitools.domain.LoomEntity;
import org.openapitools.domain.LoomItemAssignmentEntity;
import org.openapitools.model.Loom;
import org.openapitools.model.LoomItemAssignment;
import org.springframework.stereotype.Component;

@Component
public class LoomItemAssignmentMapper {

    public LoomItemAssignment toDto(LoomItemAssignmentEntity entity) {
        if (entity == null) {
            return null;
        }

        LoomItemAssignment dto = new LoomItemAssignment();
        dto.setId(entity.getId());
        dto.setItemId(entity.getItemId());
        dto.setLoomId(entity.getLoomId());
        dto.setProcessId(entity.getProcessId());
        dto.setStatus(entity.getStatus());
        return dto;
    }

    public LoomItemAssignmentEntity toEntity(LoomItemAssignment dto) {
        if (dto == null) {
            return null;
        }

        LoomItemAssignmentEntity entity = new LoomItemAssignmentEntity();
        entity.setId(dto.getId());
        entity.setLoomId(dto.getLoomId());
        entity.setItemId(dto.getItemId());
        entity.setProcessId(dto.getProcessId());
        entity.setStatus(dto.getStatus());
        return entity;
    }
}

