package org.openapitools.service;

public class LoomAlreadyRunningException extends RuntimeException {
    public LoomAlreadyRunningException(String message) {
        super(message);
    }
}
