package org.openapitools.mapper;

import org.openapitools.domain.ProcessEntity;
import org.openapitools.model.Process;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

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
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setExpectedEndDate(entity.getExpectedEndDate());
        dto.setLoomId(entity.getLoomId());
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
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setExpectedEndDate(dto.getExpectedEndDate());
        entity.setLoomId(dto.getLoomId());
        return entity;
    }

    private BigDecimal toBigDecimal(Integer value) {
        return value == null ? null : BigDecimal.valueOf(value);
    }

    private Integer toInteger(BigDecimal value) {
        return value == null ? null : value.intValue();
    }
}