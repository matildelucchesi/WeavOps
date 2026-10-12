package org.openapitools.repository;

import java.util.List;
import org.openapitools.domain.LoomLogEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoomLogRepository extends MongoRepository<LoomLogEntity, String> {
    List<LoomLogEntity> findByLoomIdOrderByCreatedAtDesc(String loomId);
}
