package org.openapitools.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import org.openapitools.model.Rate;
import org.openapitools.model.RatePricingType;
import org.springframework.stereotype.Component;

@Component
public class RatePriceCalculator {
    /** Calcola l'importo della fascia già selezionata, prima dell'IVA. */
    public BigDecimal calculate(Rate rate, int totalThreads) {
        if (rate == null || totalThreads < 0) {
            throw new IllegalArgumentException("Tariffa e numero totale di fili non validi");
        }
        RatePricingType pricingType =
                rate.pricingType() == null ? RatePricingType.FIXED : rate.pricingType();
        if (pricingType == RatePricingType.ON_REQUEST) {
            throw new IllegalStateException("Concordare l'importo prima della fatturazione");
        }
        if (rate.amount() == null || rate.amount().signum() < 0) {
            throw new IllegalArgumentException("Importo della tariffa non valido");
        }
        BigDecimal total =
                pricingType == RatePricingType.PER_THREAD
                        ? rate.amount().multiply(BigDecimal.valueOf(totalThreads))
                        : rate.amount();
        return total.setScale(2, RoundingMode.HALF_UP);
    }
}
