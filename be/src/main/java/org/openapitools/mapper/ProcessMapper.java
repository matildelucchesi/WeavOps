package org.openapitools.mapper;

import org.openapitools.domain.ProcessEntity;
import org.openapitools.model.Process;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

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
        dto.setGrs(entity.getGrs());
        dto.setGots(entity.getGots());
        dto.setNotes(entity.getNotes());
        return dto;
    }

    public ProcessEntity toEntity(Process dto) {
        if (dto == null) {
            return null;
        }

        ProcessEntity entity = new ProcessEntity();
        entity.setId(dto.getId());
        entity.setSpeed(toDouble(dto.getSpeed()));
        entity.setEfficiency(toDouble(dto.getEfficiency()));
        entity.setTotalMeters(toDouble(dto.getTotalMeters()));
        entity.setMetersRun(toDouble(dto.getMetersRun()));
        entity.setMetersToGo(toDouble(dto.getMetersToGo()));
        entity.setStartDate(toInstant(dto.getStartDate()));
        entity.setEndDate(toInstant(dto.getEndDate()));
        entity.setExpectedEndDate(toInstant(dto.getExpectedEndDate()));
        entity.setLoom(dto.getLoom());
        entity.setDays(dto.getDays());
        entity.setItemHitsPerDm(toDouble(dto.getItemHitsPerDm()));
        entity.setMetersPerPiece(toDouble(dto.getMetersPerPiece()));
        entity.setPiecesRun(toIntegerExact(dto.getPiecesRun(), "piecesRun"));
        entity.setTotalPieces(toIntegerExact(dto.getTotalPieces(), "totalPieces"));
        entity.setGrs(dto.getGrs());
        entity.setGots(dto.getGots());
        entity.setNotes(dto.getNotes());
        return entity;
    }

    private BigDecimal toBigDecimal(Double value) {
        return value == null ? null : BigDecimal.valueOf(value);
    }

    private BigDecimal toBigDecimal(Integer value) {
        return value == null ? null : BigDecimal.valueOf(value);
    }

    private Double toDouble(BigDecimal value) {
        if (value == null) {
            return null;
        }
        double converted = value.doubleValue();
        if (!Double.isFinite(converted)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valore numerico fuori dai limiti supportati.");
        }
        return converted;
    }

    private Integer toIntegerExact(BigDecimal value, String field) {
        if (value == null) {
            return null;
        }
        try {
            int converted = value.intValueExact();
            if (converted < 0) {
                throw new ArithmeticException("negative counter");
            }
            return converted;
        } catch (ArithmeticException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    field + " deve essere un numero intero compreso nei limiti supportati."
            );
        }
    }

    private OffsetDateTime toOffsetDateTime(Instant value) {
        return value == null ? null : OffsetDateTime.ofInstant(value, ZoneOffset.UTC);
    }

    private Instant toInstant(OffsetDateTime value) {
        return value == null ? null : value.toInstant();
    }
}
