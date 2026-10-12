package org.openapitools.mapper;

import org.openapitools.domain.ReferentEntity;
import org.openapitools.model.Referent;
import org.springframework.stereotype.Component;

@Component
public class ReferentMapper {

    public Referent toDto(ReferentEntity entity) {
        if (entity == null) {
            return null;
        }

        Referent dto = new Referent();
        dto.setId(entity.getId());
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setEmail(entity.getEmail());
        return dto;
    }

    public ReferentEntity toEntity(Referent dto) {
        if (dto == null) {
            return null;
        }

        ReferentEntity entity = new ReferentEntity();
        entity.setId(dto.getId());
        entity.setFirstName(dto.getFirstName());
        entity.setLastName(dto.getLastName());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setEmail(dto.getEmail());
        return entity;
    }
}
