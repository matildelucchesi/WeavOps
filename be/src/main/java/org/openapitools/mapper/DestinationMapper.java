package org.openapitools.mapper;

import org.openapitools.domain.DestinationEntity;
import org.openapitools.model.Destination;
import org.springframework.stereotype.Component;

@Component
public class DestinationMapper {
    public Destination toDto(DestinationEntity entity) {
        Destination dto = new Destination();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setStreet(entity.getStreet());
        dto.setStreetNumber(entity.getStreetNumber());
        dto.setPostalCode(entity.getPostalCode());
        dto.setCity(entity.getCity());
        dto.setProvinceCode(entity.getProvinceCode());
        return dto;
    }

    public DestinationEntity toEntity(Destination dto) {
        DestinationEntity entity = new DestinationEntity();
        entity.setName(dto.getName());
        entity.setStreet(dto.getStreet());
        entity.setStreetNumber(dto.getStreetNumber());
        entity.setPostalCode(dto.getPostalCode());
        entity.setCity(dto.getCity());
        entity.setProvinceCode(dto.getProvinceCode());
        return entity;
    }
}
