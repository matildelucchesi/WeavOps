package org.openapitools.model;

import java.math.BigDecimal;

public record Rate(
        String id,
        String serviceId,
        BigDecimal minimum,
        BigDecimal maximum,
        BigDecimal amount,
        RatePricingType pricingType,
        String description,
        BigDecimal hours) {

    public Rate(
            String id,
            String serviceId,
            BigDecimal minimum,
            BigDecimal maximum,
            BigDecimal amount,
            RatePricingType pricingType,
            String description) {
        this(id, serviceId, minimum, maximum, amount, pricingType, description, null);
    }

    public Rate(
            String id,
            String serviceId,
            BigDecimal minimum,
            BigDecimal maximum,
            BigDecimal amount) {
        this(id, serviceId, minimum, maximum, amount, RatePricingType.FIXED, null, null);
    }
}
