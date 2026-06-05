package org.openapitools.repository;

import org.openapitools.domain.ItemEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRepository extends MongoRepository<ItemEntity, String> {
}
