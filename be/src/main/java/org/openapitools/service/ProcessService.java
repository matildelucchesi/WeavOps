package org.openapitools.service;

import org.openapitools.domain.ProcessEntity;
import org.openapitools.repository.LoomItemAssignmentRepository;
import org.openapitools.repository.ProcessRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Service
public class ProcessService {
    private final ProcessRepository repository;
    private final LoomItemAssignmentRepository assignmentRepository;

    public ProcessService(
            ProcessRepository repository,
            LoomItemAssignmentRepository assignmentRepository
    ) {
        this.repository = repository;
        this.assignmentRepository = assignmentRepository;
    }

    public List<ProcessEntity> findAll() {
        return repository.findAll();
    }

    public ProcessEntity save(ProcessEntity process) {
        return repository.save(process);
    }

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
                || entity.getSpeed() == null
                || entity.getEfficiency() == null
                || entity.getTotalMeters() == null
                || entity.getItemHitsPerDm() == null
                || entity.getSpeed() <= 0
                || entity.getEfficiency() <= 0
                || entity.getItemHitsPerDm() <= 0
                || entity.getTotalMeters() <= 0) {
            return 0;
        }

        float hitsPerDay = (entity.getSpeed() * 60 * 24 * entity.getEfficiency()) / 100.f;
        return entity.getItemHitsPerDm() * 10 * entity.getTotalMeters() / hitsPerDay;
    }

    public float calculateRemainingDays(ProcessEntity entity) {
        if (entity == null
                || entity.getSpeed() == null
                || entity.getEfficiency() == null
                || entity.getMetersToGo() == null
                || entity.getItemHitsPerDm() == null
                || entity.getSpeed() <= 0
                || entity.getEfficiency() <= 0
                || entity.getItemHitsPerDm() <= 0
                || entity.getMetersToGo() <= 0) {
            return 0;
        }

        float hitsPerDay = (entity.getSpeed() * 60 * 24 * entity.getEfficiency()) / 100.f;
        return entity.getItemHitsPerDm() * 10 * entity.getMetersToGo() / hitsPerDay;
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
            if (process.getTotalPieces() != null) {
                process.setPiecesRun(process.getPiecesRun() + piecesToAdd);
                process.setMetersRun(process.getMetersRun() + piecesToAdd * process.getMetersPerPiece());
            }
            this.save(process);
        });
    }
}
