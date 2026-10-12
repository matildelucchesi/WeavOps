package org.openapitools.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.openapitools.domain.ArrangementEntity;
import org.openapitools.domain.FabricEntity;
import org.openapitools.domain.ItemEntity;
import org.openapitools.domain.LoomItemAssignmentEntity;
import org.openapitools.domain.ProcessEntity;
import org.openapitools.repository.FabricRepository;
import org.openapitools.repository.ItemRepository;
import org.openapitools.repository.LoomItemAssignmentRepository;
import org.openapitools.repository.ProcessRepository;
import org.springframework.web.server.ResponseStatusException;

class ArrangementProductionSynchronizationServiceTest {
    private final ProcessRepository processes = mock(ProcessRepository.class);
    private final ItemRepository items = mock(ItemRepository.class);
    private final FabricRepository fabrics = mock(FabricRepository.class);
    private final LoomItemAssignmentRepository assignments =
            mock(LoomItemAssignmentRepository.class);
    private final ArrangementProductionSynchronizationService service =
            new ArrangementProductionSynchronizationService(processes, assignments, fabrics, items);

    private ArrangementEntity arrangement() {
        ArrangementEntity arrangement = new ArrangementEntity();
        arrangement.setPieceLenght(12f);
        arrangement.setPiecesCount(10f);
        arrangement.setHitsPerDm(new BigDecimal("250"));
        return arrangement;
    }

    private ProcessEntity process(String id, int planned, int produced) {
        ProcessEntity process = new ProcessEntity();
        process.setId(id);
        process.setMetersPerPiece(10d);
        process.setTotalPieces(planned);
        process.setPiecesRun(produced);
        process.setTotalMeters(planned * 10d);
        process.setMetersRun(produced * 10d);
        process.setItemHitsPerDm(200d);
        when(processes.findById(id)).thenReturn(Optional.of(process));
        when(processes.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        return process;
    }

    private ItemEntity item() {
        ItemEntity item = new ItemEntity();
        item.setId("item");
        item.setTotalMeters(100d);
        item.setMetersRun(20d);
        when(items.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        return item;
    }

    @Test
    void correctsStoredProcessesEmbeddedCopiesItemTotalsAndExistingFabric() {
        ItemEntity item = item();
        ProcessEntity staleCopy = new ProcessEntity();
        staleCopy.setId("process");
        staleCopy.setPiecesRun(0);
        item.setProcessing(List.of(staleCopy));
        ProcessEntity process = process("process", 10, 2);
        FabricEntity fabric = new FabricEntity();
        fabric.setProcessId("process");
        fabric.setCode("TELA-1");
        fabric.setPiecesCount(2);
        fabric.setMetersPerPiece(BigDecimal.TEN);
        when(fabrics.findByItemId("item")).thenReturn(List.of(fabric));

        service.synchronize(item, arrangement());

        assertEquals(12d, process.getMetersPerPiece());
        assertEquals(120d, process.getTotalMeters());
        assertEquals(24d, process.getMetersRun());
        assertEquals(96d, process.getMetersToGo());
        assertEquals(250d, process.getItemHitsPerDm());
        assertEquals(10, process.getTotalPieces());
        assertEquals(2, process.getPiecesRun());
        assertSame(process, item.getProcessing().get(0));
        assertEquals(120d, item.getTotalMeters());
        assertEquals(24d, item.getMetersRun());
        assertEquals(new BigDecimal("24.0"), fabric.getTotalMeters());
        assertEquals("TELA-1", fabric.getCode());
        verify(fabrics).save(fabric);
    }

    @Test
    void includesQueuedAndCompletedAssignmentsWithoutChangingDatesOrCounts() {
        ItemEntity item = item();
        ProcessEntity queued = process("queued", 4, 0);
        ProcessEntity completed = process("completed", 6, 6);
        Instant ended = Instant.parse("2026-10-11T10:00:00Z");
        completed.setEndDate(ended);
        LoomItemAssignmentEntity first = new LoomItemAssignmentEntity();
        first.setProcessId("queued");
        LoomItemAssignmentEntity second = new LoomItemAssignmentEntity();
        second.setProcessId("completed");
        when(assignments.findByItemId("item")).thenReturn(List.of(first, second));

        service.synchronize(item, arrangement());

        assertEquals(48d, queued.getTotalMeters());
        assertEquals(72d, completed.getTotalMeters());
        assertEquals(72d, item.getMetersRun());
        assertEquals(0d, completed.getMetersToGo());
        assertEquals(ended, completed.getEndDate());
        assertEquals(6, completed.getPiecesRun());
        assertEquals(2, item.getProcessing().size());
    }

    @Test
    void rescalesLegacyMetersWhenTheProducedPieceCountIsMissing() {
        ItemEntity item = item();
        ProcessEntity process = process("legacy", 5, 2);
        process.setTotalPieces(null);
        process.setPiecesRun(null);
        process.setMetersRun(25d);
        item.setProcessing(List.of(process));
        service.synchronize(item, arrangement());
        assertEquals(5, process.getTotalPieces());
        assertEquals(60d, process.getTotalMeters());
        assertEquals(30d, process.getMetersRun());
    }

    @Test
    void rejectsInvalidLengthsAndUnrecoverableLegacyProcesses() {
        ItemEntity item = item();
        ArrangementEntity invalid = arrangement();
        invalid.setPieceLenght(0f);
        assertThrows(ResponseStatusException.class, () -> service.synchronize(item, invalid));
        ProcessEntity process = process("legacy", 5, 2);
        process.setMetersPerPiece(null);
        process.setTotalPieces(null);
        item.setProcessing(List.of(process));
        assertThrows(ResponseStatusException.class, () -> service.synchronize(item, arrangement()));
        verify(items, never()).save(any());
    }
}
