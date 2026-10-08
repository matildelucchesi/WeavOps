package org.openapitools.service;

import org.openapitools.domain.ProcessEntity;
import org.openapitools.domain.ItemEntity;
import org.openapitools.domain.LoomItemAssignmentEntity;
import org.openapitools.mapper.LoomMapper;
import org.openapitools.model.LoomItemAssignment;
import org.openapitools.repository.ItemRepository;
import org.openapitools.repository.LoomItemAssignmentRepository;
import org.openapitools.repository.LoomRepository;
import org.openapitools.repository.ProcessRepository;
import org.springframework.http.HttpStatus;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Objects;
import java.util.List;
import java.util.Optional;

@Service
public class ProcessService {
    private static final int MINUTES_PER_DAY = 24 * 60;
    private static final int DECIMETERS_PER_METER = 10;

    private final ProcessRepository repository;
    private final LoomItemAssignmentRepository assignmentRepository;
    private final ItemRepository itemRepository;
    private final LoomRepository loomRepository;
    private final LoomMapper loomMapper;
    private final ProductionForecastService productionForecastService;

    public ProcessService(
            ProcessRepository repository,
            LoomItemAssignmentRepository assignmentRepository,
            ItemRepository itemRepository,
            LoomRepository loomRepository,
            LoomMapper loomMapper,
            @Lazy ProductionForecastService productionForecastService
    ) {
        this.repository = repository;
        this.assignmentRepository = assignmentRepository;
        this.itemRepository = itemRepository;
        this.loomRepository = loomRepository;
        this.loomMapper = loomMapper;
        this.productionForecastService = productionForecastService;
    }

    public List<ProcessEntity> findAll() {
        return repository.findAll();
    }

    public ProcessEntity save(ProcessEntity process) {
        return repository.save(process);
    }

    @Transactional(rollbackFor = Exception.class)
    public AssignedProcess createAssignedProcess(String itemId, ProcessEntity process) {
        if (process == null || process.getLoom() == null || isBlank(process.getLoom().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "È necessario selezionare un telaio.");
        }

        ItemEntity item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Articolo non trovato."));
        var loom = loomRepository.findById(process.getLoom().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Telaio non trovato."));

        boolean alreadyAssigned = assignmentRepository.existsByItemIdAndLoomIdAndStatusIn(
                item.getId(),
                loom.getId(),
                List.of(LoomItemAssignment.StatusEnum.QUEUED, LoomItemAssignment.StatusEnum.RUNNING)
        );
        if (alreadyAssigned) {
            throw new DuplicateItemLoomAssignmentException(
                    "Esiste già una produzione attiva o in coda per questo articolo su questo telaio."
            );
        }

        process.setId(null);
        process.setLoom(loomMapper.toDto(loom));
        process.setDays(calculateDays(process));
        ProcessEntity savedProcess = repository.save(process);

        item.setProcessing(item.getProcessing() == null
                ? new java.util.ArrayList<>()
                : new java.util.ArrayList<>(item.getProcessing()));
        item.getProcessing().add(savedProcess);
        itemRepository.save(item);

        LoomItemAssignmentEntity assignment = new LoomItemAssignmentEntity();
        assignment.setLoomId(loom.getId());
        assignment.setItemId(item.getId());
        assignment.setProcessId(savedProcess.getId());
        assignment.setStatus(LoomItemAssignment.StatusEnum.QUEUED);
        LoomItemAssignmentEntity savedAssignment = assignmentRepository.save(assignment);

        productionForecastService.recalculateProductionForecast(item.getId());
        return new AssignedProcess(
                repository.findById(savedProcess.getId()).orElse(savedProcess),
                assignmentRepository.findById(savedAssignment.getId()).orElse(savedAssignment),
                itemRepository.findById(item.getId()).orElse(item)
        );
    }

    public record AssignedProcess(
            ProcessEntity process,
            LoomItemAssignmentEntity assignment,
            ItemEntity item
    ) {}

    public Optional<ProcessEntity> findById(String id){
        return repository.findById(id);
    }

    public Optional<ProcessEntity> update(String id, ProcessEntity entity){
        if (!repository.existsById(id)) {
            return Optional.empty();
        }
        entity.setId(id);
        return Optional.of(repository.save(entity));
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean deleteById(String id){
        if (isBlank(id)) {
            return false;
        }

        if (!repository.existsById(id) || assignmentRepository.findByProcessId(id).isPresent()) {
            return false;
        }

        repository.deleteById(id);
        return true;
    }

    boolean deleteStoredProcessById(String id) {
        if (isBlank(id) || !repository.existsById(id)) {
            return false;
        }

        repository.deleteById(id);
        return true;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public boolean existsById(String id){
        return repository.existsById(id);
    }

    public float calculateDays(ProcessEntity entity) {
        if (entity == null
                || entity.getTotalMeters() == null
                || entity.getTotalMeters() <= 0) {
            return 0;
        }

        return calculateDaysForMeters(entity, entity.getTotalMeters());
    }

    public float calculateRemainingDays(ProcessEntity entity) {
        if (entity == null
                || entity.getMetersToGo() == null
                || entity.getMetersToGo() <= 0) {
            return 0;
        }

        return calculateDaysForMeters(entity, entity.getMetersToGo());
    }

    public float calculateDaysForMeters(ProcessEntity entity, double meters) {
        if (entity == null || meters <= 0) {
            return 0;
        }

        float dailyCapacity = calculateDailyCapacity(entity);

        if (dailyCapacity <= 0) {
            return 0;
        }

        return (float) (meters / dailyCapacity);
    }

    public float calculateDailyCapacity(ProcessEntity entity) {
        if (entity == null
                || entity.getSpeed() == null
                || entity.getEfficiency() == null
                || entity.getItemHitsPerDm() == null
                || entity.getSpeed() <= 0
                || entity.getEfficiency() <= 0
                || entity.getItemHitsPerDm() <= 0) {
            return 0;
        }

        return entity.getSpeed().floatValue()
                * (entity.getEfficiency().floatValue() / 100.f)
                * MINUTES_PER_DAY
                / (entity.getItemHitsPerDm().floatValue() * DECIMETERS_PER_METER);
    }

    public OffsetDateTime calculateExpectedEndDate(ProcessEntity entity) {
        if (entity == null || entity.getStartDate() == null || entity.getDays() == null) {
            return null;
        }

        OffsetDateTime startDate = OffsetDateTime.ofInstant(entity.getStartDate(), ZoneOffset.UTC);
        Float days = entity.getDays();
        Duration duration = Duration.ofMillis((long) (days * 86_400_000));

        return startDate.plus(duration);
    }

    public OffsetDateTime calculateExpectedEndDateFromNow(ProcessEntity entity) {
        if (entity == null || entity.getDays() == null) {
            return null;
        }

        Duration duration = Duration.ofMillis((long) (entity.getDays() * 86_400_000));

        return OffsetDateTime.now(ZoneOffset.UTC).plus(duration);
    }

    public void addPieces(String processId, Integer piecesToAdd){
        this.findById(processId).ifPresent(process -> {
            if (process.getTotalPieces() != null && piecesToAdd != null && piecesToAdd > 0) {
                process.setPiecesRun(Objects.requireNonNullElse(process.getPiecesRun(), 0) + piecesToAdd);
                process.setMetersRun(Objects.requireNonNullElse(process.getMetersRun(), 0d)
                        + piecesToAdd * Objects.requireNonNullElse(process.getMetersPerPiece(), 0d));
                process.setMetersToGo(Math.max(
                        Objects.requireNonNullElse(process.getTotalMeters(), 0d)
                                - process.getMetersRun(),
                        0d
                ));
            }
            this.save(process);
        });
    }
}
