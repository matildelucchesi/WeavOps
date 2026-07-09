package org.openapitools.mapper;

import org.openapitools.domain.ProcessEntity;
import org.openapitools.model.Process;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Component
public class ProcessMapper {

    public Process toDto(ProcessEntity entity) {
        if (entity == null) {
            return null;
        }

        Process dto = new Process();
        dto.setId(entity.getId());
        dto.setSpeed(toBigDecimal(entity.getSpeed()));
        dto.setEfficiency(toBigDecimal(entity.getEfficiency()));
        dto.setTotalMeters(toBigDecimal(entity.getTotalMeters()));
        dto.setMetersRun(toBigDecimal(entity.getMetersRun()));
        dto.setMetersToGo(toBigDecimal(entity.getMetersToGo()));
        dto.setStartDate(toOffsetDateTime(entity.getStartDate()));
        dto.setEndDate(toOffsetDateTime(entity.getEndDate()));
        dto.setExpectedEndDate(toOffsetDateTime(entity.getExpectedEndDate()));
        dto.setLoom(entity.getLoom());
        dto.setDays(entity.getDays());
        dto.setItemHitsPerDm(toBigDecimal(entity.getItemHitsPerDm()));
        dto.setMetersPerPiece(toBigDecimal(entity.getMetersPerPiece()));
        dto.setPiecesRun(toBigDecimal(entity.getPiecesRun()));
        dto.setTotalPieces(toBigDecimal(entity.getTotalPieces()));
        return dto;
    }

    public ProcessEntity toEntity(Process dto) {
        if (dto == null) {
            return null;
        }

        ProcessEntity entity = new ProcessEntity();
        entity.setId(dto.getId());
        entity.setSpeed(toInteger(dto.getSpeed()));
        entity.setEfficiency(toInteger(dto.getEfficiency()));
        entity.setTotalMeters(toInteger(dto.getTotalMeters()));
        entity.setMetersRun(toInteger(dto.getMetersRun()));
        entity.setMetersToGo(toInteger(dto.getMetersToGo()));
        entity.setStartDate(toInstant(dto.getStartDate()));
        entity.setEndDate(toInstant(dto.getEndDate()));
        entity.setExpectedEndDate(toInstant(dto.getExpectedEndDate()));
        entity.setLoom(dto.getLoom());
        entity.setDays(dto.getDays());
        entity.setItemHitsPerDm(toInteger(dto.getItemHitsPerDm()));
        entity.setMetersPerPiece(toInteger(dto.getMetersPerPiece()));
        entity.setPiecesRun(toInteger(dto.getPiecesRun()));
        entity.setTotalPieces(toInteger(dto.getTotalPieces()));
        return entity;
    }

    private BigDecimal toBigDecimal(Integer value) {
        return value == null ? null : BigDecimal.valueOf(value);
    }

    private Integer toInteger(BigDecimal value) {
        return value == null ? null : value.intValue();
    }

    private OffsetDateTime toOffsetDateTime(Instant value) {
        return value == null ? null : OffsetDateTime.ofInstant(value, ZoneOffset.UTC);
    }

    private Instant toInstant(OffsetDateTime value) {
        return value == null ? null : value.toInstant();
    }
}