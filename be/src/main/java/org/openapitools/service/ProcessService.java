package org.openapitools.service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.openapitools.domain.ItemEntity;
import org.openapitools.domain.LoomItemAssignmentEntity;
import org.openapitools.domain.ProcessEntity;
import org.openapitools.mapper.LoomMapper;
import org.openapitools.model.LoomItemAssignment;
import org.openapitools.repository.ArrangementRepository;
import org.openapitools.repository.FabricRepository;
import org.openapitools.repository.ItemRepository;
import org.openapitools.repository.LoomItemAssignmentRepository;
import org.openapitools.repository.LoomRepository;
import org.openapitools.repository.ProcessRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProcessService {
    private static final int MINUTES_PER_DAY = 24 * 60;
    private static final int DECIMETERS_PER_METER = 10;

    private final ProcessRepository repository;
    private final FabricRepository fabricRepository;
    private final LoomItemAssignmentRepository assignmentRepository;
    private final ItemRepository itemRepository;
    private final LoomRepository loomRepository;
    private final LoomMapper loomMapper;
    private final ArrangementRepository arrangementRepository;
    private final ProductionForecastService productionForecastService;

    public ProcessService(
            ProcessRepository repository,
            FabricRepository fabricRepository,
            LoomItemAssignmentRepository assignmentRepository,
            ItemRepository itemRepository,
            LoomRepository loomRepository,
            LoomMapper loomMapper,
            ArrangementRepository arrangementRepository,
            @Lazy ProductionForecastService productionForecastService) {
        this.repository = repository;
        this.fabricRepository = fabricRepository;
        this.assignmentRepository = assignmentRepository;
        this.itemRepository = itemRepository;
        this.loomRepository = loomRepository;
        this.loomMapper = loomMapper;
        this.arrangementRepository = arrangementRepository;
        this.productionForecastService = productionForecastService;
    }

    public List<ProcessEntity> findAll() {
        return repository.findAll();
    }

    public ProcessEntity save(ProcessEntity process) {
        return repository.save(process);
    }

    public ProcessEntity create(ProcessEntity process) {
        reserveFabricCode(process);
        process.setId(null);
        return saveReservedProcess(process);
    }

    private void reserveFabricCode(ProcessEntity process) {
        if (process == null || isBlank(process.getFabricCode())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Inserire il numero Tela prima di creare il processo.");
        }
        String code = process.getFabricCode().trim();
        if (repository.existsByFabricCode(code) || fabricRepository.existsByCode(code)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Numero Tela già prenotato o utilizzato.");
        }
        process.setFabricCode(code);
    }

    private ProcessEntity saveReservedProcess(ProcessEntity process) {
        try {
            return repository.save(process);
        } catch (DuplicateKeyException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Numero Tela già prenotato.", exception);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public AssignedProcess createAssignedProcess(String itemId, ProcessEntity process) {
        if (process == null || process.getLoom() == null || isBlank(process.getLoom().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "È necessario selezionare un telaio.");
        }

        ItemEntity item =
                itemRepository
                        .findById(itemId)
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND, "Articolo non trovato."));
        var loom =
                loomRepository
                        .findById(process.getLoom().getId())
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND, "Telaio non trovato."));

        boolean alreadyAssigned =
                assignmentRepository.existsByItemIdAndLoomIdAndStatusIn(
                        item.getId(),
                        loom.getId(),
                        List.of(
                                LoomItemAssignment.StatusEnum.QUEUED,
                                LoomItemAssignment.StatusEnum.RUNNING));
        if (alreadyAssigned) {
            throw new DuplicateItemLoomAssignmentException(
                    "Esiste già una produzione attiva o in coda per questo articolo su questo telaio.");
        }

        reserveFabricCode(process);

        var arrangement =
                arrangementRepository
                        .findById(item.getArrangementId())
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Disposizione dell'articolo non trovata"));
        Float pieceLength = arrangement.getPieceLenght();
        if (pieceLength == null
                || !Float.isFinite(pieceLength)
                || pieceLength <= 0
                || process.getTotalMeters() == null
                || !Double.isFinite(process.getTotalMeters())
                || process.getTotalMeters() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Lunghezza pezza e metri previsti devono essere maggiori di zero");
        }
        process.setMetersPerPiece(Double.parseDouble(pieceLength.toString()));
        double plannedPieces = Math.ceil(process.getTotalMeters() / process.getMetersPerPiece());
        if (plannedPieces > Integer.MAX_VALUE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Numero pezze previsto troppo elevato");
        }
        process.setTotalPieces((int) plannedPieces);
        if (arrangement.getHitsPerDm() != null) {
            process.setItemHitsPerDm(arrangement.getHitsPerDm().doubleValue());
        }
        process.setId(null);
        process.setLoom(loomMapper.toDto(loom));
        process.setDays(calculateDays(process));
        ProcessEntity savedProcess = saveReservedProcess(process);

        item.setProcessing(
                item.getProcessing() == null
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
                itemRepository.findById(item.getId()).orElse(item));
    }

    public record AssignedProcess(
            ProcessEntity process, LoomItemAssignmentEntity assignment, ItemEntity item) {
            }

    public Optional<ProcessEntity> findById(String id) {
        return repository.findById(id);
    }

    public Optional<ProcessEntity> update(String id, ProcessEntity entity) {
        Optional<ProcessEntity> current = repository.findById(id);
        if (current.isEmpty()) {
            return Optional.empty();
        }
        if (current.get().getFabricCode() != null
                && entity.getFabricCode() != null
                && !current.get().getFabricCode().equals(entity.getFabricCode())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Il numero Tela prenotato non può essere modificato.");
        }
        entity.setFabricCode(current.get().getFabricCode());
        if (current.get().getMetersPerPiece() != null
                && !Objects.equals(entity.getMetersPerPiece(), current.get().getMetersPerPiece())) {
            // Una pagina rimasta aperta prima della correzione non deve ripristinare la vecchia
            // lunghezza.
            entity.setMetersPerPiece(current.get().getMetersPerPiece());
            entity.setTotalPieces(current.get().getTotalPieces());
            entity.setPiecesRun(current.get().getPiecesRun());
            entity.setTotalMeters(current.get().getTotalMeters());
            entity.setMetersRun(current.get().getMetersRun());
            entity.setMetersToGo(current.get().getMetersToGo());
        }
        if (current.get().getItemHitsPerDm() != null) {
            entity.setItemHitsPerDm(current.get().getItemHitsPerDm());
        }
        entity.setId(id);
        return Optional.of(repository.save(entity));
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean deleteById(String id) {
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

    public boolean existsById(String id) {
        return repository.existsById(id);
    }

    public float calculateDays(ProcessEntity entity) {
        if (entity == null || entity.getTotalMeters() == null || entity.getTotalMeters() <= 0) {
            return 0;
        }

        return calculateDaysForMeters(entity, entity.getTotalMeters());
    }

    public float calculateRemainingDays(ProcessEntity entity) {
        if (entity == null || entity.getMetersToGo() == null || entity.getMetersToGo() <= 0) {
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

    public void addPieces(String processId, Integer piecesToAdd) {
        this.findById(processId)
                .ifPresent(
                        process -> {
                            if (process.getTotalPieces() != null
                                    && piecesToAdd != null
                                    && piecesToAdd > 0) {
                                process.setPiecesRun(
                                        Objects.requireNonNullElse(process.getPiecesRun(), 0)
                                                + piecesToAdd);
                                process.setMetersRun(
                                        Objects.requireNonNullElse(process.getMetersRun(), 0d)
                                                + piecesToAdd
                                                        * Objects.requireNonNullElse(
                                                                process.getMetersPerPiece(), 0d));
                                process.setMetersToGo(
                                        Math.max(
                                                Objects.requireNonNullElse(
                                                                process.getTotalMeters(), 0d)
                                                        - process.getMetersRun(),
                                                0d));
                            }
                            this.save(process);
                        });
    }
}
