package org.openapitools.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.openapitools.domain.DeliveryNoteOption;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.server.ResponseStatusException;

class DeliveryNoteOptionControllerTest {
    private final MongoTemplate mongo = mock(MongoTemplate.class);
    private final DeliveryNoteOptionController controller = new DeliveryNoteOptionController(mongo);

    @Test
    void createGeneratesIdAndNormalizesValue() {
        when(mongo.save(any(DeliveryNoteOption.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        var created =
                controller.create(
                        new DeliveryNoteOption(
                                null, DeliveryNoteOption.Type.TRANSPORT, " Mittente ", true));
        assertNotNull(created.id());
        assertEquals("Mittente", created.value());
        assertTrue(created.active());
    }

    @Test
    void updateCanDisableAnExistingOptionWithoutDeletingIt() {
        var original =
                new DeliveryNoteOption("id", DeliveryNoteOption.Type.FREIGHT, "FRANCO", true);
        when(mongo.findById("id", DeliveryNoteOption.class)).thenReturn(original);
        when(mongo.save(any(DeliveryNoteOption.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        var updated =
                controller.update(
                        "id", new DeliveryNoteOption(null, original.type(), "Nuovo valore", false));
        assertEquals("id", updated.id());
        assertEquals("Nuovo valore", updated.value());
        assertFalse(updated.active());
    }

    @Test
    void missingOptionReturnsNotFound() {
        assertThrows(
                ResponseStatusException.class,
                () ->
                        controller.update(
                                "missing",
                                new DeliveryNoteOption(
                                        null, DeliveryNoteOption.Type.FREIGHT, "FRANCO", false)));
        verify(mongo, never()).save(any(DeliveryNoteOption.class));
    }
}
