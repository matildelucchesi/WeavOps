package org.openapitools.service;

import org.openapitools.domain.ProcessEntity;
import org.openapitools.repository.ProcessRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Service
public class ProcessService {
    private final ProcessRepository repository;

    public ProcessService(ProcessRepository repository) {
        this.repository = repository;
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

    public float calculateDays(ProcessEntity entity) {
        if (entity == null
                || entity.getSpeed() == null
                || entity.getEfficiency() == null
                || entity.getTotalMeters() == null
                || entity.getSpeed() <= 0
                || entity.getEfficiency() <= 0
                || entity.getItemHitsPerDm() <= 0
                || entity.getTotalMeters() <= 0) {
            return 0;
        }

        float hitsPerDay = (entity.getSpeed() * 60 * 24 * entity.getEfficiency()) / 100.f;
        return entity.getItemHitsPerDm() * entity.getTotalMeters() / hitsPerDay;
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
}
