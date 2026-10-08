package org.openapitools.mapper;

import org.junit.jupiter.api.Test;
import org.openapitools.model.Process;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ProcessMapperTest {
    private final ProcessMapper mapper = new ProcessMapper();

    @Test
    void preservesFractionalProductionMeasurements() {
        Process dto = new Process();
        dto.setSpeed(new BigDecimal("350.5"));
        dto.setEfficiency(new BigDecimal("87.5"));
        dto.setTotalMeters(new BigDecimal("125.25"));
        dto.setMetersRun(new BigDecimal("12.5"));
        dto.setMetersToGo(new BigDecimal("112.75"));
        dto.setItemHitsPerDm(new BigDecimal("32.5"));
        dto.setMetersPerPiece(new BigDecimal("12.5"));

        var entity = mapper.toEntity(dto);
        Process roundTripped = mapper.toDto(entity);

        assertEquals(350.5d, entity.getSpeed());
        assertEquals(87.5d, entity.getEfficiency());
        assertEquals(125.25d, entity.getTotalMeters());
        assertEquals(12.5d, entity.getMetersRun());
        assertEquals(112.75d, entity.getMetersToGo());
        assertEquals(32.5d, entity.getItemHitsPerDm());
        assertEquals(12.5d, entity.getMetersPerPiece());
        assertEquals(new BigDecimal("12.5"), roundTripped.getMetersPerPiece());
        assertEquals(new BigDecimal("87.5"), roundTripped.getEfficiency());
    }

    @Test
    void rejectsFractionalPieceCountersInsteadOfTruncatingThem() {
        Process dto = new Process();
        dto.setTotalPieces(new BigDecimal("10.5"));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> mapper.toEntity(dto)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }
}
