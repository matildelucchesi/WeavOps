package org.openapitools.mapper;

import org.openapitools.domain.LoomProcessHistoryEntity;
import org.openapitools.model.LoomProcessHistory;
import org.springframework.stereotype.Component;

@Component
public class LoomProcessHistoryMapper {
    public LoomProcessHistory toDto(LoomProcessHistoryEntity entity) {
        if (entity == null) {
            return null;
        }

        LoomProcessHistory dto = new LoomProcessHistory();
        dto.setId(entity.getId());
        dto.setLoomId(entity.getLoomId());
        dto.setProcessId(entity.getProcessId());
        return dto;
    }

    public LoomProcessHistoryEntity toEntity(LoomProcessHistory dto) {
        if (dto == null) {
            return null;
        }

        LoomProcessHistoryEntity entity = new LoomProcessHistoryEntity();
        entity.setId(dto.getId());
        entity.setLoomId(dto.getLoomId());
        entity.setProcessId(dto.getProcessId());
        return entity;
    }
}
