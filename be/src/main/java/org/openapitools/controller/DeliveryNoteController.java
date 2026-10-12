package org.openapitools.controller;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.bson.Document;
import org.bson.types.Binary;
import org.openapitools.domain.FabricEntity;
import org.openapitools.service.DeliveryNotePersistenceService;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/delivery-notes")
public class DeliveryNoteController {
    private final MongoTemplate mongo;
    private final DeliveryNotePersistenceService persistence;

    public DeliveryNoteController(MongoTemplate mongo, DeliveryNotePersistenceService persistence) {
        this.mongo = mongo;
        this.persistence = persistence;
    }

    @PostMapping("/reserve-number")
    public Document reserveNumber() {
        int year = LocalDate.now(ZoneId.of("Europe/Rome")).getYear();
        Document counter =
                mongo.findAndModify(
                        Query.query(Criteria.where("_id").is("ddt-" + year)),
                        new Update().inc("value", 1),
                        FindAndModifyOptions.options().upsert(true).returnNew(true),
                        Document.class,
                        "document-counters");
        return new Document("number", counter.get("value")).append("year", year);
    }

    @GetMapping
    public List<Document> list() {
        Query query =
                new Query()
                        .with(
                                org.springframework.data.domain.Sort.by(
                                        org.springframework.data.domain.Sort.Direction.DESC,
                                        "createdAt"));
        query.fields().exclude("content");
        return mongo.find(query, Document.class, "delivery-notes");
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Document> create(
            @RequestParam int number,
            @RequestParam String date,
            @RequestParam String customerName,
            @RequestParam List<String> fabricIds,
            @RequestPart("file") MultipartFile file)
            throws IOException {
        LocalDate documentDate;
        try {
            documentDate = LocalDate.parse(date);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().build();
        }
        if (number < 1
                || customerName.isBlank()
                || fabricIds.isEmpty()
                || fabricIds.stream().anyMatch(id -> id == null || id.isBlank())
                || fabricIds.stream().distinct().count() != fabricIds.size()
                || file.isEmpty()
                || !MediaType.APPLICATION_PDF_VALUE.equals(file.getContentType())) {
            return ResponseEntity.badRequest().build();
        }
        Query availableFabrics =
                Query.query(Criteria.where("_id").in(fabricIds).and("status").is("AVAILABLE"));
        if (mongo.count(availableFabrics, FabricEntity.class) != fabricIds.size()) {
            return ResponseEntity.status(409).build();
        }
        // L'indice impedisce di associare la stessa Tela a due DDT, anche simultanei.
        mongo.indexOps("delivery-notes")
                .ensureIndex(
                        new org.springframework.data.mongodb.core.index.Index()
                                .on("fabricIds", org.springframework.data.domain.Sort.Direction.ASC)
                                .unique()
                                .sparse());
        mongo.indexOps("delivery-notes")
                .ensureIndex(
                        new org.springframework.data.mongodb.core.index.Index()
                                .on("year", org.springframework.data.domain.Sort.Direction.ASC)
                                .on("number", org.springframework.data.domain.Sort.Direction.ASC)
                                .unique());
        Document document =
                new Document("_id", java.util.UUID.randomUUID().toString())
                        .append("number", number)
                        .append("year", documentDate.getYear())
                        .append("date", date)
                        .append("customerName", customerName)
                        .append("fabricIds", List.copyOf(fabricIds))
                        .append("createdAt", Instant.now().toString())
                        .append("content", file.getBytes());
        try {
            persistence.save(document, fabricIds);
        } catch (org.springframework.dao.DuplicateKeyException ex) {
            return ResponseEntity.status(409).build();
        }
        document.remove("content");
        return ResponseEntity.status(201).body(document);
    }

    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> download(@PathVariable String id) {
        Document document =
                mongo.findOne(
                        Query.query(Criteria.where("_id").is(id)),
                        Document.class,
                        "delivery-notes");
        if (document == null) return ResponseEntity.notFound().build();
        Object content = document.get("content");
        byte[] bytes = content instanceof Binary binary ? binary.getData() : (byte[]) content;
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"ddt-"
                                + document.get("year")
                                + "-"
                                + document.get("number")
                                + ".pdf\"")
                .body(bytes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!persistence.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
