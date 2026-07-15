package org.openapitools.repository;

import org.openapitools.domain.LoomProcessHistoryEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoomProcessHistoryRepository extends MongoRepository<LoomProcessHistoryEntity, String> {
    List<LoomProcessHistoryEntity> findByLoomId(String loomId);
    List<LoomProcessHistoryEntity> findByProcessId(String processId);
}
