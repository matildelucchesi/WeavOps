package org.openapitools.repository;

import org.openapitools.domain.ProcessEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessRepository extends MongoRepository<ProcessEntity, String> {
}
