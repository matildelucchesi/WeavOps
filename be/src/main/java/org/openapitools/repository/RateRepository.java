package org.openapitools.repository;

import java.util.List;
import org.openapitools.domain.RateEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RateRepository extends MongoRepository<RateEntity, String> {
    List<RateEntity> findByServiceId(String serviceId);
}
