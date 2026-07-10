package org.openapitools.service;

import org.openapitools.domain.ItemEntity;
import org.openapitools.domain.LoomEntity;
import org.openapitools.domain.LoomItemAssignmentEntity;
import org.openapitools.domain.ProcessEntity;
import org.openapitools.model.LoomItemAssignment;
import org.openapitools.repository.LoomItemAssignmentRepository;
import org.openapitools.repository.LoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

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

    public Optional<LoomEntity> findBySerialNumber(String serialNumber){
        return repository.findBySerialNumber(serialNumber);
    }

    public Optional<LoomEntity> update(String id, LoomEntity entity){
        if (!repository.existsById(id)) {
            return Optional.empty();
        }
        entity.setId(id);
        return Optional.of(repository.save(entity));
    }

    public boolean deleteById(String id){
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
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
        repository.deleteAll(looms);

        return looms.size();
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

        int metersToAdd = piecesToAdd * process.getMetersPerPiece();
        int updatedPiecesRun = valueOrZero(process.getPiecesRun()) + piecesToAdd;
        int updatedMetersRun = valueOrZero(process.getMetersRun()) + metersToAdd;

        process.setPiecesRun(updatedPiecesRun);
        process.setMetersRun(updatedMetersRun);
        process.setMetersToGo(calculateMetersToGo(process, updatedMetersRun, metersToAdd));

        ProcessEntity savedProcess = this.processService.save(process);

        item.getProcessing().set(processIndex, savedProcess);
        item.setMetersRun(valueOrZero(item.getMetersRun()) + metersToAdd);
        this.productionForecastService.recalculateProductionForecast(item, assignmentEntity);

        return loom;
    }

    private int calculateMetersToGo(ProcessEntity process, int updatedMetersRun, int metersToAdd) {
        if (process.getTotalMeters() != null) {
            return Math.max(process.getTotalMeters() - updatedMetersRun, 0);
        }

        if (process.getMetersToGo() != null) {
            return Math.max(process.getMetersToGo() - metersToAdd, 0);
        }

        return 0;
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

    private int valueOrZero(Integer value) {
        return value != null ? value : 0;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
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
