package org.openapitools.configuration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.openapitools.domain.RateEntity;
import org.openapitools.domain.ServiceEntity;
import org.openapitools.model.RatePricingType;
import org.openapitools.repository.ServiceRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

class ServiceDatabaseInitializerTest {
    @Test
    void createsCollectionsAndSeedsFourServices() {
        MongoTemplate mongo = mock(MongoTemplate.class);
        ServiceRepository repository = mock(ServiceRepository.class);
        when(mongo.findOne(any(Query.class), eq(ServiceEntity.class)))
                .thenAnswer(
                        invocation -> {
                            Query query = invocation.getArgument(0);
                            String code = query.getQueryObject().getString("code");
                            ServiceEntity service = new ServiceEntity(code, code, "THREADS");
                            service.setId(code);
                            return service;
                        });
        new ServiceDatabaseInitializer(mongo, repository).run();
        verify(mongo).createCollection(ServiceEntity.class);
        verify(mongo).createCollection(RateEntity.class);
        verify(repository, times(4)).save(any(ServiceEntity.class));
        verify(mongo).exists(any(Query.class), eq(RateEntity.class));
        ArgumentCaptor<RateEntity> inserted = ArgumentCaptor.forClass(RateEntity.class);
        verify(mongo, times(14)).insert(inserted.capture());
        List<RateEntity> seeded = inserted.getAllValues();
        for (String code : List.of("PICKS", "KNOTTING", "DRAWING_IN")) {
            List<RateEntity> bands =
                    seeded.stream()
                            .filter(rate -> code.equals(rate.getServiceId()))
                            .sorted(Comparator.comparing(RateEntity::getMinimum))
                            .toList();
            for (int index = 1; index < bands.size(); index++) {
                assertEquals(
                        0,
                        bands.get(index - 1).getMaximum().compareTo(bands.get(index).getMinimum()));
            }
            assertNull(bands.get(bands.size() - 1).getMaximum());
        }
        RateEntity negotiated = seeded.get(0);
        assertEquals(RatePricingType.ON_REQUEST, negotiated.getPricingType());
        assertNull(negotiated.getAmount());
        assertTrue(negotiated.getDescription().contains("Tariffa da concordare"));
        RateEntity perThread =
                seeded.stream()
                        .filter(rate -> rate.getPricingType() == RatePricingType.PER_THREAD)
                        .findFirst()
                        .orElseThrow();
        assertEquals(new BigDecimal("3001"), perThread.getMinimum());
        assertEquals(new BigDecimal("0.045"), perThread.getAmount());
        RateEntity sample =
                seeded.stream()
                        .filter(rate -> "SAMPLE_LOOMS".equals(rate.getServiceId()))
                        .findFirst()
                        .orElseThrow();
        assertEquals(new BigDecimal("24"), sample.getHours());
        assertEquals(new BigDecimal("140.00"), sample.getAmount());
        assertNull(sample.getMinimum());
        assertNull(sample.getMaximum());
    }

    @Test
    void preservesExistingServicesAndRates() {
        MongoTemplate mongo = mock(MongoTemplate.class);
        ServiceRepository repository = mock(ServiceRepository.class);
        when(mongo.collectionExists(ServiceEntity.class)).thenReturn(true);
        when(mongo.collectionExists(RateEntity.class)).thenReturn(true);
        when(repository.existsByCode(anyString())).thenReturn(true);
        when(mongo.exists(any(Query.class), eq(RateEntity.class))).thenReturn(true);
        new ServiceDatabaseInitializer(mongo, repository).run();
        verify(mongo, never()).createCollection(any(Class.class));
        verify(repository, never()).save(any());
        verify(mongo, never()).findOne(any(Query.class), eq(ServiceEntity.class));
        verify(mongo, never()).insert(any(RateEntity.class));
    }
}
