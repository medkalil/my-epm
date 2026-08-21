package com.projectmanagement.organization.exception;

public class OrganizationSlugAlreadyExistsException extends RuntimeException {
    public OrganizationSlugAlreadyExistsException(String message) {
        super(message);
    }
}
