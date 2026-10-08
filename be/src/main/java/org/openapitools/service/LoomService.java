package org.openapitools.service;

import org.openapitools.constants.LoomLogEvent;
import org.openapitools.domain.ItemEntity;
import org.openapitools.domain.LoomEntity;
import org.openapitools.domain.LoomItemAssignmentEntity;
import org.openapitools.domain.LoomLogEntity;
import org.openapitools.domain.ProcessEntity;
import org.openapitools.mapper.LoomMapper;
import org.openapitools.model.Item;
import org.openapitools.model.Loom;
import org.openapitools.model.LoomItemAssignment;
import org.openapitools.repository.LoomItemAssignmentRepository;
import org.openapitools.repository.LoomProcessHistoryRepository;
import org.openapitools.repository.LoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.time.Instant;

@Service
public class LoomService {
    @Autowired
    private LoomItemAssignmentRepository assignmentRepository;

    @Autowired
    private ItemService itemService;

    @Autowired
    private ProcessService processService;

    @Autowired
    private ProductionForecastService productionForecastService;

    @Autowired
    private LoomLogService loomLogService;

    @Autowired
    private ArrangementService arrangementService;

    @Autowired
    private LoomMapper loomMapper;

    @Autowired
    private CalendarEventService calendarEventService;

    @Autowired
    private LoomProcessHistoryRepository loomProcessHistoryRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    private final LoomRepository repository;

    public LoomService(LoomRepository repository) {
        this.repository = repository;
    }

    public List<LoomEntity> findAll() {
        return repository.findAll();
    }

    public LoomEntity save(LoomEntity loom) {
        return repository.save(loom);
    }

    public Optional<LoomEntity> findById(String id){
        return repository.findById(id);
    }

    /** Atomically reserves a non-working loom for a production start. */
    public Optional<LoomEntity> claimForProduction(String id) {
        Query availableLoom = Query.query(Criteria.where("_id").is(id)
                .and("status").ne(Loom.StatusEnum.WORKING));
        LoomEntity claimedLoom = mongoTemplate.findAndModify(
                availableLoom,
                new Update().set("status", Loom.StatusEnum.WORKING),
                FindAndModifyOptions.options().returnNew(true),
                LoomEntity.class
        );
        return Optional.ofNullable(claimedLoom);
    }

    public Optional<LoomEntity> findBySerialNumber(String serialNumber){
        return repository.findBySerialNumber(serialNumber);
    }

    public Optional<LoomEntity> update(String id, LoomEntity entity){
        return repository.findById(id).map(existing -> {
            boolean statusChanged = !Objects.equals(existing.getStatus(), entity.getStatus());
            entity.setId(id);
            LoomEntity savedLoom = repository.save(entity);

            if (statusChanged) {
                saveLoomStatusChangedLog(savedLoom);
            }

            return savedLoom;
        });
    }

    public Optional<LoomEntity> updateStatus(String id, org.openapitools.model.Loom.StatusEnum status) {
        return repository.findById(id).map(existing -> {
            if (!Objects.equals(existing.getStatus(), status)) {
                existing.setStatus(status);
                LoomEntity savedLoom = repository.save(existing);
                saveLoomStatusChangedLog(savedLoom);
                return savedLoom;
            }
            return existing;
        });
    }

    public Optional<LoomEntity> recordKnotting(String id) {
        Optional<LoomEntity> loom = findById(id);
        Optional<LoomItemAssignmentEntity> assignment = getRunningAssignmentByLoomId(id);

        if (loom.isEmpty() || assignment.isEmpty() || assignment.get().getItemId() == null) {
            return Optional.empty();
        }

        Optional<ItemEntity> item = itemService.findById(assignment.get().getItemId());
        if (item.isEmpty()) {
            return Optional.empty();
        }

        saveLoomLog(LoomLogEvent.KNOTTING, loom.get(), item.get(), null);
        return loom;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean deleteById(String id){
        if (isBlank(id)) {
            return false;
        }
        Optional<LoomEntity> loom = repository.findById(id);
        if (loom.isEmpty()) {
            return false;
        }

        prepareLoomDeletion(loom.get());
        repository.delete(loom.get());
        return true;
    }

    public boolean existsById(String id){
        return repository.existsById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public int deleteByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }

        List<String> sanitizedIds = ids.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(id -> !id.isEmpty())
                .distinct()
                .toList();

        if (sanitizedIds.isEmpty()) {
            return 0;
        }

        List<LoomEntity> looms = new ArrayList<>();
        repository.findAllById(sanitizedIds).forEach(looms::add);
        for (LoomEntity loom : looms) {
            prepareLoomDeletion(loom);
        }
        repository.deleteAll(looms);

        return looms.size();
    }

    private void prepareLoomDeletion(LoomEntity loom) {
        List<LoomItemAssignmentEntity> assignments = assignmentRepository.findByLoomId(loom.getId());
        for (LoomItemAssignmentEntity assignment : assignments) {
            if (assignment.getStatus() == LoomItemAssignment.StatusEnum.QUEUED) {
                removeQueuedAssignment(assignment);
            } else if (assignment.getStatus() == LoomItemAssignment.StatusEnum.RUNNING) {
                closeRunningAssignmentForDeletion(loom, assignment);
            } else {
                detachHistoricalAssignment(loom, assignment);
            }
        }
        loomProcessHistoryRepository.deleteAll(loomProcessHistoryRepository.findByLoomId(loom.getId()));
    }

    private void closeRunningAssignmentForDeletion(LoomEntity loom, LoomItemAssignmentEntity assignment) {
        if (isBlank(assignment.getItemId()) || isBlank(assignment.getProcessId())) {
            throw new IllegalStateException(
                    "Impossibile conservare lo storico: riferimenti incompleti per l'assegnazione " + assignment.getId());
        }
        ItemEntity item = itemService.findById(assignment.getItemId())
                .orElseThrow(() -> new IllegalStateException(
                        "Impossibile conservare lo storico: articolo non trovato per l'assegnazione " + assignment.getId()));
        ProcessEntity process = processService.findById(assignment.getProcessId())
                .orElseThrow(() -> new IllegalStateException(
                        "Impossibile conservare lo storico: processo non trovato per l'assegnazione " + assignment.getId()));
        int processIndex = findProcessIndex(item, process.getId());
        if (processIndex < 0) {
            throw new IllegalStateException(
                    "Impossibile conservare lo storico: processo non presente nell'articolo " + item.getId());
        }

        Loom loomSnapshot = loomMapper.toDto(loom);
        loomSnapshot.setStatus(Loom.StatusEnum.STOPPED);
        process.setTotalMeters(valueOrZero(process.getMetersRun()));
        process.setTotalPieces(valueOrZero(process.getPiecesRun()));
        process.setEndDate(Instant.now());
        process.setExpectedEndDate(null);
        process.setLoom(loomSnapshot);

        ProcessEntity savedProcess = processService.save(process);
        item.getProcessing().set(processIndex, savedProcess);
        updateItemStartDateFromProcesses(item);
        itemService.save(item);

        assignment.setStatus(LoomItemAssignment.StatusEnum.ABANDONED);
        assignment.setLoomId(null);
        assignmentRepository.save(assignment);
        calendarEventService.deleteLoomExpectedEndDateEvent(process.getId());
        productionForecastService.recalculateProductionForecast(item.getId());
    }

    private void detachHistoricalAssignment(LoomEntity loom, LoomItemAssignmentEntity assignment) {
        if (isBlank(assignment.getItemId()) || isBlank(assignment.getProcessId())) {
            throw new IllegalStateException(
                    "Impossibile conservare lo storico: riferimenti incompleti per l'assegnazione " + assignment.getId());
        }
        ItemEntity item = itemService.findById(assignment.getItemId())
                .orElseThrow(() -> new IllegalStateException(
                        "Impossibile conservare lo storico: articolo non trovato per l'assegnazione " + assignment.getId()));
        ProcessEntity process = processService.findById(assignment.getProcessId())
                .orElseThrow(() -> new IllegalStateException(
                        "Impossibile conservare lo storico: processo non trovato per l'assegnazione " + assignment.getId()));
        int processIndex = findProcessIndex(item, process.getId());
        if (processIndex < 0) {
            throw new IllegalStateException(
                    "Impossibile conservare lo storico: processo non presente nell'articolo " + item.getId());
        }

        if (process.getLoom() == null || process.getLoom().getId() == null) {
            process.setLoom(loomMapper.toDto(loom));
            processService.save(process);
        }
        item.getProcessing().set(processIndex, process);
        itemService.save(item);

        assignment.setLoomId(null);
        assignmentRepository.save(assignment);
        calendarEventService.deleteLoomExpectedEndDateEvent(process.getId());
    }

    private void removeQueuedAssignment(LoomItemAssignmentEntity assignment) {
        if (!isBlank(assignment.getItemId())) {
            itemService.findById(assignment.getItemId()).ifPresent(item -> {
                if (item.getProcessing() != null) {
                    item.getProcessing().removeIf(process -> process != null
                            && Objects.equals(process.getId(), assignment.getProcessId()));
                }
                itemService.save(item);
            });
        }
        if (!isBlank(assignment.getProcessId())) {
            processService.deleteStoredProcessById(assignment.getProcessId());
            calendarEventService.deleteLoomExpectedEndDateEvent(assignment.getProcessId());
        }
        assignmentRepository.delete(assignment);
        if (!isBlank(assignment.getItemId())) {
            productionForecastService.recalculateProductionForecast(assignment.getItemId());
        }
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

    private void updateItemStartDateFromProcesses(ItemEntity item) {
        if (item.getProcessing() == null) {
            item.setStartDate(null);
            return;
        }
        item.setStartDate(item.getProcessing().stream()
                .filter(Objects::nonNull)
                .map(ProcessEntity::getStartDate)
                .filter(startDate -> startDate != null && !Instant.EPOCH.equals(startDate))
                .min(Instant::compareTo)
                .orElse(null));
    }

    private int valueOrZero(Integer value) {
        return value == null ? 0 : value;
    }

    private double valueOrZero(Double value) {
        return value == null ? 0d : value;
    }

    @Transactional(rollbackFor = Exception.class)
    public Optional<LoomEntity> addPieces(String id, int piecesToAdd) {
        if (isBlank(id) || piecesToAdd <= 0) {
            return Optional.empty();
        }

        Optional<LoomEntity> loom = this.findById(id);

        if (loom.isEmpty()) {
            return Optional.empty();
        }

        Optional<LoomItemAssignmentEntity> assignment = getRunningAssignmentByLoomId(id);

        if (assignment.isEmpty()) {
            return Optional.empty();
        }

        LoomItemAssignmentEntity assignmentEntity = assignment.get();
        ProcessEntity process = this.processService.findById(assignmentEntity.getProcessId()).orElse(null);
        ItemEntity item = this.itemService.findById(assignmentEntity.getItemId()).orElse(null);

        if (process == null || item == null || process.getMetersPerPiece() == null) {
            return Optional.empty();
        }

        int processIndex = findProcessIndex(item, process.getId());

        if (processIndex < 0) {
            return Optional.empty();
        }

        double metersToAdd = piecesToAdd * process.getMetersPerPiece();
        int updatedPiecesRun = valueOrZero(process.getPiecesRun()) + piecesToAdd;
        double updatedMetersRun = valueOrZero(process.getMetersRun()) + metersToAdd;

        process.setPiecesRun(updatedPiecesRun);
        process.setMetersRun(updatedMetersRun);
        process.setMetersToGo(calculateMetersToGo(process, updatedMetersRun, metersToAdd));

        ProcessEntity savedProcess = this.processService.save(process);

        item.getProcessing().set(processIndex, savedProcess);
        item.setMetersRun(valueOrZero(item.getMetersRun()) + metersToAdd);
        this.productionForecastService.recalculateProductionForecast(item, assignmentEntity);
        saveLoomLog(LoomLogEvent.ADD_METERS, loom.get(), item, metersToAdd);

        return loom;
    }

    private double calculateMetersToGo(ProcessEntity process, double updatedMetersRun, double metersToAdd) {
        if (process.getTotalMeters() != null) {
            return Math.max(process.getTotalMeters() - updatedMetersRun, 0d);
        }

        if (process.getMetersToGo() != null) {
            return Math.max(process.getMetersToGo() - metersToAdd, 0d);
        }

        return 0;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private void saveLoomLog(LoomLogEvent event, LoomEntity loom, ItemEntity item, Double metersAdded) {
        LoomLogEntity loomLog = new LoomLogEntity();
        loomLog.setKey(event.name());
        loomLog.setLoomId(loom.getId());
        loomLog.setLoomCode(loom.getSerialNumber());
        loomLog.setItemId(item.getId());
        loomLog.setItemName(itemName(item));
        loomLog.setMetersAdded(metersAdded);
        loomLogService.save(loomLog);
    }

    private void saveLoomStatusChangedLog(LoomEntity loom) {
        LoomLogEntity loomLog = new LoomLogEntity();
        loomLog.setKey(LoomLogEvent.LOOM_STATUS_CHANGED.name());
        loomLog.setLoomId(loom.getId());
        loomLog.setLoomCode(loom.getSerialNumber());
        loomLog.setLoomStatus(loom.getStatus() != null ? loom.getStatus().getValue() : null);
        loomLogService.save(loomLog);
    }

    private String itemName(ItemEntity item) {
        if (isBlank(item.getArrangementId())) {
            return null;
        }

        return arrangementService.findById(item.getArrangementId())
                .map(arrangement -> arrangement.getItemName())
                .orElse(null);
    }

    private Optional<LoomItemAssignmentEntity> getRunningAssignmentByLoomId(String loomId) {
        List<LoomItemAssignmentEntity> runningAssignments = assignmentRepository.findByLoomIdAndStatus(
                loomId,
                LoomItemAssignment.StatusEnum.RUNNING
        );

        if (runningAssignments.size() > 1) {
            throw new IllegalStateException("Esiste piu di un assignment RUNNING per il loomId: " + loomId);
        }

        return runningAssignments.stream().findFirst();
    }

}
