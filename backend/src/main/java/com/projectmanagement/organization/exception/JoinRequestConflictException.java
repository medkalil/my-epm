package com.projectmanagement.organization.exception;

public class JoinRequestConflictException extends RuntimeException {
    public JoinRequestConflictException(String message) {
        super(message);
    }
}