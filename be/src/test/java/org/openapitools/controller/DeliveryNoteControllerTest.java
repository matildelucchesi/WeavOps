package org.openapitools.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.List;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.openapitools.domain.FabricEntity;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.mock.web.MockMultipartFile;

class DeliveryNoteControllerTest {
    private final MongoTemplate mongo = mock(MongoTemplate.class);
    private final org.openapitools.service.DeliveryNotePersistenceService persistence =
            mock(org.openapitools.service.DeliveryNotePersistenceService.class);
    private final DeliveryNoteController controller =
            new DeliveryNoteController(mongo, persistence, 1);
    private final MockMultipartFile pdf =
            new MockMultipartFile("file", "ddt.pdf", "application/pdf", "%PDF-test".getBytes());

    @Test
    void emptyDatabaseUsesConfiguredInitialNumberWithoutConsumingIt() {
        var configured = new DeliveryNoteController(mongo, persistence, 40);
        assertEquals(40, configured.reserveNumber().getInteger("number"));
        assertEquals(40, configured.reserveNumber().getInteger("number"));
        verify(mongo, never()).findAndModify(any(), any(), any(), eq(Document.class), anyString());
    }

    @Test
    void nextNumberUsesAllYearsAndHighestSavedNumber() {
        when(mongo.findOne(any(), eq(Document.class), eq("delivery-notes")))
                .thenReturn(new Document("number", 125).append("year", 2025));
        assertEquals(126, controller.reserveNumber().getInteger("number"));
        var query =
                org.mockito.ArgumentCaptor.forClass(
                        org.springframework.data.mongodb.core.query.Query.class);
        verify(mongo).findOne(query.capture(), eq(Document.class), eq("delivery-notes"));
        assertTrue(query.getValue().getQueryObject().isEmpty());
        assertEquals(-1, query.getValue().getSortObject().getInteger("number"));
    }

    @Test
    void invalidDateDoesNotSave() throws Exception {
        assertEquals(
                400,
                controller
                        .create(1, "invalid", "Cliente", List.of("fabric-1"), pdf)
                        .getStatusCode()
                        .value());
        verifyNoInteractions(mongo);
    }

    @Test
    void duplicateNumberReturnsConflict() throws Exception {
        when(mongo.count(any(), eq(FabricEntity.class))).thenReturn(1L);
        when(mongo.indexOps("delivery-notes")).thenReturn(mock(IndexOperations.class));
        doThrow(new org.springframework.dao.DuplicateKeyException("duplicate"))
                .when(persistence)
                .save(any(Document.class), anyList());
        assertEquals(
                409,
                controller
                        .create(1, "2026-10-12", "Cliente", List.of("fabric-1"), pdf)
                        .getStatusCode()
                        .value());
    }

    @Test
    void storesPdfButDoesNotIncludeBytesInResponse() throws Exception {
        when(mongo.count(any(), eq(FabricEntity.class))).thenReturn(1L);
        when(mongo.indexOps("delivery-notes")).thenReturn(mock(IndexOperations.class));
        var response = controller.create(12, "2026-10-12", "Cliente", List.of("fabric-1"), pdf);
        assertEquals(201, response.getStatusCode().value());
        assertEquals(2026, response.getBody().getInteger("year"));
        assertEquals(List.of("fabric-1"), response.getBody().get("fabricIds"));
        assertFalse(response.getBody().containsKey("content"));
        verify(persistence).save(any(Document.class), eq(List.of("fabric-1")));
    }

    @Test
    void unavailableFabricDoesNotSave() throws Exception {
        var response = controller.create(1, "2026-10-12", "Cliente", List.of("missing"), pdf);
        assertEquals(409, response.getStatusCode().value());
        verify(mongo, never()).insert(any(Document.class), eq("delivery-notes"));
    }

    @Test
    void emptyOrRepeatedFabricsAreRejected() throws Exception {
        assertEquals(
                400,
                controller
                        .create(1, "2026-10-12", "Cliente", List.of(), pdf)
                        .getStatusCode()
                        .value());
        assertEquals(
                400,
                controller
                        .create(1, "2026-10-12", "Cliente", List.of("a", "a"), pdf)
                        .getStatusCode()
                        .value());
        verifyNoInteractions(mongo);
    }

    @Test
    void deleteRemovesDocumentAndItsFabricAssociations() {
        when(persistence.delete("ddt")).thenReturn(true);
        assertEquals(204, controller.delete("ddt").getStatusCode().value());
        verify(persistence).delete("ddt");
    }

    @Test
    void deleteMissingDocumentReturnsNotFound() {
        assertEquals(404, controller.delete("missing").getStatusCode().value());
    }

    @Test
    void missingPdfReturnsNotFound() {
        assertEquals(404, controller.download("missing").getStatusCode().value());
    }
}
