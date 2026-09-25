package com.projectmanagement.organization.exception;

public class OrganizationJoinRequestNotFoundException extends RuntimeException {
    public OrganizationJoinRequestNotFoundException(String message) {
        super(message);
    }
}