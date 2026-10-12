package org.openapitools.repository;

import org.openapitools.domain.CertificationEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CertificationRepository extends MongoRepository<CertificationEntity, String> {}
