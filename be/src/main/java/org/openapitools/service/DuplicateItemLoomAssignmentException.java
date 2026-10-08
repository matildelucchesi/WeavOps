package org.openapitools.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateItemLoomAssignmentException extends RuntimeException {
    public DuplicateItemLoomAssignmentException(String message) {
        super(message);
    }
}
