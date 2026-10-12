package org.openapitools.repository;

import java.util.List;
import org.openapitools.domain.ProductionSummaryPdfEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductionSummaryPdfRepository
        extends MongoRepository<ProductionSummaryPdfEntity, String> {
    List<ProductionSummaryPdfEntity> findByLoomIdOrderByCreatedAtDesc(String loomId);

    List<ProductionSummaryPdfEntity> findAllByOrderByCreatedAtDesc();
}
