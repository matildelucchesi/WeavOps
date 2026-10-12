package org.openapitools.repository;

import java.util.Optional;
import org.openapitools.domain.CustomerEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends MongoRepository<CustomerEntity, String> {
    Optional<CustomerEntity> findByName(String name);

    @org.springframework.data.mongodb.repository.Query(
            value = "{'destinationIds': ?0}",
            exists = true)
    boolean existsByDestinationId(String destinationId);
}
