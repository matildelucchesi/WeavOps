package org.openapitools.mapper;

import org.openapitools.domain.ArrangementEntity;
import org.openapitools.model.Arrangement;
import org.springframework.stereotype.Component;

@Component
public class ArrangementMapper {

    public Arrangement toDto(ArrangementEntity entity) {
        if (entity == null) {
            return null;
        }

        Arrangement dto = new Arrangement();
        dto.setId(entity.getId());
        dto.setItemName(entity.getItemName());
        dto.setReedCount(entity.getReedCount());
        dto.setReedCM(entity.getReedCM());
        dto.setReedHight(entity.getReedHight());
        dto.setWarpLenght(entity.getWarpLenght());
        dto.setPiecesCount(entity.getPiecesCount());
        dto.setPieceLenght(entity.getPieceLenght());
        dto.setWarpEndCount(entity.getWarpEndCount());
        dto.setHitsPerDm(entity.getHitsPerDm());
        dto.setDeliveryDate(entity.getDeliveryDate());
        return dto;
    }

    public ArrangementEntity toEntity(Arrangement dto) {
        if (dto == null) {
            return null;
        }

        ArrangementEntity entity = new ArrangementEntity();
        entity.setId(dto.getId());
        entity.setItemName(dto.getItemName());
        entity.setReedCount(dto.getReedCount());
        entity.setReedCM(dto.getReedCM());
        entity.setReedHight(dto.getReedHight());
        entity.setWarpLenght(dto.getWarpLenght());
        entity.setPiecesCount(dto.getPiecesCount());
        entity.setPieceLenght(dto.getPieceLenght());
        entity.setWarpEndCount(dto.getWarpEndCount());
        entity.setHitsPerDm(dto.getHitsPerDm());
        entity.setDeliveryDate(dto.getDeliveryDate());
        return entity;
    }
}