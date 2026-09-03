package com.university.fms.exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) { super(message); }
}
