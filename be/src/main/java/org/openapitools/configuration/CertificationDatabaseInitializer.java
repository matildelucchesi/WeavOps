package org.openapitools.configuration;

import org.openapitools.domain.CertificationEntity;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
        name = "app.bootstrap.certifications.enabled",
        havingValue = "true",
        matchIfMissing = true)
public class CertificationDatabaseInitializer implements CommandLineRunner {
    private final MongoTemplate mongoTemplate;

    public CertificationDatabaseInitializer(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            if (mongoTemplate.collectionExists(CertificationEntity.class)) {
                return;
            }
            mongoTemplate.createCollection(CertificationEntity.class);
            seed("GRS", "Global Recycled Standard");
            seed("GOTS", "Global Organic Textile Standard");
        } catch (org.springframework.dao.DataAccessResourceFailureException exception) {
            org.slf4j.LoggerFactory.getLogger(getClass())
                    .warn("MongoDB is not available. Skipping certification bootstrap.");
        }
    }

    private void seed(String value, String description) {
        CertificationEntity entity = new CertificationEntity();
        entity.setValue(value);
        entity.setDescription(description);
        mongoTemplate.save(entity);
    }
}
