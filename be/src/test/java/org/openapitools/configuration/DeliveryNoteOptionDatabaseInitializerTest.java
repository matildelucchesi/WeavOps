package org.openapitools.configuration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.openapitools.domain.DeliveryNoteOption;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.data.mongodb.core.query.Update;

class DeliveryNoteOptionDatabaseInitializerTest {
    @Test
    void initializesBothOptionsWithoutOverwritingExistingEdits() {
        var mongo = mock(MongoTemplate.class);
        when(mongo.indexOps(DeliveryNoteOption.class)).thenReturn(mock(IndexOperations.class));
        new DeliveryNoteOptionDatabaseInitializer(mongo).run();
        verify(mongo).createCollection(DeliveryNoteOption.class);
        var updates = ArgumentCaptor.forClass(Update.class);
        verify(mongo, times(2)).upsert(any(), updates.capture(), eq(DeliveryNoteOption.class));
        assertEquals(
                "Mittente",
                updates.getAllValues()
                        .get(0)
                        .getUpdateObject()
                        .get("$setOnInsert", org.bson.Document.class)
                        .getString("value"));
        assertEquals(
                "FRANCO",
                updates.getAllValues()
                        .get(1)
                        .getUpdateObject()
                        .get("$setOnInsert", org.bson.Document.class)
                        .getString("value"));
        updates.getAllValues()
                .forEach(update -> assertFalse(update.getUpdateObject().containsKey("$set")));
    }
}
