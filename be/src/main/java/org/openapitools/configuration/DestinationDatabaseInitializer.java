package org.openapitools.configuration;

import org.openapitools.domain.DestinationEntity;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "app.bootstrap.destinations.enabled",
        havingValue = "true",
        matchIfMissing = true)
public class DestinationDatabaseInitializer implements CommandLineRunner {
    private final MongoTemplate mongoTemplate;

    public DestinationDatabaseInitializer(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            if (!mongoTemplate.collectionExists(DestinationEntity.class)) {
                mongoTemplate.createCollection(DestinationEntity.class);
            }
        } catch (DataAccessResourceFailureException exception) {
            LoggerFactory.getLogger(getClass())
                    .warn("MongoDB is not available. Skipping destination bootstrap.");
        }
    }
}
