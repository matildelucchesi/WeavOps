package org.openapitools.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.openapitools.domain.CertificationEntity;
import org.openapitools.model.Certification;
import org.openapitools.repository.CertificationRepository;
import org.springframework.web.server.ResponseStatusException;

class CertificationControllerTest {
    private final CertificationRepository repository = mock(CertificationRepository.class);
    private final CertificationController controller = new CertificationController(repository);

    @Test
    void createsNormalizedCertification() {
        when(repository.findAll()).thenReturn(List.of());
        when(repository.save(any()))
                .thenAnswer(
                        invocation -> {
                            CertificationEntity entity = invocation.getArgument(0);
                            entity.setId("c1");
                            return entity;
                        });
        Certification saved =
                controller.createCertification(new Certification(" grs ", " Descrizione "));
        assertEquals("GRS", saved.getValue());
        assertEquals("Descrizione", saved.getDescription());
        assertEquals("c1", saved.getId());
    }

    @Test
    void rejectsDuplicateCodeIgnoringCase() {
        CertificationEntity entity = new CertificationEntity();
        entity.setValue("GRS");
        when(repository.findAll()).thenReturn(List.of(entity));
        assertEquals(
                409,
                assertThrows(
                                ResponseStatusException.class,
                                () ->
                                        controller.createCertification(
                                                new Certification("grs", "Descrizione")))
                        .getStatusCode()
                        .value());
        verify(repository, never()).save(any());
    }

    @Test
    void rejectsBlankFields() {
        assertEquals(
                400,
                assertThrows(
                                ResponseStatusException.class,
                                () ->
                                        controller.createCertification(
                                                new Certification(" ", "Descrizione")))
                        .getStatusCode()
                        .value());
        assertEquals(
                400,
                assertThrows(
                                ResponseStatusException.class,
                                () -> controller.createCertification(new Certification("GRS", " ")))
                        .getStatusCode()
                        .value());
        verify(repository, never()).save(any());
    }
}
