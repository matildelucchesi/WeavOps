package org.openapitools.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.openapitools.domain.LoomItemAssignmentEntity;
import org.openapitools.model.LoomItemAssignment;
import org.openapitools.repository.LoomItemAssignmentRepository;

class LoomItemAssignmentServiceTest {
    @Test
    void refusesStartingAssignmentWhenLoomAlreadyHasRunningProduction() {
        LoomItemAssignmentRepository repository = mock(LoomItemAssignmentRepository.class);
        LoomItemAssignmentService service = new LoomItemAssignmentService(repository);

        LoomItemAssignmentEntity queued =
                assignment("queued-1", LoomItemAssignment.StatusEnum.QUEUED);
        LoomItemAssignmentEntity running =
                assignment("running-1", LoomItemAssignment.StatusEnum.RUNNING);
        when(repository.findById("queued-1")).thenReturn(Optional.of(queued));
        when(repository.findByLoomIdAndStatus("loom-1", LoomItemAssignment.StatusEnum.RUNNING))
                .thenReturn(List.of(running));

        LoomItemAssignmentEntity request = new LoomItemAssignmentEntity();
        request.setStatus(LoomItemAssignment.StatusEnum.RUNNING);

        assertThatThrownBy(() -> service.update("queued-1", request))
                .isInstanceOf(LoomAlreadyRunningException.class)
                .hasMessageContaining("già una lavorazione in corso");
        verify(repository, never()).save(any());
    }

    @Test
    void refusesCreatingAssignmentDirectlyAsRunning() {
        LoomItemAssignmentRepository repository = mock(LoomItemAssignmentRepository.class);
        LoomItemAssignmentService service = new LoomItemAssignmentService(repository);
        LoomItemAssignmentEntity request = assignment(null, LoomItemAssignment.StatusEnum.RUNNING);

        assertThatThrownBy(() -> service.save(request))
                .isInstanceOf(LoomAlreadyRunningException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void refusesCreatingQueuedAssignmentForAnItemAlreadyQueuedOnTheSameLoom() {
        LoomItemAssignmentRepository repository = mock(LoomItemAssignmentRepository.class);
        LoomItemAssignmentService service = new LoomItemAssignmentService(repository);
        LoomItemAssignmentEntity existing =
                assignment("existing", LoomItemAssignment.StatusEnum.QUEUED);
        LoomItemAssignmentEntity request = assignment(null, LoomItemAssignment.StatusEnum.QUEUED);
        when(repository.findByItemIdAndLoomIdAndStatusIn(
                        "item-1",
                        "loom-1",
                        List.of(
                                LoomItemAssignment.StatusEnum.QUEUED,
                                LoomItemAssignment.StatusEnum.RUNNING)))
                .thenReturn(List.of(existing));

        assertThatThrownBy(() -> service.save(request))
                .isInstanceOf(DuplicateItemLoomAssignmentException.class)
                .hasMessageContaining("Esiste già una produzione attiva o in coda");
        verify(repository, never()).save(any());
    }

    @Test
    void allowsAQueuedAssignmentAfterThePreviousProductionIsCompleted() {
        LoomItemAssignmentRepository repository = mock(LoomItemAssignmentRepository.class);
        LoomItemAssignmentService service = new LoomItemAssignmentService(repository);
        LoomItemAssignmentEntity request = assignment(null, LoomItemAssignment.StatusEnum.QUEUED);
        when(repository.findByItemIdAndLoomIdAndStatusIn(
                        "item-1",
                        "loom-1",
                        List.of(
                                LoomItemAssignment.StatusEnum.QUEUED,
                                LoomItemAssignment.StatusEnum.RUNNING)))
                .thenReturn(List.of());
        when(repository.save(request)).thenReturn(request);

        assertThat(service.save(request)).isSameAs(request);
        verify(repository).save(request);
    }

    private LoomItemAssignmentEntity assignment(String id, LoomItemAssignment.StatusEnum status) {
        LoomItemAssignmentEntity assignment = new LoomItemAssignmentEntity();
        assignment.setId(id);
        assignment.setLoomId("loom-1");
        assignment.setItemId("item-1");
        assignment.setProcessId("process-1");
        assignment.setStatus(status);
        return assignment;
    }
}
