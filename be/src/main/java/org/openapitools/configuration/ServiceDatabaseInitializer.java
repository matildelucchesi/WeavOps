package org.openapitools.configuration;

import java.math.BigDecimal;
import org.openapitools.domain.RateEntity;
import org.openapitools.domain.ServiceEntity;
import org.openapitools.model.RatePricingType;
import org.openapitools.repository.ServiceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

@Component
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
        name = "app.bootstrap.services.enabled",
        havingValue = "true",
        matchIfMissing = true)
public class ServiceDatabaseInitializer implements CommandLineRunner {
    private final MongoTemplate mongo;
    private final ServiceRepository repository;

    public ServiceDatabaseInitializer(MongoTemplate mongo, ServiceRepository repository) {
        this.mongo = mongo;
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        try {
            initializeCollections();
            initializeServices();
            initializeRates();
        } catch (org.springframework.dao.DataAccessResourceFailureException exception) {
            org.slf4j.LoggerFactory.getLogger(getClass())
                    .warn("MongoDB is not available. Skipping service bootstrap.");
        }
    }

    private void initializeCollections() {
        if (!mongo.collectionExists(ServiceEntity.class)) {
            mongo.createCollection(ServiceEntity.class);
        }
        if (!mongo.collectionExists(RateEntity.class)) {
            mongo.createCollection(RateEntity.class);
        }
    }

    private void initializeServices() {
        seedService("PICKS", "Colpi", "PICKS_PER_DM");
        seedService("KNOTTING", "Annodature", "THREADS");
        seedService("DRAWING_IN", "Licciate", "THREADS");
        seedService("SAMPLE_LOOMS", "Telai a campione", "HOURS");
    }

    private void initializeRates() {
        // Il listino iniziale viene inserito soltanto se la collezione è vuota.
        // Le tariffe già presenti, anche se inserite dall'interfaccia, vengono conservate.
        if (mongo.exists(new Query(), RateEntity.class)) {
            return;
        }

        // Listino iniziale. Gli importi rimangono numerici per poterli usare in fatturazione.
        // Firma: seedRate(codiceServizio, minimo, massimo, importoFissoInEuro).
        // Il minimo è incluso, il massimo escluso; null indica nessun limite superiore.
        // Usare il punto per i decimali e non sovrapporre fasce dello stesso servizio.

        // Colpi per decimetro (numeri interi).
        seedRate(
                "PICKS",
                "1",
                "100",
                null,
                RatePricingType.ON_REQUEST,
                "Tariffa da concordare in base alla tipologia di filato ed ai metri");
        seedRate("PICKS", "100", "131", "0.55");
        seedRate("PICKS", "131", "171", "0.50");
        seedRate("PICKS", "171", "201", "0.45");
        seedRate("PICKS", "201", "231", "0.40");
        seedRate("PICKS", "231", null, "0.36");

        // Annodature: numero di fili (numeri interi).
        seedRate("KNOTTING", "0", "4000", "40.00");
        seedRate("KNOTTING", "4000", "6000", "50.00");
        seedRate("KNOTTING", "6000", "7000", "60.00");
        seedRate("KNOTTING", "7000", "8000", "70.00");
        seedRate("KNOTTING", "8000", null, "100.00");

        // Licciate: numero di fili (numeri interi).
        seedRate("DRAWING_IN", "0", "3001", "140.00");
        // Da 3001 fili: 0,045 euro moltiplicati per TUTTI i fili, senza aggiungere 140 euro.
        seedRate("DRAWING_IN", "3001", null, "0.045", RatePricingType.PER_THREAD, null);

        // Telai a campione: durata specifica in ore e relativo importo fisso.
        // Firma: seedHourlyRate(numeroOre, imp ortoInEuro). Nessuna fascia oraria.
        seedHourlyRate("24", "140.00");
    }

    private void seedService(String code, String name, String criterion) {
        if (!repository.existsByCode(code)) {
            repository.save(new ServiceEntity(code, name, criterion));
        }
    }

    private void seedHourlyRate(String hours, String amount) {
        Query serviceQuery = Query.query(Criteria.where("code").is("SAMPLE_LOOMS"));
        ServiceEntity service = mongo.findOne(serviceQuery, ServiceEntity.class);
        if (service == null) {
            throw new IllegalStateException("Servizio non trovato: SAMPLE_LOOMS");
        }
        RateEntity rate = new RateEntity();
        rate.setServiceId(service.getId());
        rate.setHours(new BigDecimal(hours));
        rate.setAmount(new BigDecimal(amount));
        rate.setPricingType(RatePricingType.FIXED);
        mongo.insert(rate);
    }

    private void seedRate(String serviceCode, String minimum, String maximum, String amount) {
        seedRate(serviceCode, minimum, maximum, amount, RatePricingType.FIXED, null);
    }

    private void seedRate(
            String serviceCode,
            String minimum,
            String maximum,
            String amount,
            RatePricingType pricingType,
            String description) {
        Query serviceQuery = Query.query(Criteria.where("code").is(serviceCode));
        ServiceEntity service = mongo.findOne(serviceQuery, ServiceEntity.class);

        if (service == null) {
            throw new IllegalStateException("Servizio non trovato: " + serviceCode);
        }

        RateEntity rate = new RateEntity();
        rate.setServiceId(service.getId());
        rate.setMinimum(new BigDecimal(minimum));
        rate.setMaximum(maximum == null ? null : new BigDecimal(maximum));
        rate.setAmount(amount == null ? null : new BigDecimal(amount));
        rate.setPricingType(pricingType);
        rate.setDescription(description);

        mongo.insert(rate);
    }
}
