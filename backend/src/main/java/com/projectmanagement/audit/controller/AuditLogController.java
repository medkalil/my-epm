package com.projectmanagement.audit.controller;

import com.projectmanagement.audit.dto.AuditFilterOptionsResponse;
import com.projectmanagement.audit.dto.AuditLogFilter;
import com.projectmanagement.audit.dto.AuditLogPageResponse;
import com.projectmanagement.audit.dto.AuditStatisticsResponse;
import com.projectmanagement.audit.service.AuditLogService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/audit-logs")
public class AuditLogController {

    private static final DateTimeFormatter FILE_TIME =
            DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss").withZone(ZoneOffset.UTC);

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("@orgSecurity.hasRole(#orgId, 'OWNER', 'ADMIN')")
    public ResponseEntity<AuditLogPageResponse> getLogs(
            @P("orgId") @RequestParam("orgId") Long orgId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "from", required = false) Instant from,
            @RequestParam(name = "to", required = false) Instant to,
            @RequestParam(name = "actor", required = false) String actor,
            @RequestParam(name = "action", required = false) String action,
            @RequestParam(name = "resource", required = false) String resource,
            @RequestParam(name = "success", required = false) Boolean success) {
        AuditLogFilter filter = new AuditLogFilter(from, to, actor, action, resource, success);
        return ResponseEntity.ok(auditLogService.search(orgId, filter, page, size));
    }

    @GetMapping("/stats")
    @PreAuthorize("@orgSecurity.hasRole(#orgId, 'OWNER', 'ADMIN')")
    public ResponseEntity<AuditStatisticsResponse> getStats(
            @P("orgId") @RequestParam("orgId") Long orgId,
            @RequestParam(name = "from", required = false) Instant from,
            @RequestParam(name = "to", required = false) Instant to) {
        return ResponseEntity.ok(auditLogService.stats(orgId, from, to));
    }

    @GetMapping("/filter-options")
    @PreAuthorize("@orgSecurity.hasRole(#orgId, 'OWNER', 'ADMIN')")
    public ResponseEntity<AuditFilterOptionsResponse> getFilterOptions(
            @P("orgId") @RequestParam("orgId") Long orgId,
            @RequestParam(name = "from", required = false) Instant from,
            @RequestParam(name = "to", required = false) Instant to) {
        return ResponseEntity.ok(auditLogService.filterOptions(orgId, from, to));
    }

    @GetMapping("/export")
    @PreAuthorize("@orgSecurity.hasRole(#orgId, 'OWNER', 'ADMIN')")
    public ResponseEntity<byte[]> export(
            @P("orgId") @RequestParam("orgId") Long orgId,
            @RequestParam(name = "format") String format,
            @RequestParam(name = "from", required = false) Instant from,
            @RequestParam(name = "to", required = false) Instant to,
            @RequestParam(name = "actor", required = false) String actor,
            @RequestParam(name = "action", required = false) String action,
            @RequestParam(name = "resource", required = false) String resource,
            @RequestParam(name = "success", required = false) Boolean success) {

        AuditLogFilter filter = new AuditLogFilter(from, to, actor, action, resource, success);
        boolean csv = "csv".equalsIgnoreCase(format);
        byte[] bytes = csv
                ? auditLogService.exportCsv(orgId, filter)
                : auditLogService.exportXlsx(orgId, filter);

        String extension = csv ? "csv" : "xlsx";
        String window = (from != null ? FILE_TIME.format(from) : "start") + "-"
                + (to != null ? FILE_TIME.format(to) : "now");
        String filename = "audit-log-" + orgId + "-" + window + "." + extension;

        MediaType contentType = csv
                ? MediaType.parseMediaType("text/csv")
                : MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        return ResponseEntity.status(HttpStatus.OK)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(contentType)
                .body(bytes);
    }
}