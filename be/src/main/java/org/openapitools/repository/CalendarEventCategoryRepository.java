package org.openapitools.repository;

import java.util.Optional;
import org.openapitools.domain.CalendarEventCategoryEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CalendarEventCategoryRepository
        extends MongoRepository<CalendarEventCategoryEntity, String> {
    Optional<CalendarEventCategoryEntity> findByNameIgnoreCase(String name);
}
