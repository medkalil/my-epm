package com.projectmanagement.audit.dto;

import java.time.Instant;

public record AuditLogEntry(Long organizationId,
                            String actor,
                            String action,
                            String resource,
                            Long resourceId,
                            String httpMethod,
                            String path,
                            Integer statusCode,
                            boolean success,
                            String errorMessage,
                            String ipAddress,
                            String userAgent,
                            Long durationMs,
                            Instant createdAt) {}