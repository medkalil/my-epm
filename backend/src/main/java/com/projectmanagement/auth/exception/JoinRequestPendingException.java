package com.projectmanagement.auth.exception;

import com.projectmanagement.organization.entity.JoinRequestStatus;

public class JoinRequestPendingException extends RuntimeException {

    private final JoinRequestStatus status;
    private final String organizationName;

    public JoinRequestPendingException(String organizationName, JoinRequestStatus status) {
        super(buildMessage(organizationName, status));
        this.organizationName = organizationName;
        this.status = status;
    }

    private static String buildMessage(String organizationName, JoinRequestStatus status) {
        if (status == JoinRequestStatus.REJECTED) {
            return "Your request to join '" + organizationName + "' was rejected.";
        }
        return "Your request to join '" + organizationName + "' is still awaiting approval.";
    }

    public JoinRequestStatus getStatus() {
        return status;
    }

    public String getOrganizationName() {
        return organizationName;
    }
}