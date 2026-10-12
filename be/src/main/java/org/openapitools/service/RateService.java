package org.openapitools.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.openapitools.domain.RateEntity;
import org.openapitools.domain.ServiceEntity;
import org.openapitools.model.Rate;
import org.openapitools.model.RatePricingType;
import org.openapitools.repository.RateRepository;
import org.openapitools.repository.ServiceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RateService {
    private final RateRepository rates;
    private final ServiceRepository services;

    public RateService(RateRepository rates, ServiceRepository services) {
        this.rates = rates;
        this.services = services;
    }

    public List<Rate> findAll() {
        Set<String> hourlyServices =
                services.findAll().stream()
                        .filter(service -> "HOURS".equals(service.getBandCriterion()))
                        .map(ServiceEntity::getId)
                        .collect(Collectors.toSet());
        return rates.findAll().stream()
                .map(entity -> dto(entity, hourlyServices.contains(entity.getServiceId())))
                .toList();
    }

    public synchronized Rate save(String id, Rate request) {
        if (id != null && !rates.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tariffa non trovata");
        }
        if (request.serviceId() == null) {
            throw bad("Servizio obbligatorio");
        }
        ServiceEntity service =
                services.findById(request.serviceId())
                        .orElseThrow(() -> bad("Servizio non valido"));
        BigDecimal min = request.minimum();
        BigDecimal max = request.maximum();
        BigDecimal amount = request.amount();
        boolean hourlyService = "HOURS".equals(service.getBandCriterion());
        BigDecimal hours = request.hours();
        RatePricingType pricingType =
                request.pricingType() == null ? RatePricingType.FIXED : request.pricingType();
        String description = request.description() == null ? null : request.description().trim();
        if (description != null && description.isEmpty()) {
            description = null;
        }
        if (hourlyService) {
            if (hours == null || hours.signum() <= 0 || min != null || max != null) {
                throw bad("Inserire un numero di ore positivo, senza minimo o massimo");
            }
        } else {
            if (hours != null) {
                throw bad("Il numero di ore è riservato ai telai a campione");
            }
            if (min == null || min.signum() < 0 || (max != null && max.compareTo(min) <= 0)) {
                throw bad("La fascia deve avere minimo non negativo e massimo maggiore del minimo");
            }
            if (min.stripTrailingZeros().scale() > 0
                    || (max != null && max.stripTrailingZeros().scale() > 0)) {
                throw bad("Colpi e fili devono essere numeri interi");
            }
        }
        if (pricingType == RatePricingType.ON_REQUEST) {
            if (description == null || amount != null) {
                throw bad("La tariffa da concordare richiede una descrizione e nessun importo");
            }
        } else {
            int decimalPlaces = pricingType == RatePricingType.PER_THREAD ? 6 : 2;
            if (amount == null
                    || amount.signum() < 0
                    || amount.stripTrailingZeros().scale() > decimalPlaces) {
                throw bad("Importo non negativo con massimo " + decimalPlaces + " decimali");
            }
            if (pricingType == RatePricingType.PER_THREAD
                    && !"THREADS".equals(service.getBandCriterion())) {
                throw bad("Il prezzo per filo è consentito soltanto per servizi basati sui fili");
            }
        }
        for (RateEntity other : rates.findByServiceId(request.serviceId())) {
            if (id != null && Objects.equals(id, other.getId())) {
                continue;
            }
            if (hourlyService) {
                BigDecimal existingHours = getHourlyDuration(other);
                if (existingHours != null && hours.compareTo(existingHours) == 0) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT, "Esiste già una tariffa per questo numero di ore");
                }
                continue;
            }
            if ((max == null || other.getMinimum().compareTo(max) < 0)
                    && (other.getMaximum() == null || min.compareTo(other.getMaximum()) < 0)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "La fascia si sovrappone a una tariffa dello stesso servizio");
            }
        }
        RateEntity entity = new RateEntity();
        entity.setId(id);
        entity.setServiceId(request.serviceId());
        entity.setMinimum(min);
        entity.setMaximum(max);
        entity.setHours(hours);
        entity.setAmount(
                amount == null
                        ? null
                        : pricingType == RatePricingType.FIXED
                                ? amount.setScale(2, RoundingMode.UNNECESSARY)
                                : amount);
        entity.setPricingType(pricingType);
        entity.setDescription(description);
        return dto(rates.save(entity), hourlyService);
    }

    public synchronized void delete(String id) {
        if (!rates.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tariffa non trovata");
        }
        rates.deleteById(id);
    }

    private BigDecimal getHourlyDuration(RateEntity entity) {
        if (entity.getHours() != null) {
            return entity.getHours();
        }
        // Compatibilità con la precedente inizializzazione 0-24 ore.
        if (entity.getMinimum() != null
                && entity.getMinimum().signum() == 0
                && entity.getMaximum() != null
                && entity.getMaximum().signum() > 0) {
            return entity.getMaximum();
        }
        return null;
    }

    private Rate dto(RateEntity entity, boolean hourlyService) {
        return new Rate(
                entity.getId(),
                entity.getServiceId(),
                hourlyService ? null : entity.getMinimum(),
                hourlyService ? null : entity.getMaximum(),
                entity.getAmount(),
                entity.getPricingType(),
                entity.getDescription(),
                hourlyService ? getHourlyDuration(entity) : null);
    }

    private ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
