package org.openapitools.mapper;

import org.openapitools.domain.CustomerItemHistoryEntity;
import org.openapitools.model.CustomerItemHistory;
import org.springframework.stereotype.Component;

@Component
public class CustomerItemHistoryMapper {
    public CustomerItemHistory toDto(CustomerItemHistoryEntity entity) {
        if (entity == null) {
            return null;
        }

        CustomerItemHistory dto = new CustomerItemHistory();
        dto.setId(entity.getId());
        dto.setItemId(entity.getItemId());
        dto.setCustomerId(entity.getCustomerId());
        return dto;
    }

    public CustomerItemHistoryEntity toEntity(CustomerItemHistory dto) {
        if (dto == null) {
            return null;
        }

        CustomerItemHistoryEntity entity = new CustomerItemHistoryEntity();
        entity.setId(dto.getId());
        entity.setCustomerId(dto.getCustomerId());
        entity.setItemId(dto.getItemId());
        return entity;
    }
}
