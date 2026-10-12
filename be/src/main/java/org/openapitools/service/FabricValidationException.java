package org.openapitools.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class FabricValidationException extends ResponseStatusException {
    public FabricValidationException(HttpStatus status, String message) {
        super(status, message);
    }

    public FabricValidationException(HttpStatus status, String message, Throwable cause) {
        super(status, message, cause);
    }
}
