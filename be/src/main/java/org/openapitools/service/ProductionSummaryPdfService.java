package org.openapitools.service;

import org.openapitools.domain.ProductionSummaryPdfEntity;
import org.openapitools.repository.ProductionSummaryPdfRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class ProductionSummaryPdfService {
    private final ProductionSummaryPdfRepository repository;

    public ProductionSummaryPdfService(ProductionSummaryPdfRepository repository) {
        this.repository = repository;
    }

    public ProductionSummaryPdfEntity save(ProductionSummaryPdfEntity entity) {
        entity.setCreatedAt(Instant.now());
        return repository.save(entity);
    }

    public List<ProductionSummaryPdfEntity> findAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public List<ProductionSummaryPdfEntity> findByLoomId(String loomId) {
        return repository.findByLoomIdOrderByCreatedAtDesc(loomId);
    }

    public Optional<ProductionSummaryPdfEntity> findById(String id) {
        return repository.findById(id);
    }
}
