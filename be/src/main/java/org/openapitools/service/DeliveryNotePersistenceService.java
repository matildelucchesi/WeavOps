package org.openapitools.service;

import java.util.List;
import org.bson.Document;
import org.openapitools.domain.FabricEntity;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DeliveryNotePersistenceService {
    private final MongoTemplate mongo;

    public DeliveryNotePersistenceService(MongoTemplate mongo) {
        this.mongo = mongo;
    }

    @Transactional(rollbackFor = Exception.class)
    public void save(Document document, List<String> fabricIds) {
        mongo.insert(document, "delivery-notes");
        var result =
                mongo.updateMulti(
                        Query.query(
                                Criteria.where("_id").in(fabricIds).and("status").is("AVAILABLE")),
                        new Update().set("status", "DELIVERED"),
                        FabricEntity.class);
        if (result.getMatchedCount() != fabricIds.size()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Una Tela non è più disponibile");
        }
        mongo.upsert(
                Query.query(Criteria.where("_id").is("ddt-" + document.getInteger("year"))),
                new Update().max("value", document.getInteger("number")),
                "document-counters");
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean delete(String id) {
        Query query = Query.query(Criteria.where("_id").is(id));
        Document document = mongo.findOne(query, Document.class, "delivery-notes");
        if (document == null) {
            return false;
        }
        List<String> fabricIds = document.getList("fabricIds", String.class);
        if (fabricIds != null && !fabricIds.isEmpty()) {
            mongo.updateMulti(
                    Query.query(Criteria.where("_id").in(fabricIds).and("status").is("DELIVERED")),
                    new Update().set("status", "AVAILABLE"),
                    FabricEntity.class);
        }
        mongo.remove(query, Document.class, "delivery-notes");
        return true;
    }
}
