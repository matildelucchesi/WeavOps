package org.openapitools.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.openapitools.domain.ItemEntity;
import org.openapitools.domain.LoomEntity;
import org.openapitools.domain.LoomItemAssignmentEntity;
import org.openapitools.domain.ProcessEntity;
import org.openapitools.mapper.LoomMapper;
import org.openapitools.model.Loom;
import org.openapitools.model.LoomItemAssignment;
import org.openapitools.repository.LoomItemAssignmentRepository;
import org.openapitools.repository.LoomProcessHistoryRepository;
import org.openapitools.repository.LoomRepository;
import org.springframework.test.util.ReflectionTestUtils;

class LoomDeletionServiceTest {
    @Test
    void
            refusesLoomDeletionUntilProducedPiecesHaveBeenRegisteredAndPreservesEmptyProductionHistory() {
        LoomRepository loomRepository = mock(LoomRepository.class);
        LoomItemAssignmentRepository assignmentRepository =
                mock(LoomItemAssignmentRepository.class);
        LoomProcessHistoryRepository loomProcessHistoryRepository =
                mock(LoomProcessHistoryRepository.class);
        ItemService itemService = mock(ItemService.class);
        ProcessService processService = mock(ProcessService.class);
        ProductionForecastService forecastService = mock(ProductionForecastService.class);
        CalendarEventService calendarEventService = mock(CalendarEventService.class);

        LoomEntity loom = new LoomEntity();
        loom.setId("loom-1");
        loom.setSerialNumber("TEL-42");
        loom.setStatus(Loom.StatusEnum.WORKING);
        LoomItemAssignmentEntity assignment = new LoomItemAssignmentEntity();
        assignment.setId("assignment-1");
        assignment.setLoomId("loom-1");
        assignment.setItemId("item-1");
        assignment.setProcessId("process-1");
        assignment.setStatus(LoomItemAssignment.StatusEnum.RUNNING);
        ProcessEntity process = new ProcessEntity();
        process.setId("process-1");
        process.setMetersRun(125d);
        process.setPiecesRun(5);
        process.setTotalMeters(500d);
        ItemEntity item = new ItemEntity();
        item.setId("item-1");
        item.setProcessing(new java.util.ArrayList<>(List.of(process)));

        when(loomRepository.findById("loom-1")).thenReturn(Optional.of(loom));
        when(assignmentRepository.findByLoomId("loom-1")).thenReturn(List.of(assignment));
        when(itemService.findById("item-1")).thenReturn(Optional.of(item));
        when(processService.findById("process-1")).thenReturn(Optional.of(process));
        when(processService.save(any(ProcessEntity.class))).thenAnswer(call -> call.getArgument(0));
        when(itemService.save(any(ItemEntity.class))).thenAnswer(call -> call.getArgument(0));

        LoomService service = new LoomService(loomRepository);
        ReflectionTestUtils.setField(service, "assignmentRepository", assignmentRepository);
        ReflectionTestUtils.setField(service, "itemService", itemService);
        ReflectionTestUtils.setField(service, "processService", processService);
        ReflectionTestUtils.setField(service, "productionForecastService", forecastService);
        ReflectionTestUtils.setField(service, "calendarEventService", calendarEventService);
        ReflectionTestUtils.setField(
                service, "loomProcessHistoryRepository", loomProcessHistoryRepository);
        ReflectionTestUtils.setField(service, "loomMapper", new LoomMapper());

        assertThatThrownBy(() -> service.deleteById("loom-1"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class)
                .hasMessageContaining("codice Tela");
        verify(processService, never()).save(any());
        verify(loomRepository, never()).delete(any());
        assertThat(assignment.getStatus()).isEqualTo(LoomItemAssignment.StatusEnum.RUNNING);
        process.setPiecesRun(0);
        process.setMetersRun(0d);
        assertThat(service.deleteById("loom-1")).isTrue();

        assertThat(assignment.getStatus()).isEqualTo(LoomItemAssignment.StatusEnum.ABANDONED);
        assertThat(assignment.getLoomId()).isNull();
        assertThat(process.getTotalMeters()).isEqualTo(0d);
        assertThat(process.getTotalPieces()).isEqualTo(0);
        assertThat(process.getEndDate()).isNotNull();
        assertThat(process.getExpectedEndDate()).isNull();
        assertThat(process.getLoom())
                .satisfies(
                        snapshot -> {
                            assertThat(snapshot.getId()).isEqualTo("loom-1");
                            assertThat(snapshot.getSerialNumber()).isEqualTo("TEL-42");
                            assertThat(snapshot.getStatus()).isEqualTo(Loom.StatusEnum.STOPPED);
                        });
        assertThat(item.getProcessing()).containsExactly(process);
        verify(itemService).save(item);
        verify(assignmentRepository).save(assignment);
        verify(calendarEventService).deleteLoomExpectedEndDateEvent("process-1");
        verify(forecastService).recalculateProductionForecast("item-1");
        verify(loomProcessHistoryRepository).deleteAll(List.of());
        verify(loomRepository).delete(loom);
    }
}
