package com.projectmanagement.audit.service;

import com.projectmanagement.audit.dto.AuditFilterOptionsResponse;
import com.projectmanagement.audit.dto.AuditLogEntry;
import com.projectmanagement.audit.dto.AuditLogFilter;
import com.projectmanagement.audit.dto.AuditLogPageResponse;
import com.projectmanagement.audit.dto.AuditStatisticsResponse;

import java.time.Instant;

public interface AuditLogService {

    void record(AuditLogEntry entry);

    AuditLogPageResponse search(Long orgId, AuditLogFilter filter, int page, int size);

    AuditStatisticsResponse stats(Long orgId, Instant from, Instant to);

    AuditFilterOptionsResponse filterOptions(Long orgId, Instant from, Instant to);

    byte[] exportCsv(Long orgId, AuditLogFilter filter);

    byte[] exportXlsx(Long orgId, AuditLogFilter filter);
}