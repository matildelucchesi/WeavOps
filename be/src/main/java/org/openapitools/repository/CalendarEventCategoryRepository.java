package org.openapitools.repository;

import org.openapitools.domain.CalendarEventCategoryEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CalendarEventCategoryRepository extends MongoRepository<CalendarEventCategoryEntity, String> {
}
