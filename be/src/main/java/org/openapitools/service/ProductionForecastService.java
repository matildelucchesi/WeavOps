package org.openapitools.service;

import org.openapitools.domain.ArrangementEntity;
import org.openapitools.domain.ItemEntity;
import org.openapitools.domain.LoomEntity;
import org.openapitools.domain.LoomItemAssignmentEntity;
import org.openapitools.domain.ProcessEntity;
import org.openapitools.model.LoomItemAssignment;
import org.openapitools.model.ProductionAdvice;
import org.openapitools.repository.ArrangementRepository;
import org.openapitools.repository.ItemRepository;
import org.openapitools.repository.LoomItemAssignmentRepository;
import org.openapitools.repository.LoomRepository;
import org.openapitools.repository.ProcessRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.time.ZonedDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ProductionForecastService {
    private static final long MILLIS_PER_DAY = 86_400_000L;
    private static final ZoneId BUSINESS_TIME_ZONE = ZoneId.of("Europe/Rome");

    private final ItemRepository itemRepository;
    private final ArrangementRepository arrangementRepository;
    private final LoomItemAssignmentRepository assignmentRepository;
    private final ProcessRepository processRepository;
    private final LoomRepository loomRepository;
    private final ProcessService processService;
    private final CalendarEventService calendarEventService;

    public ProductionForecastService(
            ItemRepository itemRepository,
            ArrangementRepository arrangementRepository,
            LoomItemAssignmentRepository assignmentRepository,
            ProcessRepository processRepository,
            LoomRepository loomRepository,
            ProcessService processService,
            CalendarEventService calendarEventService
    ) {
        this.itemRepository = itemRepository;
        this.arrangementRepository = arrangementRepository;
        this.assignmentRepository = assignmentRepository;
        this.processRepository = processRepository;
        this.loomRepository = loomRepository;
        this.processService = processService;
        this.calendarEventService = calendarEventService;
    }

    @Transactional(rollbackFor = Exception.class)
    public Optional<ItemEntity> recalculateProductionForecast(String itemId) {
        if (isBlank(itemId)) {
            return Optional.empty();
        }

        return itemRepository.findById(itemId)
                .flatMap(item -> recalculateProductionForecast(item, null));
    }

    public Optional<ProductionAdvice> calculateProductionAdvice(String itemId) {
        if (isBlank(itemId)) {
            return Optional.empty();
        }

        return itemRepository.findById(itemId)
                .flatMap(this::buildProductionAdvice);
    }

    @Transactional(rollbackFor = Exception.class)
    public void recalculateProductionForecastForProcess(String processId) {
        if (isBlank(processId)) {
            return;
        }

        assignmentRepository.findByProcessId(processId)
                .map(LoomItemAssignmentEntity::getItemId)
                .filter(itemId -> !isBlank(itemId))
                .ifPresent(this::recalculateProductionForecast);
    }

    @Transactional(rollbackFor = Exception.class)
    public void recalculateAllProductionForecasts() {
        Set<String> activeItemIds = new HashSet<>();

        for (LoomItemAssignmentEntity assignment : assignmentRepository.findAll()) {
            if (assignment != null
                    && isForecastAssignment(assignment)
                    && !isBlank(assignment.getItemId())) {
                activeItemIds.add(assignment.getItemId());
            }
        }

        for (String itemId : activeItemIds) {
            recalculateProductionForecast(itemId);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public Optional<ItemEntity> recalculateProductionForecast(
            ItemEntity item,
            LoomItemAssignmentEntity currentAssignment
    ) {
        if (item == null || isBlank(item.getId())) {
            return Optional.empty();
        }

        List<LoomItemAssignmentEntity> assignments = getAssignmentsWithCurrentUpdate(
                item.getId(),
                currentAssignment
        );
        clearCurrentNonRunningForecast(item, currentAssignment);

        List<RunningProcessForecast> runningProcesses = getRunningProcessForecasts(assignments);

        if (runningProcesses.isEmpty()) {
            return saveForecast(item, runningProcesses, null, 0);
        }

        float totalDailyCapacity = calculateTotalDailyCapacity(runningProcesses);

        if (totalDailyCapacity <= 0) {
            return saveForecast(item, runningProcesses, null, 0);
        }

        int remainingMeters = calculateRemainingMeters(item);
        float remainingDays = remainingMeters <= 0 ? 0 : remainingMeters / totalDailyCapacity;
        ArrangementEntity arrangement = isBlank(item.getArrangementId()) ? null : arrangementRepository.findById(item.getArrangementId()).orElse(null);
        Instant expectedEndDate = hasWeekendSchedule(arrangement)
                ? calculateExpectedEndDateWithWeekendSchedule(Instant.now(), remainingDays * MILLIS_PER_DAY, arrangement)
                : calculateExpectedEndDateFromNow(remainingDays);

        return saveForecast(item, runningProcesses, expectedEndDate, remainingDays);
    }

    private List<LoomItemAssignmentEntity> getAssignmentsWithCurrentUpdate(
            String itemId,
            LoomItemAssignmentEntity currentAssignment
    ) {
        List<LoomItemAssignmentEntity> assignments = new ArrayList<>();
        boolean currentAssignmentAdded = false;

        for (LoomItemAssignmentEntity assignment : assignmentRepository.findByItemId(itemId)) {
            if (isSameAssignment(assignment, currentAssignment)) {
                assignments.add(currentAssignment);
                currentAssignmentAdded = true;
                continue;
            }

            assignments.add(assignment);
        }

        if (!currentAssignmentAdded
                && currentAssignment != null
                && itemId.equals(currentAssignment.getItemId())) {
            assignments.add(currentAssignment);
        }

        return assignments;
    }

    private Optional<ProductionAdvice> buildProductionAdvice(ItemEntity item) {
        if (isBlank(item.getArrangementId())) {
            return Optional.empty();
        }

        ArrangementEntity arrangement = arrangementRepository.findById(item.getArrangementId()).orElse(null);
        Instant deliveryDate = arrangement == null ? null : arrangement.getDeliveryDate();

        if (deliveryDate == null) {
            return Optional.empty();
        }

        Instant now = Instant.now();
        float daysUntilDelivery = (float) Duration.between(now, deliveryDate).toMillis() / MILLIS_PER_DAY;

        if (daysUntilDelivery <= 0) {
            return Optional.empty();
        }

        List<RunningProcessForecast> runningProcesses = getRunningProcessForecasts(
                assignmentRepository.findByItemId(item.getId())
        );
        float currentDailyCapacity = calculateTotalDailyCapacity(runningProcesses);

        if (runningProcesses.isEmpty() || currentDailyCapacity <= 0) {
            return Optional.empty();
        }

        int remainingMeters = calculateRemainingMeters(item);
        float requiredDailyCapacity = remainingMeters / daysUntilDelivery;
        float additionalDailyCapacity = Math.max(requiredDailyCapacity - currentDailyCapacity, 0);
        float referenceDailyCapacity = currentDailyCapacity / runningProcesses.size();
        int recommendedAdditionalLooms = additionalDailyCapacity == 0
                ? 0
                : (int) Math.ceil(additionalDailyCapacity / referenceDailyCapacity);
        int recommendedTotalLooms = runningProcesses.size() + recommendedAdditionalLooms;
        Instant estimatedCompletionDate = hasWeekendSchedule(arrangement)
                ? calculateExpectedEndDateWithWeekendSchedule(now, (remainingMeters / currentDailyCapacity) * MILLIS_PER_DAY, arrangement)
                : calculateExpectedEndDateFromNow(remainingMeters / currentDailyCapacity);

        return Optional.of(new ProductionAdvice(
                remainingMeters,
                daysUntilDelivery,
                runningProcesses.size(),
                currentDailyCapacity,
                requiredDailyCapacity,
                additionalDailyCapacity,
                referenceDailyCapacity,
                recommendedAdditionalLooms,
                recommendedTotalLooms,
                OffsetDateTime.ofInstant(estimatedCompletionDate, ZoneOffset.UTC),
                OffsetDateTime.ofInstant(deliveryDate, ZoneOffset.UTC),
                recommendedAdditionalLooms == 0
        ));
    }

    private boolean isSameAssignment(
            LoomItemAssignmentEntity assignment,
            LoomItemAssignmentEntity currentAssignment
    ) {
        return assignment != null
                && currentAssignment != null
                && !isBlank(assignment.getId())
                && assignment.getId().equals(currentAssignment.getId());
    }

    private List<RunningProcessForecast> getRunningProcessForecasts(List<LoomItemAssignmentEntity> assignments) {
        List<RunningProcessForecast> runningProcesses = new ArrayList<>();
        Set<String> processIds = new HashSet<>();

        for (LoomItemAssignmentEntity assignment : assignments) {
            if (assignment == null
                    || !isForecastAssignment(assignment)
                    || isBlank(assignment.getProcessId())
                    || !processIds.add(assignment.getProcessId())) {
                continue;
            }

            processRepository.findById(assignment.getProcessId())
                    .map(process -> ensureProcessHitsPerDm(process, assignment))
                    .ifPresent(process -> runningProcesses.add(new RunningProcessForecast(
                            assignment,
                            process,
                            processService.calculateDailyCapacity(process)
                    )));
        }

        return runningProcesses;
    }

    private ProcessEntity ensureProcessHitsPerDm(ProcessEntity process, LoomItemAssignmentEntity assignment) {
        if (process == null
                || valueOrZero(process.getItemHitsPerDm()) > 0
                || assignment == null
                || isBlank(assignment.getItemId())) {
            return process;
        }

        return itemRepository.findById(assignment.getItemId())
                .filter(item -> !isBlank(item.getArrangementId()))
                .flatMap(item -> arrangementRepository.findById(item.getArrangementId()))
                .map(arrangement -> arrangement.getHitsPerDm())
                .filter(hitsPerDm -> hitsPerDm != null && hitsPerDm.signum() > 0)
                .map(hitsPerDm -> {
                    process.setItemHitsPerDm(hitsPerDm.intValue());
                    return processRepository.save(process);
                })
                .orElse(process);
    }

    /**
     * A queued process already reserves a loom and has all the production parameters
     * required for a forecast, so it must contribute before production actually starts.
     */
    private boolean isForecastAssignment(LoomItemAssignmentEntity assignment) {
        return assignment.getStatus() == LoomItemAssignment.StatusEnum.RUNNING
                || assignment.getStatus() == LoomItemAssignment.StatusEnum.QUEUED;
    }

    private float calculateTotalDailyCapacity(List<RunningProcessForecast> runningProcesses) {
        float totalDailyCapacity = 0;

        for (RunningProcessForecast runningProcess : runningProcesses) {
            totalDailyCapacity += runningProcess.dailyCapacity();
        }

        return totalDailyCapacity;
    }

    private int calculateRemainingMeters(ItemEntity item) {
        return Math.max(valueOrZero(item.getTotalMeters()) - valueOrZero(item.getMetersRun()), 0);
    }


    private boolean hasWeekendSchedule(ArrangementEntity arrangement) {
        return arrangement != null && (arrangement.getWorksSaturday() != null || arrangement.getWorksSunday() != null);
    }

    private Instant calculateExpectedEndDateWithWeekendSchedule(Instant start, double remainingWorkMillis, ArrangementEntity arrangement) {
        if (remainingWorkMillis <= 0) return start;
        Set<LocalDate> closures = calendarEventService.findClosureDates();
        Instant cursor = start;
        double remaining = remainingWorkMillis;
        LocalDate date = start.atZone(BUSINESS_TIME_ZONE).toLocalDate();
        for (int days = 0; days < 36500 && remaining > 0; days++, date = date.plusDays(1)) {
            if (closures.contains(date)) continue;
            for (TimeWindow window : getWorkWindows(date, arrangement, closures)) {
                Instant from = window.start().isAfter(cursor) ? window.start() : cursor;
                if (!window.end().isAfter(from)) continue;
                long available = Duration.between(from, window.end()).toMillis();
                if (remaining <= available) return from.plusMillis((long) Math.ceil(remaining));
                remaining -= available;
            }
        }
        return cursor;
    }

    private List<TimeWindow> getWorkWindows(LocalDate date, ArrangementEntity arrangement, Set<LocalDate> closures) {
        List<TimeWindow> windows = new ArrayList<>();
        ZonedDateTime dayStart = date.atStartOfDay(BUSINESS_TIME_ZONE);
        ZonedDateTime nextDayStart = date.plusDays(1).atStartOfDay(BUSINESS_TIME_ZONE);
        if (date.getDayOfWeek() != DayOfWeek.SATURDAY && date.getDayOfWeek() != DayOfWeek.SUNDAY) {
            windows.add(new TimeWindow(dayStart.toInstant(), nextDayStart.toInstant()));
            return windows;
        }
        if (closures.contains(date)) return windows;
        addWeekendWindow(windows, date, arrangement, false);
        LocalDate previousDate = date.minusDays(1);
        if ((previousDate.getDayOfWeek() == DayOfWeek.SATURDAY || previousDate.getDayOfWeek() == DayOfWeek.SUNDAY)
                && !closures.contains(previousDate)) {
            addWeekendWindow(windows, previousDate, arrangement, true);
        }
        windows.sort(java.util.Comparator.comparing(TimeWindow::start));
        return mergeTimeWindows(windows);
    }


    private List<TimeWindow> mergeTimeWindows(List<TimeWindow> sortedWindows) {
        if (sortedWindows.size() < 2) return sortedWindows;
        List<TimeWindow> merged = new ArrayList<>();
        TimeWindow current = sortedWindows.get(0);
        for (int index = 1; index < sortedWindows.size(); index++) {
            TimeWindow next = sortedWindows.get(index);
            if (!next.start().isAfter(current.end())) {
                current = new TimeWindow(current.start(), next.end().isAfter(current.end()) ? next.end() : current.end());
            } else {
                merged.add(current);
                current = next;
            }
        }
        merged.add(current);
        return merged;
    }
    private void addWeekendWindow(List<TimeWindow> windows, LocalDate shiftDate, ArrangementEntity arrangement, boolean overnightCarryOnly) {
        DayOfWeek day = shiftDate.getDayOfWeek();
        boolean saturday = day == DayOfWeek.SATURDAY;
        boolean enabled = saturday ? Boolean.TRUE.equals(arrangement.getWorksSaturday()) : Boolean.TRUE.equals(arrangement.getWorksSunday());
        if (!enabled) return;
        String startValue = saturday ? arrangement.getSaturdayStartTime() : arrangement.getSundayStartTime();
        String endValue = saturday ? arrangement.getSaturdayEndTime() : arrangement.getSundayEndTime();
        if (startValue == null || endValue == null) return;
        LocalTime startTime = LocalTime.parse(startValue);
        LocalTime endTime = LocalTime.parse(endValue);
        ZonedDateTime start = shiftDate.atTime(startTime).atZone(BUSINESS_TIME_ZONE);
        ZonedDateTime end = shiftDate.atTime(endTime).atZone(BUSINESS_TIME_ZONE);
        if (!end.isAfter(start)) end = end.plusDays(1);
        if (overnightCarryOnly && !end.toLocalDate().isAfter(shiftDate)) return;
        LocalDate targetDate = shiftDate.plusDays(1);
        ZonedDateTime clipStart = overnightCarryOnly ? targetDate.atStartOfDay(BUSINESS_TIME_ZONE) : start;
        ZonedDateTime clipEnd = overnightCarryOnly ? end : (end.toLocalDate().isAfter(shiftDate) ? targetDate.atStartOfDay(BUSINESS_TIME_ZONE) : end);
        if (clipEnd.isAfter(clipStart)) windows.add(new TimeWindow(clipStart.toInstant(), clipEnd.toInstant()));
        if (!overnightCarryOnly && end.toLocalDate().isAfter(shiftDate)) {
            windows.add(new TimeWindow(targetDate.atStartOfDay(BUSINESS_TIME_ZONE).toInstant(), end.toInstant()));
        }
    }
    private Instant calculateExpectedEndDateFromNow(float productionDays) {
        Instant calculationStart = Instant.now();
        Instant expectedEndDate = calculationStart
                .plus(Duration.ofMillis((long) (productionDays * MILLIS_PER_DAY)));

        return postponeForClosures(calculationStart, expectedEndDate);
    }

    private Instant postponeForClosures(Instant calculationStart, Instant expectedEndDate) {
        Set<LocalDate> closureDates = calendarEventService.findClosureDates();

        if (closureDates.isEmpty()) {
            return expectedEndDate;
        }

        LocalDate startDate = calculationStart.atZone(BUSINESS_TIME_ZONE).toLocalDate();
        Instant adjustedExpectedEndDate = expectedEndDate;
        long appliedClosures = 0;

        while (true) {
            LocalDate expectedDate = adjustedExpectedEndDate.atZone(BUSINESS_TIME_ZONE).toLocalDate();
            long closuresInProductionWindow = closureDates.stream()
                    .filter(closureDate -> !closureDate.isBefore(startDate))
                    .filter(closureDate -> !closureDate.isAfter(expectedDate))
                    .count();

            if (closuresInProductionWindow == appliedClosures) {
                return adjustedExpectedEndDate;
            }

            adjustedExpectedEndDate = expectedEndDate.plus(Duration.ofDays(closuresInProductionWindow));
            appliedClosures = closuresInProductionWindow;
        }
    }

    private Optional<ItemEntity> saveForecast(
            ItemEntity item,
            List<RunningProcessForecast> runningProcesses,
            Instant expectedEndDate,
            float remainingDays
    ) {
        for (RunningProcessForecast runningProcess : runningProcesses) {
            ProcessEntity process = runningProcess.process();

            if (expectedEndDate == null || runningProcess.dailyCapacity() <= 0) {
                process.setDays(0f);
                process.setExpectedEndDate(null);
            } else {
                process.setDays(remainingDays);
                process.setExpectedEndDate(expectedEndDate);
            }

            ProcessEntity savedProcess = processRepository.save(process);
            updateItemProcess(item, savedProcess);
            updateLoomExpectedEndDateEvent(runningProcess.assignment(), savedProcess);
        }

        item.setExpectedEndDate(expectedEndDate);
        ItemEntity savedItem = itemRepository.save(item);
        calendarEventService.createOrUpdateItemExpectedEndDateEvent(savedItem);

        return Optional.of(savedItem);
    }

    private void clearCurrentNonRunningForecast(
            ItemEntity item,
            LoomItemAssignmentEntity currentAssignment
    ) {
        if (currentAssignment == null
                || currentAssignment.getStatus() == LoomItemAssignment.StatusEnum.RUNNING
                || isBlank(currentAssignment.getProcessId())) {
            return;
        }

        processRepository.findById(currentAssignment.getProcessId()).ifPresent(process -> {
            process.setDays(0f);
            process.setExpectedEndDate(null);

            ProcessEntity savedProcess = processRepository.save(process);
            updateItemProcess(item, savedProcess);
            updateLoomExpectedEndDateEvent(currentAssignment, savedProcess);
        });
    }

    private void updateItemProcess(ItemEntity item, ProcessEntity savedProcess) {
        if (item.getProcessing() == null || savedProcess == null || isBlank(savedProcess.getId())) {
            return;
        }

        for (int index = 0; index < item.getProcessing().size(); index++) {
            ProcessEntity process = item.getProcessing().get(index);

            if (process != null && savedProcess.getId().equals(process.getId())) {
                item.getProcessing().set(index, savedProcess);
                return;
            }
        }
    }

    private void updateLoomExpectedEndDateEvent(
            LoomItemAssignmentEntity assignment,
            ProcessEntity process
    ) {
        if (assignment == null || isBlank(assignment.getLoomId())) {
            return;
        }

        Optional<LoomEntity> loom = loomRepository.findById(assignment.getLoomId());

        loom.ifPresent(loomEntity ->
                calendarEventService.createOrUpdateLoomExpectedEndDateEvent(assignment, loomEntity, process)
        );
    }

    private int valueOrZero(Integer value) {
        return value != null ? value : 0;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record TimeWindow(Instant start, Instant end) {
    }

    private record RunningProcessForecast(
            LoomItemAssignmentEntity assignment,
            ProcessEntity process,
            float dailyCapacity
    ) {
    }
}
