package org.openapitools.configuration;

import org.openapitools.domain.DeliveryNoteOption;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

@Component
public class DeliveryNoteOptionDatabaseInitializer implements CommandLineRunner {
    private final MongoTemplate mongo;

    public DeliveryNoteOptionDatabaseInitializer(MongoTemplate mongo) {
        this.mongo = mongo;
    }

    @Override
    public void run(String... args) {
        try {
            if (!mongo.collectionExists(DeliveryNoteOption.class)) {
                mongo.createCollection(DeliveryNoteOption.class);
            }
            mongo.indexOps(DeliveryNoteOption.class)
                    .ensureIndex(
                            new Index()
                                    .on("type", Sort.Direction.ASC)
                                    .on("value", Sort.Direction.ASC)
                                    .unique());
            initializeOptions();
        } catch (DataAccessResourceFailureException exception) {
            LoggerFactory.getLogger(getClass())
                    .warn("MongoDB is not available. Skipping DDT options bootstrap.");
        }
    }

    private void initializeOptions() {
        seed(DeliveryNoteOption.Type.TRANSPORT, "Mittente");
        seed(DeliveryNoteOption.Type.FREIGHT, "FRANCO");
    }

    private void seed(DeliveryNoteOption.Type type, String value) {
        // Una voce modificata o disattivata non viene sovrascritta al riavvio.
        String id = "default-" + type.name();
        mongo.upsert(
                Query.query(Criteria.where("_id").is(id)),
                new Update()
                        .setOnInsert("type", type)
                        .setOnInsert("value", value)
                        .setOnInsert("active", true),
                DeliveryNoteOption.class);
    }
}
