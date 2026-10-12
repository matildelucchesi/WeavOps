package org.openapitools.controller;

import java.util.Map;
import org.openapitools.service.DestinationValidationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class DestinationExceptionHandler {
    @ExceptionHandler(DestinationValidationException.class)
    public ResponseEntity<Map<String, String>> handle(DestinationValidationException exception) {
        return ResponseEntity.status(exception.getStatusCode())
                .body(Map.of("message", exception.getReason()));
    }
}
