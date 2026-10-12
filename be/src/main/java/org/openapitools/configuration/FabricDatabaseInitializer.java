package org.openapitools.configuration;

import org.openapitools.domain.FabricEntity;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "app.bootstrap.fabrics.enabled",
        havingValue = "true",
        matchIfMissing = true)
public class FabricDatabaseInitializer implements CommandLineRunner {
    private final MongoTemplate mongoTemplate;

    public FabricDatabaseInitializer(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            if (!mongoTemplate.collectionExists(FabricEntity.class)) {
                mongoTemplate.createCollection(FabricEntity.class);
            }
            mongoTemplate
                    .indexOps(FabricEntity.class)
                    .ensureIndex(new Index().on("processId", Sort.Direction.ASC).unique());
            mongoTemplate
                    .indexOps(FabricEntity.class)
                    .ensureIndex(new Index().on("code", Sort.Direction.ASC).unique());
        } catch (DataAccessResourceFailureException exception) {
            LoggerFactory.getLogger(getClass())
                    .warn("MongoDB is not available. Skipping fabric bootstrap.");
        }
    }
}
