package org.openapitools.service;

import org.openapitools.domain.ItemEntity;
import org.openapitools.domain.LoomEntity;
import org.openapitools.domain.LoomItemAssignmentEntity;
import org.openapitools.domain.ProcessEntity;
import org.openapitools.mapper.LoomMapper;
import org.openapitools.model.Item;
import org.openapitools.model.Loom;
import org.openapitools.model.LoomItemAssignment;
import org.openapitools.repository.LoomItemAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class LoomItemAssignmentService {

    private static final Instant TEMPORARY_PROCESS_START_DATE = Instant.EPOCH;

    @Autowired
    private LoomService loomService;

    @Autowired
    private LoomMapper loomMapper;

    @Autowired
    private ItemService itemService;

    @Autowired
    private ProcessService processService;

    @Autowired
    private CalendarEventService calendarEventService;

    private final LoomItemAssignmentRepository repository;

    public LoomItemAssignmentService(LoomItemAssignmentRepository repository) {
        this.repository = repository;
    }

    public List<LoomItemAssignmentEntity> findAll() {
        return repository.findAll();
    }

    public LoomItemAssignmentEntity save(LoomItemAssignmentEntity entity) {
        return repository.save(entity);
    }

    public Optional<LoomItemAssignmentEntity> findById(String id) {
        return repository.findById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public Optional<LoomItemAssignmentEntity> update(String id, LoomItemAssignmentEntity entity) {
        return repository.findById(id).flatMap(existing -> {
            LoomItemAssignmentEntity updatedEntity = mergeWithExistingAssignment(existing, entity);

            if (isStartingProduction(existing, updatedEntity) && !startProduction(updatedEntity)) {
                return Optional.empty();
            }

            if (isEndingProduction(existing, updatedEntity) && !endProduction(updatedEntity)) {
                return Optional.empty();
            }

            return Optional.of(repository.save(updatedEntity));
        });
    }

    private LoomItemAssignmentEntity mergeWithExistingAssignment(
            LoomItemAssignmentEntity existing,
            LoomItemAssignmentEntity entity
    ) {
        entity.setId(existing.getId());

        if (entity.getLoomId() == null) {
            entity.setLoomId(existing.getLoomId());
        }

        if (entity.getItemId() == null) {
            entity.setItemId(existing.getItemId());
        }

        if (entity.getProcessId() == null) {
            entity.setProcessId(existing.getProcessId());
        }

        if (entity.getStatus() == null) {
            entity.setStatus(existing.getStatus());
        }

        return entity;
    }

    private boolean isStartingProduction(
            LoomItemAssignmentEntity existing,
            LoomItemAssignmentEntity updatedEntity
    ) {
        return updatedEntity.getStatus() == LoomItemAssignment.StatusEnum.RUNNING
                && existing.getStatus() != LoomItemAssignment.StatusEnum.RUNNING;
    }

    private boolean isEndingProduction(
            LoomItemAssignmentEntity existing,
            LoomItemAssignmentEntity updatedEntity
    ) {
        return isEndProductionStatus(updatedEntity.getStatus())
                && existing.getStatus() != updatedEntity.getStatus();
    }

    private boolean isEndProductionStatus(LoomItemAssignment.StatusEnum status) {
        return status == LoomItemAssignment.StatusEnum.COMPLETED
                || status == LoomItemAssignment.StatusEnum.ABANDONED;
    }

    private boolean startProduction(LoomItemAssignmentEntity entity) {
        if (isBlank(entity.getLoomId()) || isBlank(entity.getItemId()) || isBlank(entity.getProcessId())) {
            return false;
        }

        LoomEntity loomEntity = this.loomService.findById(entity.getLoomId()).orElse(null);
        ItemEntity itemEntity = this.itemService.findById(entity.getItemId()).orElse(null);
        ProcessEntity processEntity = this.processService.findById(entity.getProcessId()).orElse(null);

        if (loomEntity == null || itemEntity == null || processEntity == null) {
            return false;
        }

        int processIndex = findProcessIndex(itemEntity, processEntity.getId());

        if (processIndex < 0) {
            return false;
        }

        Instant now = OffsetDateTime.now().toInstant();

        loomEntity.setStatus(Loom.StatusEnum.WORKING);
        itemEntity.setState(Item.StateEnum.RUNNING);

        processEntity.setStartDate(now);
        processEntity.setDays(this.processService.calculateDays(processEntity));
        OffsetDateTime expectedEndDate = this.processService.calculateExpectedEndDate(processEntity);
        processEntity.setExpectedEndDate(expectedEndDate != null ? expectedEndDate.toInstant() : null);
        processEntity.setLoom(loomMapper.toDto(loomEntity));

        ProcessEntity savedProcess = this.processService.save(processEntity);
        this.calendarEventService.createOrUpdateLoomExpectedEndDateEvent(entity, loomEntity, savedProcess);

        itemEntity.getProcessing().set(processIndex, savedProcess);
        updateItemStartDateFromProcesses(itemEntity);
        updateItemExpectedEndDateFromAssignments(itemEntity, entity);
        this.calendarEventService.createOrUpdateItemExpectedEndDateEvent(itemEntity);

        this.itemService.save(itemEntity);
        this.loomService.save(loomEntity);

        return true;
    }

    private void updateItemExpectedEndDateFromAssignments(
            ItemEntity item,
            LoomItemAssignmentEntity currentAssignment
    ) {
        List<LoomItemAssignmentEntity> assignments = getAssignmentsWithCurrentUpdate(currentAssignment);

        if (checkIfOthersAssignmentsAreRunning(assignments)) {
            item.setExpectedEndDate(calculateLatestExpectedEndDateFromAssignments(assignments));
            return;
        }

        item.setExpectedEndDate(null);
    }

    private List<LoomItemAssignmentEntity> getAssignmentsWithCurrentUpdate(
            LoomItemAssignmentEntity currentAssignment
    ) {
        List<LoomItemAssignmentEntity> assignments = new ArrayList<>();
        boolean currentAssignmentAdded = false;

        for (LoomItemAssignmentEntity assignment : this.findByItemId(currentAssignment.getItemId())) {
            if (assignment != null
                    && currentAssignment.getId() != null
                    && currentAssignment.getId().equals(assignment.getId())) {
                assignments.add(currentAssignment);
                currentAssignmentAdded = true;
                continue;
            }

            assignments.add(assignment);
        }

        if (!currentAssignmentAdded) {
            assignments.add(currentAssignment);
        }

        return assignments;
    }

    private boolean checkIfOthersAssignmentsAreRunning(List<LoomItemAssignmentEntity> assignments) {
        return assignments != null
                && !assignments.isEmpty()
                && assignments.stream().allMatch(this::hasRunningCompletedOrAbandonedStatus);
    }

    private boolean hasRunningCompletedOrAbandonedStatus(LoomItemAssignmentEntity entity) {
        return entity != null
                && (entity.getStatus() == LoomItemAssignment.StatusEnum.RUNNING
                || entity.getStatus() == LoomItemAssignment.StatusEnum.COMPLETED
                || entity.getStatus() == LoomItemAssignment.StatusEnum.ABANDONED);
    }

    private Instant calculateLatestExpectedEndDateFromAssignments(List<LoomItemAssignmentEntity> assignments) {
        Instant latestExpectedEndDate = null;

        for (LoomItemAssignmentEntity assignment : assignments) {
            if (assignment == null || isBlank(assignment.getProcessId())) {
                continue;
            }

            ProcessEntity process = this.processService.findById(assignment.getProcessId()).orElse(null);

            if (process == null || process.getExpectedEndDate() == null) {
                continue;
            }

            if (latestExpectedEndDate == null || process.getExpectedEndDate().isAfter(latestExpectedEndDate)) {
                latestExpectedEndDate = process.getExpectedEndDate();
            }
        }

        return latestExpectedEndDate;
    }

    private boolean endProduction(LoomItemAssignmentEntity entity) {
        if (!isEndProductionStatus(entity.getStatus())
                || isBlank(entity.getLoomId())
                || isBlank(entity.getItemId())
                || isBlank(entity.getProcessId())) {
            return false;
        }

        LoomEntity loomEntity = this.loomService.findById(entity.getLoomId()).orElse(null);
        ItemEntity itemEntity = this.itemService.findById(entity.getItemId()).orElse(null);
        ProcessEntity processEntity = this.processService.findById(entity.getProcessId()).orElse(null);

        if (loomEntity == null || itemEntity == null || processEntity == null) {
            return false;
        }

        int processIndex = findProcessIndex(itemEntity, processEntity.getId());

        if (processIndex < 0) {
            return false;
        }

        Instant now = OffsetDateTime.now().toInstant();

        loomEntity.setStatus(Loom.StatusEnum.STOPPED);

        processEntity.setEndDate(now);
        processEntity.setLoom(loomMapper.toDto(loomEntity));
        this.processService.save(processEntity);
        itemEntity.getProcessing().set(processIndex, processEntity);
        updateItemStartDateFromProcesses(itemEntity);
        updateItemStateAfterProductionEnd(itemEntity, entity);
        this.itemService.save(itemEntity);
        this.loomService.save(loomEntity);

        return true;
    }

    private void updateItemStartDateFromProcesses(ItemEntity item) {
        if (item.getProcessing() == null) {
            item.setStartDate(null);
            return;
        }

        Instant oldestProcessStartDate = item.getProcessing().stream()
                .filter(process -> process != null)
                .map(ProcessEntity::getStartDate)
                .filter(this::isRealProcessStartDate)
                .min(Instant::compareTo)
                .orElse(null);

        item.setStartDate(oldestProcessStartDate);
    }

    private boolean isRealProcessStartDate(Instant startDate) {
        return startDate != null && !TEMPORARY_PROCESS_START_DATE.equals(startDate);
    }

    private void updateItemStateAfterProductionEnd(
            ItemEntity item,
            LoomItemAssignmentEntity currentAssignment
    ) {
        if (!areAllProcessesEnded(item)) {
            return;
        }

        item.setState(
                hasAbandonedAssignmentForItem(currentAssignment)
                        ? Item.StateEnum.ABANDONED
                        : Item.StateEnum.COMPLETED
        );
        item.setIsArchived(true);
    }

    private boolean areAllProcessesEnded(ItemEntity item) {
        return item.getProcessing() != null
                && !item.getProcessing().isEmpty()
                && item.getProcessing().stream()
                .allMatch(process -> process != null && process.getEndDate() != null);
    }

    private boolean hasAbandonedAssignmentForItem(LoomItemAssignmentEntity currentAssignment) {
        if (currentAssignment.getStatus() == LoomItemAssignment.StatusEnum.ABANDONED) {
            return true;
        }

        return repository.findByItemId(currentAssignment.getItemId()).stream()
                .filter(assignment -> assignment.getId() == null
                        || !assignment.getId().equals(currentAssignment.getId()))
                .anyMatch(assignment -> assignment.getStatus() == LoomItemAssignment.StatusEnum.ABANDONED);
    }

    private int findProcessIndex(ItemEntity item, String processId) {
        if (item.getProcessing() == null || processId == null) {
            return -1;
        }

        for (int index = 0; index < item.getProcessing().size(); index++) {
            ProcessEntity process = item.getProcessing().get(index);

            if (process != null && processId.equals(process.getId())) {
                return index;
            }
        }

        return -1;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean deleteById(String id) {
        if (isBlank(id)) {
            return false;
        }

        Optional<LoomItemAssignmentEntity> assignmentToDelete = repository.findById(id);
        if (assignmentToDelete.isEmpty()) {
            return false;
        }

        LoomItemAssignmentEntity assignment = assignmentToDelete.get();

        if (assignment.getStatus() == LoomItemAssignment.StatusEnum.RUNNING) {
            return abandonRunningAssignment(assignment);
        }

        if (assignment.getStatus() == LoomItemAssignment.StatusEnum.QUEUED) {
            return deleteQueuedAssignment(assignment);
        }

        return false;
    }

    private boolean abandonRunningAssignment(LoomItemAssignmentEntity assignment) {
        if (isBlank(assignment.getId())
                || isBlank(assignment.getLoomId())
                || isBlank(assignment.getItemId())
                || isBlank(assignment.getProcessId())) {
            return false;
        }

        LoomEntity loomEntity = this.loomService.findById(assignment.getLoomId()).orElse(null);
        ItemEntity itemEntity = this.itemService.findById(assignment.getItemId()).orElse(null);
        ProcessEntity processEntity = this.processService.findById(assignment.getProcessId()).orElse(null);

        if (loomEntity == null || itemEntity == null || processEntity == null) {
            return false;
        }

        int processIndex = findProcessIndex(itemEntity, processEntity.getId());

        if (processIndex < 0) {
            return false;
        }

        assignment.setStatus(LoomItemAssignment.StatusEnum.ABANDONED);
        repository.save(assignment);

        loomEntity.setStatus(Loom.StatusEnum.STOPPED);

        processEntity.setTotalMeters(toNonNullValue(processEntity.getMetersRun()));
        processEntity.setTotalPieces(toNonNullValue(processEntity.getPiecesRun()));
        processEntity.setEndDate(OffsetDateTime.now().toInstant());
        processEntity.setLoom(loomMapper.toDto(loomEntity));

        this.processService.save(processEntity);
        itemEntity.getProcessing().set(processIndex, processEntity);
        updateItemStartDateFromProcesses(itemEntity);
        updateItemStateAfterProductionEnd(itemEntity, assignment);
        this.itemService.save(itemEntity);
        this.loomService.save(loomEntity);

        return true;
    }

    private boolean deleteQueuedAssignment(LoomItemAssignmentEntity assignment) {
        if (isBlank(assignment.getId())) {
            return false;
        }

        if (!isBlank(assignment.getItemId())) {
            this.itemService.findById(assignment.getItemId()).ifPresent(item -> {
                removeProcessFromItem(item, assignment.getProcessId());
                this.itemService.save(item);
            });
        }

        if (!isBlank(assignment.getProcessId())) {
            this.processService.deleteStoredProcessById(assignment.getProcessId());
        }

        repository.deleteById(assignment.getId());
        return true;
    }

    private void removeProcessFromItem(ItemEntity item, String processId) {
        if (item.getProcessing() == null || isBlank(processId)) {
            return;
        }

        item.getProcessing().removeIf(process -> process != null && processId.equals(process.getId()));
    }

    private Integer toNonNullValue(Integer value) {
        return value != null ? value : 0;
    }

    public List<LoomItemAssignmentEntity> findByLoomId(String loomId) {
        return repository.findByLoomId(loomId);
    }

    public List<LoomItemAssignmentEntity> findByItemId(String itemId) {
        return repository.findByItemId(itemId);
    }

    public Optional<LoomItemAssignmentEntity> findByProcessId(String processId) {
        if (isBlank(processId)) {
            return Optional.empty();
        }

        return repository.findByProcessId(processId);
    }

    public Optional<LoomItemAssignmentEntity> getRunningAssignmentByLoomId(String loomId) {
        if (isBlank(loomId)) {
            return Optional.empty();
        }

        List<LoomItemAssignmentEntity> runningAssignments = repository.findByLoomIdAndStatus(
                loomId,
                LoomItemAssignment.StatusEnum.RUNNING
        );

        if (runningAssignments.size() > 1) {
            throw new IllegalStateException("Esiste piu di un assignment RUNNING per il loomId: " + loomId);
        }

        return runningAssignments.stream().findFirst();
    }

}
