package org.openapitools.repository;

import java.util.Optional;
import org.openapitools.domain.LoomEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoomRepository extends MongoRepository<LoomEntity, String> {

    Optional<LoomEntity> findBySerialNumber(String serialNumber);
}
