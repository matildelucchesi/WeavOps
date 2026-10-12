package org.openapitools.service;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.openapitools.model.Rate;
import org.openapitools.model.RatePricingType;

class RatePriceCalculatorTest {
    private final RatePriceCalculator calculator = new RatePriceCalculator();

    @Test
    void multipliesAllThreadsWithoutAddingTheFixedBandPrice() {
        Rate rate =
                new Rate(
                        null,
                        "drawing",
                        new BigDecimal("3001"),
                        null,
                        new BigDecimal("0.045"),
                        RatePricingType.PER_THREAD,
                        null);
        assertEquals(new BigDecimal("180.00"), calculator.calculate(rate, 4000));
        assertEquals(new BigDecimal("135.05"), calculator.calculate(rate, 3001));
    }

    @Test
    void keepsTheFixedPriceThroughThreeThousandThreads() {
        Rate rate =
                new Rate(
                        null,
                        "drawing",
                        BigDecimal.ZERO,
                        new BigDecimal("3001"),
                        new BigDecimal("140.00"));
        assertEquals(new BigDecimal("140.00"), calculator.calculate(rate, 3000));
    }

    @Test
    void blocksAnUnagreedPrice() {
        Rate rate =
                new Rate(
                        null,
                        "picks",
                        BigDecimal.ONE,
                        new BigDecimal("100"),
                        null,
                        RatePricingType.ON_REQUEST,
                        "Tariffa da concordare");
        assertThrows(IllegalStateException.class, () -> calculator.calculate(rate, 4000));
    }
}
