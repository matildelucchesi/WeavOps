package org.openapitools.repository;

import org.openapitools.domain.LoomLogEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoomLogRepository extends MongoRepository<LoomLogEntity, String> {
    List<LoomLogEntity> findByLoomIdOrderByCreatedAtDesc(String loomId);
}
