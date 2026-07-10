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
    private ProductionForecastService productionForecastService;

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
        processEntity.setLoom(loomMapper.toDto(loomEntity));

        ProcessEntity savedProcess = this.processService.save(processEntity);

        itemEntity.getProcessing().set(processIndex, savedProcess);
        updateItemStartDateFromProcesses(itemEntity);

        this.loomService.save(loomEntity);
        this.productionForecastService.recalculateProductionForecast(itemEntity, entity);

        return true;
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
        this.loomService.save(loomEntity);
        this.productionForecastService.recalculateProductionForecast(itemEntity, entity);

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
        this.loomService.save(loomEntity);
        this.productionForecastService.recalculateProductionForecast(itemEntity, assignment);

        return true;
    }

    private boolean deleteQueuedAssignment(LoomItemAssignmentEntity assignment) {
        if (isBlank(assignment.getId())) {
            return false;
        }

        String itemId = assignment.getItemId();

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

        if (!isBlank(itemId)) {
            this.productionForecastService.recalculateProductionForecast(itemId);
        }

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
