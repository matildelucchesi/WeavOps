package org.openapitools.repository;

import java.util.List;
import org.openapitools.domain.LoomProcessHistoryEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoomProcessHistoryRepository
        extends MongoRepository<LoomProcessHistoryEntity, String> {
    List<LoomProcessHistoryEntity> findByLoomId(String loomId);

    List<LoomProcessHistoryEntity> findByProcessId(String processId);
}
