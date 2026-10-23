package org.openapitools.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.mock.web.MockMultipartFile;

class InvoiceControllerTest {
    private final MongoTemplate mongo = mock(MongoTemplate.class);
    private final InvoiceController controller = new InvoiceController(mongo);
    private final MockMultipartFile pdf =
            new MockMultipartFile("file", "fattura.pdf", "application/pdf", "%PDF-test".getBytes());

    private Document draft() {
        return Document.parse(
                """
            {"number":1,"date":"2026-10-23","issuer":{"name":"Azienda"},
             "customer":{"name":"Cliente"},"advance":0,"stamp":2,
             "rows":[{"description":"Lavorazione","quantity":10,"price":0.34,"vatRate":22}],
             "taxOverrides":{}}
            """);
    }

    @Test
    void storesEditableDataAndPdfWithoutReturningBytes() throws Exception {
        when(mongo.indexOps("invoices")).thenReturn(mock(IndexOperations.class));
        var response = controller.create(draft().toJson(), pdf);
        assertEquals(201, response.getStatusCode().value());
        assertEquals("Cliente", response.getBody().getString("customerName"));
        assertEquals(2026, response.getBody().getInteger("year"));
        assertNotNull(response.getBody().get("data"));
        assertFalse(response.getBody().containsKey("content"));
        verify(mongo).insert(any(Document.class), eq("invoices"));
    }

    @Test
    void rejectsInvalidDatesEmptyRowsAndInvalidTaxRates() throws Exception {
        var data = draft();
        data.put("date", "2026-02-30");
        assertEquals(400, controller.create(data.toJson(), pdf).getStatusCode().value());
        data = draft();
        data.put("rows", java.util.List.of());
        assertEquals(400, controller.create(data.toJson(), pdf).getStatusCode().value());
        data = draft();
        data.getList("rows", Document.class).get(0).put("vatRate", 101);
        assertEquals(400, controller.create(data.toJson(), pdf).getStatusCode().value());
        verifyNoInteractions(mongo);
    }

    @Test
    void duplicateNumberReturnsConflict() throws Exception {
        when(mongo.indexOps("invoices")).thenReturn(mock(IndexOperations.class));
        when(mongo.insert(any(Document.class), eq("invoices")))
                .thenThrow(new DuplicateKeyException("duplicate"));
        assertEquals(409, controller.create(draft().toJson(), pdf).getStatusCode().value());
    }

    @Test
    void missingInvoiceCannotBeUpdatedOrDownloaded() throws Exception {
        assertEquals(
                404, controller.update("missing", draft().toJson(), pdf).getStatusCode().value());
        assertEquals(404, controller.download("missing").getStatusCode().value());
        verify(mongo, never()).save(any(Document.class), anyString());
    }

    @Test
    void suggestsNumberWithoutConsumingIt() {
        when(mongo.findOne(any(), eq(Document.class), eq("invoices")))
                .thenReturn(new Document("number", 12));
        assertEquals(13, controller.nextNumber().getInteger("number"));
        assertEquals(13, controller.nextNumber().getInteger("number"));
        verify(mongo, never()).save(any(Document.class), anyString());
    }
}
