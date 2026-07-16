package org.openapitools.repository;

import org.openapitools.domain.ItemEntity;
import org.openapitools.model.Item;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends MongoRepository<ItemEntity, String> {

    @Query("{ 'isArchived': true }")
    List<ItemEntity> findAllArchived();

    @Query("{ 'isArchived': false }")
    List<ItemEntity> findAllNotArchived();

    int countByState(Item.StateEnum state);

}
