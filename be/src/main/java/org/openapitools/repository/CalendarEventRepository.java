package org.openapitools.repository;

import org.openapitools.domain.CalendarEventEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CalendarEventRepository extends MongoRepository<CalendarEventEntity, String> {
    Optional<CalendarEventEntity> findByEventTypeAndArrangementId(String eventType, String arrangementId);

    Optional<CalendarEventEntity> findByEventTypeAndItemId(String eventType, String itemId);

    Optional<CalendarEventEntity> findByEventTypeAndProcessId(String eventType, String processId);

    Optional<CalendarEventEntity> findFirstByArrangementIdAndEventTypeIsNull(String arrangementId);

    Optional<CalendarEventEntity> findFirstByItemIdAndEventTypeIsNull(String itemId);

    Optional<CalendarEventEntity> findFirstByProcessIdAndEventTypeIsNull(String processId);
}
