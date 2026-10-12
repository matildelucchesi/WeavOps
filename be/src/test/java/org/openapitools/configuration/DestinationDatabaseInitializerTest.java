package org.openapitools.configuration;

import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.openapitools.domain.DestinationEntity;
import org.springframework.data.mongodb.core.MongoTemplate;

class DestinationDatabaseInitializerTest {
    @Test
    void createsCollectionWhenAbsent() {
        MongoTemplate mongo = mock(MongoTemplate.class);
        new DestinationDatabaseInitializer(mongo).run();
        verify(mongo).createCollection(DestinationEntity.class);
    }

    @Test
    void preservesExistingCollection() {
        MongoTemplate mongo = mock(MongoTemplate.class);
        when(mongo.collectionExists(DestinationEntity.class)).thenReturn(true);
        new DestinationDatabaseInitializer(mongo).run();
        verify(mongo, never()).createCollection(DestinationEntity.class);
    }
}
