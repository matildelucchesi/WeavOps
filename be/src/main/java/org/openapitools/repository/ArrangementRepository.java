package org.openapitools.repository;

import org.openapitools.domain.ArrangementEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArrangementRepository extends MongoRepository<ArrangementEntity, String> {}
