package org.openapitools.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.openapitools.domain.RateEntity;
import org.openapitools.domain.ServiceEntity;
import org.openapitools.model.Rate;
import org.openapitools.model.RatePricingType;
import org.openapitools.repository.RateRepository;
import org.openapitools.repository.ServiceRepository;
import org.springframework.web.server.ResponseStatusException;

class RateServiceTest {
    final RateRepository rates = mock(RateRepository.class);
    final ServiceRepository services = mock(ServiceRepository.class);
    final RateService service = new RateService(rates, services);

    Rate request(String min, String max, String amount) {
        return new Rate(
                null,
                "s1",
                new BigDecimal(min),
                max == null ? null : new BigDecimal(max),
                new BigDecimal(amount));
    }

    void setup(String criterion) {
        when(services.findById("s1"))
                .thenReturn(Optional.of(new ServiceEntity("TEST", "Test", criterion)));
        when(rates.findByServiceId("s1")).thenReturn(List.of());
        when(rates.save(any()))
                .thenAnswer(
                        invocation -> {
                            RateEntity entity = invocation.getArgument(0);
                            entity.setId("r1");
                            return entity;
                        });
    }

    RateEntity existing(String id, String min, String max) {
        RateEntity entity = new RateEntity();
        entity.setId(id);
        entity.setServiceId("s1");
        entity.setMinimum(new BigDecimal(min));
        entity.setMaximum(max == null ? null : new BigDecimal(max));
        return entity;
    }

    @Test
    void supportsUnitPricesAndNegotiatedDescriptions() {
        setup("THREADS");
        Rate unit =
                service.save(
                        null,
                        new Rate(
                                null,
                                "s1",
                                new BigDecimal("3001"),
                                null,
                                new BigDecimal("0.045"),
                                RatePricingType.PER_THREAD,
                                null));
        assertEquals(new BigDecimal("0.045"), unit.amount());
        assertEquals(RatePricingType.PER_THREAD, unit.pricingType());
        Rate negotiated =
                service.save(
                        null,
                        new Rate(
                                null,
                                "s1",
                                BigDecimal.ZERO,
                                BigDecimal.TEN,
                                null,
                                RatePricingType.ON_REQUEST,
                                "  Da concordare  "));
        assertNull(negotiated.amount());
        assertEquals("Da concordare", negotiated.description());
        assertThrows(
                ResponseStatusException.class,
                () ->
                        service.save(
                                null,
                                new Rate(
                                        null,
                                        "s1",
                                        BigDecimal.ZERO,
                                        BigDecimal.TEN,
                                        null,
                                        RatePricingType.ON_REQUEST,
                                        " ")));
    }

    @Test
    void rejectsPerThreadPricesForHourlyServices() {
        setup("HOURS");
        assertThrows(
                ResponseStatusException.class,
                () ->
                        service.save(
                                null,
                                new Rate(
                                        null,
                                        "s1",
                                        BigDecimal.ZERO,
                                        BigDecimal.TEN,
                                        new BigDecimal("0.045"),
                                        RatePricingType.PER_THREAD,
                                        null)));
    }

    @Test
    void acceptsAdjacentBandsAndNormalizesMoney() {
        setup("THREADS");
        when(rates.findByServiceId("s1")).thenReturn(List.of(existing("r0", "0", "100")));
        Rate saved = service.save(null, request("100", "200", "10.5"));
        assertEquals(new BigDecimal("10.50"), saved.amount());
        assertEquals("r1", saved.id());
    }

    @Test
    void rejectsOverlappingAndOpenBands() {
        setup("PICKS_PER_DM");
        when(rates.findByServiceId("s1")).thenReturn(List.of(existing("r0", "100", null)));
        assertEquals(
                409,
                assertThrows(
                                ResponseStatusException.class,
                                () -> service.save(null, request("90", "110", "10")))
                        .getStatusCode()
                        .value());
        assertThrows(
                ResponseStatusException.class,
                () -> service.save(null, request("200", null, "10")));
        verify(rates, never()).save(any());
    }

    @Test
    void validatesIntegersBoundsAndCurrency() {
        setup("THREADS");
        for (Rate rate :
                List.of(
                        request("1.5", "10", "1"),
                        request("0", "0", "1"),
                        request("-1", "10", "1"),
                        request("0", "10", "-1"),
                        request("0", "10", "1.001"))) {
            assertEquals(
                    400,
                    assertThrows(ResponseStatusException.class, () -> service.save(null, rate))
                            .getStatusCode()
                            .value());
        }
    }

    @Test
    void acceptsExactFractionalHoursAndExcludesEditedRate() {
        setup("HOURS");
        when(rates.existsById("r1")).thenReturn(true);
        when(rates.findByServiceId("s1")).thenReturn(List.of(existing("r1", "0", "2")));
        Rate saved =
                service.save(
                        "r1",
                        new Rate(
                                null,
                                "s1",
                                null,
                                null,
                                new BigDecimal("25"),
                                RatePricingType.FIXED,
                                null,
                                new BigDecimal("0.5")));
        assertEquals(new BigDecimal("0.5"), saved.hours());
        assertNull(saved.minimum());
        assertNull(saved.maximum());
    }

    @Test
    void acceptsDifferentDurationsAndRejectsOnlyDuplicateHours() {
        setup("HOURS");
        RateEntity existing = existing("r0", "0", "24");
        when(rates.findByServiceId("s1")).thenReturn(List.of(existing));
        Rate request =
                new Rate(
                        null,
                        "s1",
                        null,
                        null,
                        new BigDecimal("140"),
                        RatePricingType.FIXED,
                        null,
                        new BigDecimal("24.0"));
        assertEquals(
                409,
                assertThrows(ResponseStatusException.class, () -> service.save(null, request))
                        .getStatusCode()
                        .value());
        Rate saved =
                service.save(
                        null,
                        new Rate(
                                null,
                                "s1",
                                null,
                                null,
                                new BigDecimal("70"),
                                RatePricingType.FIXED,
                                null,
                                new BigDecimal("12")));
        assertEquals(new BigDecimal("12"), saved.hours());
        for (BigDecimal duration : List.of(BigDecimal.ZERO, BigDecimal.ONE.negate())) {
            assertThrows(
                    ResponseStatusException.class,
                    () ->
                            service.save(
                                    null,
                                    new Rate(
                                            null,
                                            "s1",
                                            null,
                                            null,
                                            BigDecimal.TEN,
                                            RatePricingType.FIXED,
                                            null,
                                            duration)));
        }
        assertThrows(
                ResponseStatusException.class, () -> service.save(null, request("0", "24", "140")));
    }

    @Test
    void readsThePreviousTwentyFourHourSeedAsAnExactDuration() {
        ServiceEntity hourly = new ServiceEntity("SAMPLE_LOOMS", "Telai a campione", "HOURS");
        hourly.setId("s1");
        when(services.findAll()).thenReturn(List.of(hourly));
        when(rates.findAll()).thenReturn(List.of(existing("r0", "0", "24")));
        Rate loaded = service.findAll().get(0);
        assertEquals(new BigDecimal("24"), loaded.hours());
        assertNull(loaded.minimum());
        assertNull(loaded.maximum());
    }

    @Test
    void rejectsMissingServiceAndRate() {
        assertEquals(
                400,
                assertThrows(
                                ResponseStatusException.class,
                                () -> service.save(null, request("0", "10", "1")))
                        .getStatusCode()
                        .value());
        assertEquals(
                404,
                assertThrows(
                                ResponseStatusException.class,
                                () -> service.save("missing", request("0", "10", "1")))
                        .getStatusCode()
                        .value());
    }
}
