package org.openapitools.controller;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import org.openapitools.domain.ProductionSummaryPdfEntity;
import org.openapitools.service.ProductionSummaryPdfService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/production-summaries")
public class ProductionSummaryPdfController {
    private final ProductionSummaryPdfService service;

    public ProductionSummaryPdfController(ProductionSummaryPdfService service) {
        this.service = service;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductionSummaryPdfResponse> create(
            @RequestParam String loomId,
            @RequestParam String loomNumber,
            @RequestPart("file") MultipartFile file)
            throws IOException {
        if (file.isEmpty()
                || !MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(file.getContentType())) {
            return ResponseEntity.badRequest().build();
        }

        ProductionSummaryPdfEntity entity = new ProductionSummaryPdfEntity();
        entity.setLoomId(loomId);
        entity.setLoomNumber(loomNumber);
        entity.setFileName(sanitizeFileName(file.getOriginalFilename()));
        entity.setContent(file.getBytes());
        return ResponseEntity.status(201)
                .body(ProductionSummaryPdfResponse.from(service.save(entity)));
    }

    @GetMapping
    public ResponseEntity<List<ProductionSummaryPdfResponse>> list(
            @RequestParam(required = false) String loomId) {
        List<ProductionSummaryPdfEntity> entities =
                loomId == null || loomId.isBlank()
                        ? service.findAll()
                        : service.findByLoomId(loomId);
        return ResponseEntity.ok(
                entities.stream().map(ProductionSummaryPdfResponse::from).toList());
    }

    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<ByteArrayResource> download(@PathVariable String id) {
        return service.findById(id)
                .map(
                        entity ->
                                ResponseEntity.ok()
                                        .contentType(MediaType.APPLICATION_PDF)
                                        .header(
                                                HttpHeaders.CONTENT_DISPOSITION,
                                                ContentDisposition.attachment()
                                                        .filename(entity.getFileName())
                                                        .build()
                                                        .toString())
                                        .contentLength(entity.getContent().length)
                                        .body(new ByteArrayResource(entity.getContent())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "riepilogo-produzione.pdf";
        }
        return fileName.replaceAll("[\\\\/\\r\\n\\\"]", "_");
    }

    public record ProductionSummaryPdfResponse(
            String id, String loomId, String loomNumber, String fileName, Instant createdAt) {
        static ProductionSummaryPdfResponse from(ProductionSummaryPdfEntity entity) {
            return new ProductionSummaryPdfResponse(
                    entity.getId(),
                    entity.getLoomId(),
                    entity.getLoomNumber(),
                    entity.getFileName(),
                    entity.getCreatedAt());
        }
    }
}
