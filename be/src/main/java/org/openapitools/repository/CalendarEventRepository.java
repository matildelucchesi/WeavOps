package org.openapitools.repository;

import org.openapitools.domain.CalendarEventEntity;
import org.openapitools.model.CalendarEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface CalendarEventRepository extends MongoRepository<CalendarEventEntity, String> {
    List<CalendarEventEntity> findAllByType(CalendarEvent.TypeEnum type);

    Optional<CalendarEventEntity> findFirstByTypeAndArrangementId(CalendarEvent.TypeEnum type, String arrangementId);

    Optional<CalendarEventEntity> findFirstByTypeAndItemId(CalendarEvent.TypeEnum type, String itemId);

    Optional<CalendarEventEntity> findFirstByTypeAndProcessId(CalendarEvent.TypeEnum type, String processId);

    Optional<CalendarEventEntity> findFirstByArrangementIdAndTypeIsNull(String arrangementId);

    Optional<CalendarEventEntity> findFirstByItemIdAndTypeIsNull(String itemId);

    Optional<CalendarEventEntity> findFirstByProcessIdAndTypeIsNull(String processId);

    List<CalendarEventEntity> findAllByCategoryId(String categoryId);
}
