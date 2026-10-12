package org.openapitools.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.mongodb.client.result.UpdateResult;
import java.util.List;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.openapitools.domain.FabricEntity;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.web.server.ResponseStatusException;

class DeliveryNotePersistenceServiceTest {
    private final MongoTemplate mongo = mock(MongoTemplate.class);
    private final DeliveryNotePersistenceService service =
            new DeliveryNotePersistenceService(mongo);

    @Test
    void saveMarksOnlySelectedAvailableFabricsDelivered() {
        when(mongo.updateMulti(any(), any(), eq(FabricEntity.class)))
                .thenReturn(UpdateResult.acknowledged(2, 2L, null));
        service.save(new Document("year", 2026).append("number", 12), List.of("a", "b"));
        var query = ArgumentCaptor.forClass(Query.class);
        var update = ArgumentCaptor.forClass(Update.class);
        verify(mongo).updateMulti(query.capture(), update.capture(), eq(FabricEntity.class));
        assertEquals("AVAILABLE", query.getValue().getQueryObject().getString("status"));
        assertEquals(
                List.of("a", "b"),
                query.getValue().getQueryObject().get("_id", Document.class).get("$in"));
        assertEquals(
                "DELIVERED",
                update.getValue()
                        .getUpdateObject()
                        .get("$set", Document.class)
                        .getString("status"));
        verify(mongo).insert(any(Document.class), eq("delivery-notes"));
        verify(mongo).upsert(any(), any(), eq("document-counters"));
    }

    @Test
    void unavailableFabricThrowsToRollBackTransaction() {
        when(mongo.updateMulti(any(), any(), eq(FabricEntity.class)))
                .thenReturn(UpdateResult.acknowledged(0, 0L, null));
        assertThrows(
                ResponseStatusException.class, () -> service.save(new Document(), List.of("a")));
        verify(mongo, never()).upsert(any(), any(), eq("document-counters"));
    }

    @Test
    void deleteRestoresOnlyDeliveredFabricsOfTheDocument() {
        when(mongo.findOne(any(), eq(Document.class), eq("delivery-notes")))
                .thenReturn(new Document("fabricIds", List.of("a")));
        assertTrue(service.delete("ddt"));
        var query = ArgumentCaptor.forClass(Query.class);
        var update = ArgumentCaptor.forClass(Update.class);
        verify(mongo).updateMulti(query.capture(), update.capture(), eq(FabricEntity.class));
        assertEquals("DELIVERED", query.getValue().getQueryObject().getString("status"));
        assertEquals(
                List.of("a"),
                query.getValue().getQueryObject().get("_id", Document.class).get("$in"));
        assertEquals(
                "AVAILABLE",
                update.getValue()
                        .getUpdateObject()
                        .get("$set", Document.class)
                        .getString("status"));
        verify(mongo).remove(any(), eq(Document.class), eq("delivery-notes"));
    }

    @Test
    void deleteMissingOrLegacyDocumentDoesNotChangeFabricStatuses() {
        assertFalse(service.delete("missing"));
        when(mongo.findOne(any(), eq(Document.class), eq("delivery-notes")))
                .thenReturn(new Document());
        assertTrue(service.delete("legacy"));
        verify(mongo, never()).updateMulti(any(), any(), eq(FabricEntity.class));
    }
}
