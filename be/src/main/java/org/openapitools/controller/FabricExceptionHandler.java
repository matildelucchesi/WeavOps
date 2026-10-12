package org.openapitools.controller;

import java.util.Map;
import org.openapitools.service.FabricValidationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class FabricExceptionHandler {
    @ExceptionHandler(FabricValidationException.class)
    public ResponseEntity<Map<String, String>> handle(FabricValidationException exception) {
        return ResponseEntity.status(exception.getStatusCode())
                .body(Map.of("message", exception.getReason()));
    }
}
