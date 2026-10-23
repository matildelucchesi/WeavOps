package org.openapitools.controller;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.bson.Document;
import org.bson.types.Binary;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/invoices")
public class InvoiceController {
    private final MongoTemplate mongo;

    public InvoiceController(MongoTemplate mongo) {
        this.mongo = mongo;
    }

    @GetMapping
    public List<Document> list() {
        Query query = new Query().with(Sort.by(Sort.Direction.DESC, "createdAt"));
        query.fields().exclude("content");
        return mongo.find(query, Document.class, "invoices");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> get(@PathVariable String id) {
        Query query = Query.query(Criteria.where("_id").is(id));
        query.fields().exclude("content");
        Document document = mongo.findOne(query, Document.class, "invoices");
        return document == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(document);
    }

    @PostMapping("/reserve-number")
    public Document nextNumber() {
        Query query = new Query().with(Sort.by(Sort.Direction.DESC, "number")).limit(1);
        query.fields().include("number");
        Document last = mongo.findOne(query, Document.class, "invoices");
        return new Document(
                "number",
                last == null ? 1 : Math.addExact(((Number) last.get("number")).intValue(), 1));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Document> create(
            @RequestParam String data, @RequestPart("file") MultipartFile file) throws IOException {
        return persist(null, data, file);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Document> update(
            @PathVariable String id,
            @RequestParam String data,
            @RequestPart("file") MultipartFile file)
            throws IOException {
        return persist(id, data, file);
    }

    private ResponseEntity<Document> persist(String id, String json, MultipartFile file)
            throws IOException {
        Document data;
        LocalDate date;
        int number;
        String customerName;
        try {
            data = Document.parse(json);
            date = LocalDate.parse(data.getString("date"));
            Number rawNumber = (Number) data.get("number");
            number = rawNumber.intValue();
            if (number < 1 || rawNumber.doubleValue() != number)
                throw new IllegalArgumentException();
            customerName = data.get("customer", Document.class).getString("name");
            if (customerName == null
                    || customerName.isBlank()
                    || data.get("issuer", Document.class).getString("name").isBlank())
                throw new IllegalArgumentException();
            List<Document> rows = data.getList("rows", Document.class);
            if (rows == null || rows.isEmpty() || rows.size() > 1000)
                throw new IllegalArgumentException();
            for (Document row : rows) {
                if (row.getString("description").isBlank()) throw new IllegalArgumentException();
                double quantity = finite(row.get("quantity"));
                double price = finite(row.get("price"));
                double vat = finite(row.get("vatRate"));
                if (quantity < 0 || price < 0 || vat < 0 || vat > 100)
                    throw new IllegalArgumentException();
                finite(quantity * price);
                if (row.get("amount") != null) finite(row.get("amount"));
            }
            for (String key : List.of("advance", "stamp")) finite(data.get(key));
            for (String key : List.of("totalOverride", "payableOverride"))
                if (data.get(key) != null) finite(data.get(key));
            Document overrides = data.get("taxOverrides", Document.class);
            if (overrides != null)
                for (Object value : overrides.values()) {
                    Document override = (Document) value;
                    for (String key : List.of("taxable", "tax"))
                        if (override.get(key) != null) finite(override.get(key));
                }
            String dueDate = data.getString("dueDate");
            if (dueDate != null && !dueDate.isBlank()) LocalDate.parse(dueDate);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().build();
        }
        if (file.isEmpty() || !MediaType.APPLICATION_PDF_VALUE.equals(file.getContentType()))
            return ResponseEntity.badRequest().build();
        Document existing =
                id == null
                        ? null
                        : mongo.findOne(
                                Query.query(Criteria.where("_id").is(id)),
                                Document.class,
                                "invoices");
        if (id != null && existing == null) return ResponseEntity.notFound().build();
        mongo.indexOps("invoices")
                .ensureIndex(
                        new Index()
                                .on("year", Sort.Direction.ASC)
                                .on("number", Sort.Direction.ASC)
                                .unique());
        Document document =
                new Document("_id", id == null ? UUID.randomUUID().toString() : id)
                        .append("number", number)
                        .append("year", date.getYear())
                        .append("date", date.toString())
                        .append("customerName", customerName)
                        .append("data", data)
                        .append(
                                "createdAt",
                                existing == null
                                        ? Instant.now().toString()
                                        : existing.get("createdAt"))
                        .append("updatedAt", Instant.now().toString())
                        .append("content", file.getBytes());
        try {
            if (id == null) mongo.insert(document, "invoices");
            else mongo.save(document, "invoices");
        } catch (DuplicateKeyException ex) {
            return ResponseEntity.status(409).build();
        }
        document.remove("content");
        return ResponseEntity.status(id == null ? 201 : 200).body(document);
    }

    private static double finite(Object value) {
        double number = ((Number) value).doubleValue();
        if (!Double.isFinite(number) || Math.abs(number) > 1e12)
            throw new IllegalArgumentException();
        return number;
    }

    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> download(@PathVariable String id) {
        Document document =
                mongo.findOne(
                        Query.query(Criteria.where("_id").is(id)), Document.class, "invoices");
        if (document == null) return ResponseEntity.notFound().build();
        Object content = document.get("content");
        byte[] bytes = content instanceof Binary binary ? binary.getData() : (byte[]) content;
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"fattura-"
                                + document.get("year")
                                + "-"
                                + document.get("number")
                                + ".pdf\"")
                .body(bytes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        var result =
                mongo.remove(Query.query(Criteria.where("_id").is(id)), Document.class, "invoices");
        return result.getDeletedCount() == 0
                ? ResponseEntity.notFound().build()
                : ResponseEntity.noContent().build();
    }
}
