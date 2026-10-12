package org.openapitools.configuration;

import org.openapitools.domain.ProcessEntity;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.stereotype.Component;

@Component
public class ProcessFabricCodeIndexInitializer implements CommandLineRunner {
    private final MongoTemplate mongoTemplate;

    public ProcessFabricCodeIndexInitializer(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            mongoTemplate
                    .indexOps(ProcessEntity.class)
                    .ensureIndex(
                            new Index().on("fabricCode", Sort.Direction.ASC).unique().sparse());
        } catch (org.springframework.dao.DataAccessResourceFailureException exception) {
            org.slf4j.LoggerFactory.getLogger(getClass())
                    .warn("MongoDB is not available. Skipping process Tela-code index bootstrap.");
        }
    }
}
