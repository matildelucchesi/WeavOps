package org.openapitools.configuration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.openapitools.domain.CertificationEntity;
import org.springframework.data.mongodb.core.MongoTemplate;

class CertificationDatabaseInitializerTest {
    @Test
    void unavailableDatabaseDoesNotPreventStartup() {
        MongoTemplate mongo = mock(MongoTemplate.class);
        when(mongo.collectionExists(CertificationEntity.class))
                .thenThrow(
                        new org.springframework.dao.DataAccessResourceFailureException(
                                "unavailable"));
        assertDoesNotThrow(() -> new CertificationDatabaseInitializer(mongo).run());
        verify(mongo, never()).save(any(CertificationEntity.class));
    }

    @Test
    void seedsOnlyAMissingCollection() {
        MongoTemplate mongo = mock(MongoTemplate.class);
        new CertificationDatabaseInitializer(mongo).run();
        verify(mongo).createCollection(CertificationEntity.class);
        ArgumentCaptor<CertificationEntity> values =
                ArgumentCaptor.forClass(CertificationEntity.class);
        verify(mongo, times(2)).save(values.capture());
        assertEquals("GRS", values.getAllValues().get(0).getValue());
        assertEquals("Global Recycled Standard", values.getAllValues().get(0).getDescription());
        assertEquals("GOTS", values.getAllValues().get(1).getValue());
        assertEquals(
                "Global Organic Textile Standard", values.getAllValues().get(1).getDescription());
        reset(mongo);
        when(mongo.collectionExists(CertificationEntity.class)).thenReturn(true);
        new CertificationDatabaseInitializer(mongo).run();
        verify(mongo, never()).createCollection(CertificationEntity.class);
        verify(mongo, never()).save(any(CertificationEntity.class));
    }
}
