package org.openapitools.mapper;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.openapitools.domain.FabricEntity;
import org.openapitools.model.Fabric;
import org.springframework.stereotype.Component;

@Component
public class FabricMapper {
    public Fabric toDto(FabricEntity entity) {
        Fabric dto = new Fabric();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setItemId(entity.getItemId());
        dto.setProcessId(entity.getProcessId());
        dto.setCertificationId(entity.getCertificationId());
        dto.setCertificationValue(entity.getCertificationValue());
        dto.setPiecesCount(entity.getPiecesCount());
        dto.setMetersPerPiece(entity.getMetersPerPiece());
        dto.setWeightPerPiece(entity.getWeightPerPiece());
        dto.setProducedAt(OffsetDateTime.ofInstant(entity.getProducedAt(), ZoneOffset.UTC));
        dto.setStatus(entity.getStatus());
        dto.setTotalMeters(entity.getTotalMeters());
        dto.setTotalWeight(entity.getTotalWeight());
        return dto;
    }
}
