package org.openapitools.service;

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
        Set<String> runningItemIds = new HashSet<>();

        for (LoomItemAssignmentEntity assignment : assignmentRepository.findAll()) {
            if (assignment != null
                    && assignment.getStatus() == LoomItemAssignment.StatusEnum.RUNNING
                    && !isBlank(assignment.getItemId())) {
                runningItemIds.add(assignment.getItemId());
            }
        }

        for (String itemId : runningItemIds) {
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
        Instant expectedEndDate = calculateExpectedEndDateFromNow(remainingDays);

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

        Instant deliveryDate = arrangementRepository.findById(item.getArrangementId())
                .map(arrangement -> arrangement.getDeliveryDate())
                .orElse(null);

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
        Instant estimatedCompletionDate = calculateExpectedEndDateFromNow(remainingMeters / currentDailyCapacity);

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
                    || assignment.getStatus() != LoomItemAssignment.StatusEnum.RUNNING
                    || isBlank(assignment.getProcessId())
                    || !processIds.add(assignment.getProcessId())) {
                continue;
            }

            processRepository.findById(assignment.getProcessId())
                    .ifPresent(process -> runningProcesses.add(new RunningProcessForecast(
                            assignment,
                            process,
                            processService.calculateDailyCapacity(process)
                    )));
        }

        return runningProcesses;
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

    private record RunningProcessForecast(
            LoomItemAssignmentEntity assignment,
            ProcessEntity process,
            float dailyCapacity
    ) {
    }
}
