package org.openapitools.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class DestinationValidationException extends ResponseStatusException {
    public DestinationValidationException(HttpStatus status, String message) {
        super(status, message);
    }
}
