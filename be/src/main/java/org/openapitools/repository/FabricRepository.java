package org.openapitools.repository;

import java.util.List;
import java.util.Optional;
import org.openapitools.domain.FabricEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FabricRepository extends MongoRepository<FabricEntity, String> {
    Optional<FabricEntity> findByProcessId(String processId);

    boolean existsByCode(String code);

    List<FabricEntity> findByItemId(String itemId);
}
