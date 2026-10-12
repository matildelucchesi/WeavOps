package org.openapitools.repository;

import org.openapitools.domain.ServiceEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ServiceRepository extends MongoRepository<ServiceEntity, String> {
    boolean existsByCode(String code);
}
