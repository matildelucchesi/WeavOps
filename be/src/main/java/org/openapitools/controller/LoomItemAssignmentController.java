package org.openapitools.controller;

import com.mongodb.MongoException;
import org.openapitools.api.LoomItemAssignmentsApi;
import org.openapitools.mapper.LoomItemAssignmentMapper;
import org.openapitools.model.LoomItemAssignment;
import org.openapitools.service.LoomItemAssignmentService;
import org.openapitools.service.LoomAlreadyRunningException;
import org.openapitools.service.DuplicateItemLoomAssignmentException;
import org.openapitools.service.MobileTokenAuthorizationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
public class LoomItemAssignmentController implements LoomItemAssignmentsApi {

    private final LoomItemAssignmentService service;
    private final LoomItemAssignmentMapper mapper;
    private final MobileTokenAuthorizationService mobileTokenAuthorizationService;

    public LoomItemAssignmentController(
            LoomItemAssignmentService service,
            LoomItemAssignmentMapper mapper,
            MobileTokenAuthorizationService mobileTokenAuthorizationService
    ) {
        this.service = service;
        this.mapper = mapper;
        this.mobileTokenAuthorizationService = mobileTokenAuthorizationService;
    }

    @Override
    public ResponseEntity<List<LoomItemAssignment>> getLoomItemAssignments() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<LoomItemAssignment> getLoomItemAssignmentById(@PathVariable("id") String id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<LoomItemAssignment> createLoomItemAssignment(
            @Valid @RequestBody LoomItemAssignment loomItemAssignment
    ) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(mapper.toDto(service.save(mapper.toEntity(loomItemAssignment))));
        } catch (LoomAlreadyRunningException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (DuplicateItemLoomAssignmentException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException exception) {
            if (isConcurrentMongoWriteConflict(exception)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            throw exception;
        }
    }

    @Override
    public ResponseEntity<LoomItemAssignment> updateLoomItemAssignment(
            @PathVariable("id") String id,
            @Valid @RequestBody LoomItemAssignment loomItemAssignment
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (mobileTokenAuthorizationService.isMobileToken(authentication)
                && !mobileTokenAuthorizationService.canUpdateAssignment(authentication, id, loomItemAssignment)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            return service.update(id, mapper.toEntity(loomItemAssignment))
                    .map(mapper::toDto)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (LoomAlreadyRunningException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException exception) {
            if (isConcurrentMongoWriteConflict(exception)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            throw exception;
        }
    }

    @Override
    public ResponseEntity<Void> deleteLoomItemAssignment(@PathVariable("id") String id) {
        return service.deleteById(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @Override
    public ResponseEntity<List<LoomItemAssignment>> getLoomItemAssignmentsByLoomId(
            @PathVariable("loomId") String loomId
    ) {
        return ResponseEntity.ok(service.findByLoomId(loomId).stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<List<LoomItemAssignment>> getLoomItemAssignmentsByItemId(
            @PathVariable("itemId") String itemId
    ) {
        return ResponseEntity.ok(service.findByItemId(itemId).stream().map(mapper::toDto).toList());
    }

    @Override
    public ResponseEntity<LoomItemAssignment> getRunningAssignmentByLoomId(String loomId) {
        return service.getRunningAssignmentByLoomId(loomId)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private boolean isConcurrentMongoWriteConflict(Throwable error) {
        Throwable current = error;
        while (current != null) {
            if (current instanceof MongoException mongoException
                    && (mongoException.getCode() == 112 || mongoException.getCode() == 251)) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }
}
