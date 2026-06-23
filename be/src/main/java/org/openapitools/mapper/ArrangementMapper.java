package org.openapitools.mapper;

import org.openapitools.domain.ArrangementEntity;
import org.openapitools.model.Arrangement;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

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
        dto.setReedHeight(entity.getReedHight());
        dto.setWarpLength(entity.getWarpLenght());
        dto.setPiecesCount(entity.getPiecesCount());
        dto.setPieceLength(entity.getPieceLenght());
        dto.setWarpEndCount(entity.getWarpEndCount());
        dto.setHitsPerDm(entity.getHitsPerDm());
        dto.setDeliveryDate(toOffsetDateTime(entity.getDeliveryDate()));
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
        entity.setReedHight(dto.getReedHeight());
        entity.setWarpLenght(dto.getWarpLength());
        entity.setPiecesCount(dto.getPiecesCount());
        entity.setPieceLenght(dto.getPieceLength());
        entity.setWarpEndCount(dto.getWarpEndCount());
        entity.setHitsPerDm(dto.getHitsPerDm());
        entity.setDeliveryDate(toInstant(dto.getDeliveryDate()));
        return entity;
    }

    private OffsetDateTime toOffsetDateTime(Instant value) {
        return value == null ? null : OffsetDateTime.ofInstant(value, ZoneOffset.UTC);
    }

    private Instant toInstant(OffsetDateTime value) {
        return value == null ? null : value.toInstant();
    }
}