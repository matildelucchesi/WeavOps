package org.openapitools.service;

import org.junit.jupiter.api.Test;
import org.openapitools.domain.ArrangementEntity;
import org.openapitools.domain.ItemEntity;
import org.openapitools.domain.LoomItemAssignmentEntity;
import org.openapitools.domain.ProcessEntity;
import org.openapitools.domain.LoomEntity;
import org.openapitools.model.LoomItemAssignment;
import org.openapitools.model.ProductionAdvice;
import org.openapitools.repository.ArrangementRepository;
import org.openapitools.repository.ItemRepository;
import org.openapitools.repository.LoomItemAssignmentRepository;
import org.openapitools.repository.LoomRepository;
import org.openapitools.repository.ProcessRepository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class ProductionForecastServiceTest {
    private static final Instant FRIDAY_START = Instant.parse("2026-10-09T00:00:00Z");
    private static final Instant MONDAY_END = Instant.parse("2026-10-12T00:00:00Z");

    @Test
    void availableWorkingDaysUseConfiguredWeekendHoursAndSkipClosures() {
        CalendarEventService calendar = mock(CalendarEventService.class);
        when(calendar.findClosureDates()).thenReturn(Set.of(LocalDate.parse("2026-10-10")));
        ProductionForecastService service = createService(calendar);

        ArrangementEntity arrangement = new ArrangementEntity();
        arrangement.setWorksSaturday(true);
        arrangement.setSaturdayStartTime("06:00");
        arrangement.setSaturdayEndTime("10:00");
        arrangement.setWorksSunday(true);
        arrangement.setSundayStartTime("12:00");
        arrangement.setSundayEndTime("16:00");

        float days = service.calculateAvailableWorkingDays(FRIDAY_START, MONDAY_END, arrangement);

        // Friday contributes 22 h, Saturday is closed, Sunday contributes 4 h, Monday 2 h.
        assertEquals(28f / 24f, days, 0.0001f);
    }

    @Test
    void legacyContinuousScheduleUsesElapsedTimeExceptForClosureDays() {
        CalendarEventService calendar = mock(CalendarEventService.class);
        when(calendar.findClosureDates()).thenReturn(Set.of(LocalDate.parse("2026-10-10")));
        ProductionForecastService service = createService(calendar);

        float days = service.calculateAvailableWorkingDays(FRIDAY_START, MONDAY_END, new ArrangementEntity());

        assertEquals(2f, days, 0.0001f);
    }

    @Test
    void productionAdviceDividesCapacityNeedByEffectiveWorkingDays() {
        ItemRepository items = mock(ItemRepository.class);
        ArrangementRepository arrangements = mock(ArrangementRepository.class);
        LoomItemAssignmentRepository assignments = mock(LoomItemAssignmentRepository.class);
        ProcessRepository processes = mock(ProcessRepository.class);
        ProcessService processService = mock(ProcessService.class);
        CalendarEventService calendar = mock(CalendarEventService.class);

        Instant now = Instant.now();
        Instant delivery = now.plusSeconds(7 * 24 * 60 * 60L);
        ItemEntity item = new ItemEntity();
        item.setId("item-1");
        item.setArrangementId("arrangement-1");
        item.setTotalMeters(1_000d);
        item.setMetersRun(100d);
        ArrangementEntity arrangement = new ArrangementEntity();
        arrangement.setId(item.getArrangementId());
        arrangement.setDeliveryDate(delivery);
        arrangement.setWorksSaturday(false);
        arrangement.setWorksSunday(false);
        LoomItemAssignmentEntity assignment = new LoomItemAssignmentEntity();
        assignment.setId("assignment-1");
        assignment.setItemId(item.getId());
        assignment.setLoomId("loom-1");
        assignment.setProcessId("process-1");
        assignment.setStatus(LoomItemAssignment.StatusEnum.RUNNING);
        ProcessEntity process = new ProcessEntity();
        process.setId("process-1");
        process.setItemHitsPerDm(10d);

        when(items.findById(item.getId())).thenReturn(Optional.of(item));
        when(arrangements.findById(arrangement.getId())).thenReturn(Optional.of(arrangement));
        when(assignments.findByItemId(item.getId())).thenReturn(List.of(assignment));
        when(processes.findById(process.getId())).thenReturn(Optional.of(process));
        when(processService.calculateDailyCapacity(any())).thenReturn(100f);
        when(calendar.findClosureDates()).thenReturn(Set.of());

        ProductionForecastService service = new ProductionForecastService(
                items, arrangements, assignments, processes, mock(LoomRepository.class), processService, calendar
        );
        float effectiveDays = service.calculateAvailableWorkingDays(now, delivery, arrangement);
        ProductionAdvice advice = service.calculateProductionAdvice(item.getId()).orElseThrow();

        assertEquals(900f / effectiveDays, advice.getRequiredDailyCapacity(), 0.01f);
        assertTrue(advice.getRequiredDailyCapacity() > 900f / 7f);
        assertEquals(7f, advice.getDaysUntilDelivery(), 0.01f);
    }

    @Test
    void initialAdviceTreatsQueuedLoomsAsTheoreticalCapacityEvenIfCurrentlyBusy() {
        ItemRepository items = mock(ItemRepository.class);
        ArrangementRepository arrangements = mock(ArrangementRepository.class);
        LoomItemAssignmentRepository assignments = mock(LoomItemAssignmentRepository.class);
        ProcessRepository processes = mock(ProcessRepository.class);
        LoomRepository looms = mock(LoomRepository.class);
        ProcessService processService = mock(ProcessService.class);
        CalendarEventService calendar = mock(CalendarEventService.class);

        ItemEntity item = itemWithDeliveryDate();
        ArrangementEntity arrangement = arrangementFor(item);
        LoomItemAssignmentEntity queued = assignment("queued", item.getId(), "loom-1", "queued-process",
                LoomItemAssignment.StatusEnum.QUEUED);
        ProcessEntity process = process("queued-process");
        LoomItemAssignmentEntity otherItemRunning = assignment("running-other", "other-item", "loom-1", "other-process",
                LoomItemAssignment.StatusEnum.RUNNING);

        when(items.findById(item.getId())).thenReturn(Optional.of(item));
        when(arrangements.findById(arrangement.getId())).thenReturn(Optional.of(arrangement));
        when(assignments.findByItemId(item.getId())).thenReturn(List.of(queued));
        when(processes.findById(process.getId())).thenReturn(Optional.of(process));
        when(assignments.findByLoomIdAndStatus("loom-1", LoomItemAssignment.StatusEnum.RUNNING))
                .thenReturn(List.of(otherItemRunning));
        when(processService.calculateDailyCapacity(process)).thenReturn(100f);
        when(calendar.findClosureDates()).thenReturn(Set.of());

        ProductionForecastService service = new ProductionForecastService(
                items, arrangements, assignments, processes, looms, processService, calendar
        );

        ProductionAdvice advice = service.calculateProductionAdvice(item.getId()).orElseThrow();

        assertEquals(1, advice.getCurrentRunningLooms());
        assertEquals(100f, advice.getCurrentDailyCapacity(), 0.001f);
        verify(looms, never()).findById("loom-1");
    }

    @Test
    void operationalForecastExcludesQueuedCapacityOnALoomRunningAnotherItem() {
        ItemRepository items = mock(ItemRepository.class);
        ArrangementRepository arrangements = mock(ArrangementRepository.class);
        LoomItemAssignmentRepository assignments = mock(LoomItemAssignmentRepository.class);
        ProcessRepository processes = mock(ProcessRepository.class);
        LoomRepository looms = mock(LoomRepository.class);
        ProcessService processService = mock(ProcessService.class);
        CalendarEventService calendar = mock(CalendarEventService.class);

        ItemEntity item = itemWithDeliveryDate();
        ProcessEntity runningProcess = process("running-process");
        ProcessEntity queuedProcess = process("queued-process");
        item.setProcessing(new ArrayList<>(List.of(runningProcess, queuedProcess)));
        ArrangementEntity arrangement = arrangementFor(item);
        LoomItemAssignmentEntity running = assignment("running", item.getId(), "loom-1", "running-process",
                LoomItemAssignment.StatusEnum.RUNNING);
        LoomItemAssignmentEntity queued = assignment("queued", item.getId(), "loom-2", "queued-process",
                LoomItemAssignment.StatusEnum.QUEUED);
        LoomItemAssignmentEntity otherItemRunning = assignment("other-running", "other-item", "loom-2", "other-process",
                LoomItemAssignment.StatusEnum.RUNNING);
        LoomEntity busyLoom = new LoomEntity();
        busyLoom.setId("loom-2");
        busyLoom.setStatus(org.openapitools.model.Loom.StatusEnum.WORKING);
        LoomEntity runningLoom = new LoomEntity();
        runningLoom.setId("loom-1");
        runningLoom.setStatus(org.openapitools.model.Loom.StatusEnum.WORKING);

        when(items.findById(item.getId())).thenReturn(Optional.of(item));
        when(items.save(any(ItemEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(arrangements.findById(arrangement.getId())).thenReturn(Optional.of(arrangement));
        when(assignments.findByItemId(item.getId())).thenReturn(List.of(running, queued));
        when(assignments.findByLoomIdAndStatus("loom-2", LoomItemAssignment.StatusEnum.RUNNING))
                .thenReturn(List.of(otherItemRunning));
        when(processes.findById("running-process")).thenReturn(Optional.of(runningProcess));
        when(processes.findById("queued-process")).thenReturn(Optional.of(queuedProcess));
        when(processes.save(any(ProcessEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(looms.findById("loom-1")).thenReturn(Optional.of(runningLoom));
        when(looms.findById("loom-2")).thenReturn(Optional.of(busyLoom));
        when(processService.calculateDailyCapacity(runningProcess)).thenReturn(100f);
        when(calendar.findClosureDates()).thenReturn(Set.of());

        ProductionForecastService service = new ProductionForecastService(
                items, arrangements, assignments, processes, looms, processService, calendar
        );

        ItemEntity forecasted = service.recalculateProductionForecast(item.getId()).orElseThrow();

        long expectedEndEpoch = Instant.now().plusSeconds(9 * 24 * 60 * 60L).getEpochSecond();
        long actualEndEpoch = forecasted.getExpectedEndDate().getEpochSecond();
        assertTrue(Math.abs(actualEndEpoch - expectedEndEpoch) <= 2L);
        assertEquals(0f, queuedProcess.getDays());
        assertTrue(queuedProcess.getExpectedEndDate() == null);
        verify(processService, times(1)).calculateDailyCapacity(runningProcess);
        verify(processService, never()).calculateDailyCapacity(queuedProcess);
    }

    private ItemEntity itemWithDeliveryDate() {
        ItemEntity item = new ItemEntity();
        item.setId("item-1");
        item.setArrangementId("arrangement-1");
        item.setTotalMeters(1_000d);
        item.setMetersRun(100d);
        return item;
    }

    private ArrangementEntity arrangementFor(ItemEntity item) {
        ArrangementEntity arrangement = new ArrangementEntity();
        arrangement.setId(item.getArrangementId());
        arrangement.setDeliveryDate(Instant.now().plusSeconds(14 * 24 * 60 * 60L));
        return arrangement;
    }

    private LoomItemAssignmentEntity assignment(
            String id,
            String itemId,
            String loomId,
            String processId,
            LoomItemAssignment.StatusEnum status
    ) {
        LoomItemAssignmentEntity assignment = new LoomItemAssignmentEntity();
        assignment.setId(id);
        assignment.setItemId(itemId);
        assignment.setLoomId(loomId);
        assignment.setProcessId(processId);
        assignment.setStatus(status);
        return assignment;
    }

    private ProcessEntity process(String id) {
        ProcessEntity process = new ProcessEntity();
        process.setId(id);
        process.setItemHitsPerDm(10d);
        return process;
    }

    private ProductionForecastService createService(CalendarEventService calendar) {
        return new ProductionForecastService(
                mock(ItemRepository.class),
                mock(ArrangementRepository.class),
                mock(LoomItemAssignmentRepository.class),
                mock(ProcessRepository.class),
                mock(LoomRepository.class),
                mock(ProcessService.class),
                calendar
        );
    }
}
