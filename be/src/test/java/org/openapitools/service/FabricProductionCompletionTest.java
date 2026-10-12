package org.openapitools.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.openapitools.domain.*;
import org.openapitools.mapper.LoomMapper;
import org.openapitools.model.Loom;
import org.openapitools.model.LoomItemAssignment;
import org.openapitools.repository.LoomItemAssignmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

class FabricProductionCompletionTest {
    private LoomItemAssignmentRepository repository;
    private LoomItemAssignmentService service;
    private FabricService fabrics;
    private ProcessService processes;
    private LoomService looms;
    private ItemEntity item;
    private ProcessEntity process;
    private LoomItemAssignmentEntity existing;

    @BeforeEach
    void setup() {
        repository = mock(LoomItemAssignmentRepository.class);
        service = new LoomItemAssignmentService(repository);
        fabrics = mock(FabricService.class);
        processes = mock(ProcessService.class);
        looms = mock(LoomService.class);
        ItemService items = mock(ItemService.class);
        ReflectionTestUtils.setField(service, "fabricService", fabrics);
        ReflectionTestUtils.setField(service, "processService", processes);
        ReflectionTestUtils.setField(service, "loomService", looms);
        ReflectionTestUtils.setField(service, "itemService", items);
        LoomMapper mapper = mock(LoomMapper.class);
        when(mapper.toDto(any())).thenReturn(new Loom());
        ReflectionTestUtils.setField(service, "loomMapper", mapper);
        ReflectionTestUtils.setField(
                service, "productionForecastService", mock(ProductionForecastService.class));
        ReflectionTestUtils.setField(service, "loomLogService", mock(LoomLogService.class));
        item = new ItemEntity();
        item.setId("item");
        process = new ProcessEntity();
        process.setId("process");
        process.setPiecesRun(3);
        item.setProcessing(new ArrayList<>(java.util.List.of(process)));
        LoomEntity loom = new LoomEntity();
        loom.setId("loom");
        existing = new LoomItemAssignmentEntity();
        existing.setId("assignment");
        existing.setLoomId("loom");
        existing.setItemId("item");
        existing.setProcessId("process");
        existing.setStatus(LoomItemAssignment.StatusEnum.RUNNING);
        when(repository.findById("assignment")).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(looms.findById("loom")).thenReturn(Optional.of(loom));
        when(items.findById("item")).thenReturn(Optional.of(item));
        when(processes.findById("process")).thenReturn(Optional.of(process));
    }

    @ParameterizedTest
    @EnumSource(
            value = LoomItemAssignment.StatusEnum.class,
            names = {"COMPLETED", "ABANDONED"})
    void bothCompletionAndAbandonmentRegisterTheFabricBeforeClosing(
            LoomItemAssignment.StatusEnum status) {
        LoomItemAssignmentEntity request = new LoomItemAssignmentEntity();
        request.setStatus(status);
        request.setFabricCode("TELA-1");
        request.setFabricCertificationId("grs");
        assertThat(service.update("assignment", request)).isPresent();
        var order = inOrder(fabrics, processes, repository);
        order.verify(fabrics)
                .createFromProduction(
                        eq(item), eq(process), eq("TELA-1"), eq("grs"), any(Instant.class));
        order.verify(processes).save(process);
        order.verify(repository).save(request);
        assertThat(process.getEndDate()).isNotNull();
    }

    @Test
    void invalidFabricStopsTheClosureBeforeAnyProductionWrite() {
        doThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Codice Tela mancante"))
                .when(fabrics)
                .createFromProduction(any(), any(), any(), any(), any());
        LoomItemAssignmentEntity request = new LoomItemAssignmentEntity();
        request.setStatus(LoomItemAssignment.StatusEnum.ABANDONED);
        assertThatThrownBy(() -> service.update("assignment", request))
                .isInstanceOf(ResponseStatusException.class);
        verify(processes, never()).save(any());
        verify(looms, never()).save(any());
        verify(repository, never()).save(any());
        assertThat(process.getEndDate()).isNull();
    }

    @Test
    void repeatedClosureDoesNotRegisterAnotherFabricOrChangeTheEndDate() {
        existing.setStatus(LoomItemAssignment.StatusEnum.COMPLETED);
        LoomItemAssignmentEntity request = new LoomItemAssignmentEntity();
        request.setStatus(LoomItemAssignment.StatusEnum.COMPLETED);
        service.update("assignment", request);
        verifyNoInteractions(fabrics);
        verify(processes, never()).save(any());
    }

    @Test
    void closedProductionCannotBeReopenedOrReassigned() {
        existing.setStatus(LoomItemAssignment.StatusEnum.ABANDONED);
        LoomItemAssignmentEntity request = new LoomItemAssignmentEntity();
        request.setStatus(LoomItemAssignment.StatusEnum.RUNNING);
        assertThatThrownBy(() -> service.update("assignment", request))
                .isInstanceOf(ResponseStatusException.class);
        request.setStatus(LoomItemAssignment.StatusEnum.ABANDONED);
        request.setProcessId("other-process");
        assertThatThrownBy(() -> service.update("assignment", request))
                .isInstanceOf(ResponseStatusException.class);
    }
}
