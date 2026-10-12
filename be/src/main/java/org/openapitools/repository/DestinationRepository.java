package org.openapitools.repository;

import org.openapitools.domain.DestinationEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DestinationRepository extends MongoRepository<DestinationEntity, String> {}
