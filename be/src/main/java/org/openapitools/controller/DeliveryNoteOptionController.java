package org.openapitools.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.openapitools.domain.DeliveryNoteOption;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/delivery-note-options")
public class DeliveryNoteOptionController {
    private final MongoTemplate mongo;

    public DeliveryNoteOptionController(MongoTemplate mongo) {
        this.mongo = mongo;
    }

    @GetMapping
    public List<DeliveryNoteOption> list() {
        return mongo.find(
                new org.springframework.data.mongodb.core.query.Query()
                        .with(Sort.by("type", "value")),
                DeliveryNoteOption.class);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DeliveryNoteOption create(@Valid @RequestBody DeliveryNoteOption option) {
        return persist(UUID.randomUUID().toString(), option);
    }

    @PutMapping("/{id}")
    public DeliveryNoteOption update(
            @PathVariable String id, @Valid @RequestBody DeliveryNoteOption option) {
        if (mongo.findById(id, DeliveryNoteOption.class) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Opzione DDT non trovata");
        }
        return persist(id, option);
    }

    private DeliveryNoteOption persist(String id, DeliveryNoteOption option) {
        try {
            return mongo.save(
                    new DeliveryNoteOption(
                            id, option.type(), option.value().trim(), option.active()));
        } catch (DuplicateKeyException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Opzione già presente per questa tipologia", exception);
        }
    }
}
