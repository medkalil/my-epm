package com.projectmanagement.organization.exception;

public class JoinRequestAlreadyReviewedException extends RuntimeException {
    public JoinRequestAlreadyReviewedException(String message) {
        super(message);
    }
}