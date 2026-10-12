package org.openapitools.repository;

import java.util.List;
import org.openapitools.domain.CustomerItemHistoryEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerItemHistoryRepository
        extends MongoRepository<CustomerItemHistoryEntity, String> {
    List<CustomerItemHistoryEntity> findByCustomerId(String loomId);

    List<CustomerItemHistoryEntity> findByItemId(String processId);
}
