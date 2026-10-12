package org.openapitools.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.openapitools.domain.ItemEntity;
import org.openapitools.domain.LoomEntity;
import org.openapitools.domain.ProcessEntity;
import org.openapitools.mapper.LoomMapper;
import org.openapitools.model.Loom;
import org.openapitools.model.LoomItemAssignment;
import org.openapitools.repository.ItemRepository;
import org.openapitools.repository.LoomItemAssignmentRepository;
import org.openapitools.repository.LoomRepository;
import org.openapitools.repository.ProcessRepository;

class ProcessServiceTest {

    @Test
    void createsAssignedProcessesWithTheCurrentDispositionInsteadOfClientCopies() {
        var processes = mock(ProcessRepository.class);
        var assignments = mock(LoomItemAssignmentRepository.class);
        var items = mock(ItemRepository.class);
        var looms = mock(LoomRepository.class);
        var arrangements = mock(org.openapitools.repository.ArrangementRepository.class);
        var forecasts = mock(ProductionForecastService.class);
        var service =
                new ProcessService(
                        processes,
                        mock(org.openapitools.repository.FabricRepository.class),
                        assignments,
                        items,
                        looms,
                        new LoomMapper(),
                        arrangements,
                        forecasts);
        ItemEntity item = new ItemEntity();
        item.setId("item");
        item.setArrangementId("arrangement");
        LoomEntity loom = new LoomEntity();
        loom.setId("loom");
        var arrangement = new org.openapitools.domain.ArrangementEntity();
        arrangement.setPieceLenght(12f);
        arrangement.setHitsPerDm(new java.math.BigDecimal("250"));
        when(items.findById("item")).thenReturn(Optional.of(item));
        when(looms.findById("loom")).thenReturn(Optional.of(loom));
        when(arrangements.findById("arrangement")).thenReturn(Optional.of(arrangement));
        when(processes.save(org.mockito.ArgumentMatchers.any()))
                .thenAnswer(
                        invocation -> {
                            ProcessEntity process = invocation.getArgument(0);
                            process.setId("process");
                            return process;
                        });
        when(assignments.save(org.mockito.ArgumentMatchers.any()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        ProcessEntity request = new ProcessEntity();
        request.setLoom(new Loom().id("loom"));
        request.setFabricCode("TELA-1");
        request.setTotalMeters(120d);
        request.setMetersPerPiece(10d);
        request.setTotalPieces(12);
        var created = service.createAssignedProcess("item", request);
        org.assertj.core.api.Assertions.assertThat(created.process().getMetersPerPiece())
                .isEqualTo(12d);
        org.assertj.core.api.Assertions.assertThat(created.process().getTotalPieces())
                .isEqualTo(10);
        org.assertj.core.api.Assertions.assertThat(created.process().getItemHitsPerDm())
                .isEqualTo(250d);
    }

    @Test
    void staleProcessUpdatesDoNotUndoTheRetroactiveCorrection() {
        var processes = mock(ProcessRepository.class);
        var service =
                new ProcessService(
                        processes,
                        mock(org.openapitools.repository.FabricRepository.class),
                        mock(LoomItemAssignmentRepository.class),
                        mock(ItemRepository.class),
                        mock(LoomRepository.class),
                        new LoomMapper(),
                        mock(org.openapitools.repository.ArrangementRepository.class),
                        mock(ProductionForecastService.class));
        ProcessEntity corrected = new ProcessEntity();
        corrected.setMetersPerPiece(12d);
        corrected.setTotalMeters(120d);
        corrected.setMetersRun(24d);
        corrected.setMetersToGo(96d);
        corrected.setTotalPieces(10);
        corrected.setPiecesRun(2);
        corrected.setItemHitsPerDm(250d);
        when(processes.findById("process")).thenReturn(Optional.of(corrected));
        when(processes.save(org.mockito.ArgumentMatchers.any()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        ProcessEntity oldRequest = new ProcessEntity();
        oldRequest.setMetersPerPiece(10d);
        oldRequest.setTotalMeters(100d);
        oldRequest.setMetersRun(20d);
        var updated = service.update("process", oldRequest).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(updated.getMetersPerPiece()).isEqualTo(12d);
        org.assertj.core.api.Assertions.assertThat(updated.getMetersRun()).isEqualTo(24d);
        org.assertj.core.api.Assertions.assertThat(updated.getTotalMeters()).isEqualTo(120d);
        oldRequest.setMetersPerPiece(12d);
        oldRequest.setItemHitsPerDm(200d);
        org.assertj.core.api.Assertions.assertThat(
                        service.update("process", oldRequest).orElseThrow().getItemHitsPerDm())
                .isEqualTo(250d);
    }

    @Test
    void refusesDuplicateActiveProductionBeforeSavingAnything() {
        ProcessRepository processRepository = mock(ProcessRepository.class);
        LoomItemAssignmentRepository assignmentRepository =
                mock(LoomItemAssignmentRepository.class);
        ItemRepository itemRepository = mock(ItemRepository.class);
        LoomRepository loomRepository = mock(LoomRepository.class);
        LoomMapper loomMapper = mock(LoomMapper.class);
        ProductionForecastService forecastService = mock(ProductionForecastService.class);
        ProcessService service =
                new ProcessService(
                        processRepository,
                        mock(org.openapitools.repository.FabricRepository.class),
                        assignmentRepository,
                        itemRepository,
                        loomRepository,
                        loomMapper,
                        mock(org.openapitools.repository.ArrangementRepository.class),
                        forecastService);

        ItemEntity item = new ItemEntity();
        item.setId("item-1");
        LoomEntity loom = new LoomEntity();
        loom.setId("loom-1");
        when(itemRepository.findById("item-1")).thenReturn(Optional.of(item));
        when(loomRepository.findById("loom-1")).thenReturn(Optional.of(loom));
        when(assignmentRepository.existsByItemIdAndLoomIdAndStatusIn(
                        "item-1",
                        "loom-1",
                        List.of(
                                LoomItemAssignment.StatusEnum.QUEUED,
                                LoomItemAssignment.StatusEnum.RUNNING)))
                .thenReturn(true);

        ProcessEntity request = new ProcessEntity();
        Loom processLoom = new Loom();
        processLoom.setId("loom-1");
        request.setLoom(processLoom);

        assertThatThrownBy(() -> service.createAssignedProcess("item-1", request))
                .isInstanceOf(DuplicateItemLoomAssignmentException.class)
                .hasMessageContaining("Esiste già una produzione attiva o in coda");

        verify(processRepository, never()).save(request);
        verify(itemRepository, never()).save(item);
        verify(assignmentRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
