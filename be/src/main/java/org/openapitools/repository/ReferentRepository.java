package org.openapitools.repository;

import org.openapitools.domain.ReferentEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReferentRepository extends MongoRepository<ReferentEntity, String> {

}
