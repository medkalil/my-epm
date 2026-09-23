package com.projectmanagement.audit.dto;

import java.time.Instant;

public record AuditLogFilter(Instant from,
                             Instant to,
                             String actor,
                             String action,
                             String resource,
                             Boolean success) {

    public boolean hasTimeBounds() {
        return from != null || to != null;
    }
}