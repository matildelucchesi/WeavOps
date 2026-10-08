package org.openapitools.service;

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

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProcessServiceTest {

    @Test
    void refusesDuplicateActiveProductionBeforeSavingAnything() {
        ProcessRepository processRepository = mock(ProcessRepository.class);
        LoomItemAssignmentRepository assignmentRepository = mock(LoomItemAssignmentRepository.class);
        ItemRepository itemRepository = mock(ItemRepository.class);
        LoomRepository loomRepository = mock(LoomRepository.class);
        LoomMapper loomMapper = mock(LoomMapper.class);
        ProductionForecastService forecastService = mock(ProductionForecastService.class);
        ProcessService service = new ProcessService(
                processRepository,
                assignmentRepository,
                itemRepository,
                loomRepository,
                loomMapper,
                forecastService
        );

        ItemEntity item = new ItemEntity();
        item.setId("item-1");
        LoomEntity loom = new LoomEntity();
        loom.setId("loom-1");
        when(itemRepository.findById("item-1")).thenReturn(Optional.of(item));
        when(loomRepository.findById("loom-1")).thenReturn(Optional.of(loom));
        when(assignmentRepository.existsByItemIdAndLoomIdAndStatusIn(
                "item-1",
                "loom-1",
                List.of(LoomItemAssignment.StatusEnum.QUEUED, LoomItemAssignment.StatusEnum.RUNNING)
        )).thenReturn(true);

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
