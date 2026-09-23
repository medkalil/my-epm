package com.projectmanagement.audit.service;

import com.projectmanagement.audit.dto.AuditFilterOptionsResponse;
import com.projectmanagement.audit.dto.AuditLogEntry;
import com.projectmanagement.audit.dto.AuditLogFilter;
import com.projectmanagement.audit.dto.AuditLogPageResponse;
import com.projectmanagement.audit.dto.AuditLogResponse;
import com.projectmanagement.audit.dto.AuditStatisticsResponse;
import com.projectmanagement.audit.dto.NameValue;
import com.projectmanagement.audit.entity.AuditLog;
import com.projectmanagement.audit.repository.AuditLogRepository;
import com.projectmanagement.audit.util.AuditCsvExporter;
import com.projectmanagement.audit.util.AuditXlsxExporter;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private static final int MAX_EXPORT_ROWS = 50_000;
    private static final DateTimeFormatter DAY_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneOffset.UTC);

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    
    {/*REQUIRES_NEW:
       - Definition: Execute this method inside a completely new database transaction, independent of the transaction that called it.
       - This is usfuel for AuditLog: Usually you want an audit record to survive even when the operation being audited fails.
       - exp no REQUIRES_NEW:
            createTask()
                │
                └── Transaction A
                    │
                    ├── INSERT task
                    │
                    ├── INSERT audit_log
                    │
                    └── exception ❌
                            ↓
                        ROLLBACK
                            ↓
                    Task ❌
                    AuditLog ❌
            The audit log disappears too.
        -exp with REQUIRES_NEW:
            createTask()
                │
                └── Transaction A
                    │
                    ├── INSERT task
                    │
                    ├── auditService.record()
                    │       │
                    │       └── suspend Transaction A
                    │
                    │       └── Transaction B
                    │             │
                    │             └── INSERT audit_log
                    │             │
                    │             └── COMMIT ✅
                    │
                    │       └── resume Transaction A
                    │
                    └── exception ❌
                            ↓
                        ROLLBACK Transaction A
                            ↓
                        Task ❌
                        AuditLog ✅
            - as this will be executed as Aspect, so it will be executed with another Transactions to store the log. this ensure that this record
                will be executed in an independant Transaction so that if the Transaction of the task throws exception and fail the log ascpect and the record fucntion 
                will be executed to store the exception log, even if the original Transaction has throws.
            - Desing principle:  Existing transaction
                                        ↓
                                    SUSPENDED
                                        ↓
                                    NEW transaction created
                                        ↓
                                    record() executes
                                        ↓
                                    NEW transaction commits/rolls back
                                        ↓
                                    Original transaction resumes 
     */}
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(AuditLogEntry entry) {
        AuditLog log = new AuditLog();
        log.setOrganizationId(entry.organizationId());
        log.setActor(entry.actor());
        log.setAction(entry.action());
        log.setResource(entry.resource());
        log.setResourceId(entry.resourceId());
        log.setHttpMethod(entry.httpMethod());
        log.setPath(truncate(entry.path(), 255));
        log.setStatusCode(entry.statusCode());
        log.setSuccess(entry.success());
        log.setErrorMessage(entry.errorMessage());
        log.setIpAddress(entry.ipAddress());
        log.setUserAgent(truncate(entry.userAgent(), 255));
        log.setDurationMs(entry.durationMs());
        log.setCreatedAt(entry.createdAt() != null ? entry.createdAt() : Instant.now());
        auditLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public AuditLogPageResponse search(Long orgId, AuditLogFilter filter, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AuditLog> result = auditLogRepository.findAll(toSpecification(orgId, filter), pageable);

        List<AuditLogResponse> content = result.getContent().stream()
                .map(this::toResponse)
                .toList();

        return new AuditLogPageResponse(content, result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public AuditStatisticsResponse stats(Long orgId, Instant from, Instant to) {
        long totalEvents = auditLogRepository.countEvents(orgId, from, to);
        double successRate = round1(nvl(auditLogRepository.avgSuccessRate(orgId, from, to), 0.0) * 100.0);
        double avgDurationMs = round1(nvl(auditLogRepository.avgDurationMs(orgId, from, to), 0.0));

        long last24hCount = auditLogRepository.countByOrganizationIdAndCreatedAtAfter(
                orgId, Instant.now().minus(Duration.ofHours(24)));

        List<NameValue> byAction    = toNameValues(auditLogRepository.countByAction(orgId, from, to));
        List<NameValue> byResource  = toNameValues(auditLogRepository.countByResource(orgId, from, to));
        List<NameValue> topActors   = toNameValues(auditLogRepository.countByActor(orgId, from, to, PageRequest.of(0, 5)));
        List<NameValue> dailyTrend  = toDayValues(auditLogRepository.countByDay(orgId, from, to));

        return new AuditStatisticsResponse(totalEvents, successRate, avgDurationMs, last24hCount,
                byAction, byResource, topActors, dailyTrend);
    }

    @Override
    @Transactional(readOnly = true)
    public AuditFilterOptionsResponse filterOptions(Long orgId, Instant from, Instant to) {
        List<String> actors = auditLogRepository.countByActor(orgId, from, to, PageRequest.of(0, 200))
                .stream()
                .map(row -> String.valueOf(row[0]))
                .distinct()
                .toList();
        List<String> actions = auditLogRepository.countByAction(orgId, from, to)
                .stream()
                .map(row -> String.valueOf(row[0]))
                .distinct()
                .toList();
        List<String> resources = auditLogRepository.countByResource(orgId, from, to)
                .stream()
                .filter(row -> row[0] != null)
                .map(row -> String.valueOf(row[0]))
                .distinct()
                .toList();

        return new AuditFilterOptionsResponse(actors, actions, resources);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportCsv(Long orgId, AuditLogFilter filter) {
        return AuditCsvExporter.export(findAllForExport(orgId, filter));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportXlsx(Long orgId, AuditLogFilter filter) {
        return AuditXlsxExporter.export(findAllForExport(orgId, filter));
    }

    private List<AuditLog> findAllForExport(Long orgId, AuditLogFilter filter) {
        List<AuditLog> logs = auditLogRepository.findAll(
                toSpecification(orgId, filter),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        if (logs.size() > MAX_EXPORT_ROWS) {
            return logs.subList(0, MAX_EXPORT_ROWS);
        }
        return logs;
    }

    private Specification<AuditLog> toSpecification(Long orgId, AuditLogFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("organizationId"), orgId));
            if (filter != null) {
                if (filter.from() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.from()));
                }
                if (filter.to() != null) {
                    predicates.add(cb.lessThan(root.get("createdAt"), filter.to()));
                }
                if (filter.actor() != null && !filter.actor().isBlank()) {
                    predicates.add(cb.equal(root.get("actor"), filter.actor()));
                }
                if (filter.action() != null && !filter.action().isBlank()) {
                    predicates.add(cb.equal(root.get("action"), filter.action()));
                }
                if (filter.resource() != null && !filter.resource().isBlank()) {
                    predicates.add(cb.equal(root.get("resource"), filter.resource()));
                }
                if (filter.success() != null) {
                    predicates.add(cb.equal(root.get("success"), filter.success()));
                }
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private AuditLogResponse toResponse(AuditLog log) {
        AuditLogResponse response = new AuditLogResponse();
        response.setId(log.getId());
        response.setOrganizationId(log.getOrganizationId());
        response.setActor(log.getActor());
        response.setAction(log.getAction());
        response.setResource(log.getResource());
        response.setResourceId(log.getResourceId());
        response.setHttpMethod(log.getHttpMethod());
        response.setPath(log.getPath());
        response.setStatusCode(log.getStatusCode());
        response.setSuccess(log.isSuccess());
        response.setErrorMessage(log.getErrorMessage());
        response.setIpAddress(log.getIpAddress());
        response.setUserAgent(log.getUserAgent());
        response.setDurationMs(log.getDurationMs());
        response.setCreatedAt(log.getCreatedAt());
        return response;
    }

    private List<NameValue> toNameValues(List<Object[]> rows) {
        List<NameValue> result = new ArrayList<>();
        for (Object[] row : rows) {
            if (row.length < 2 || row[0] == null) {
                continue;
            }
            result.add(new NameValue(String.valueOf(row[0]), toLong(row[1])));
        }
        return result;
    }

    private List<NameValue> toDayValues(List<Object[]> rows) {
        List<NameValue> result = new ArrayList<>();
        for (Object[] row : rows) {
            if (row.length < 2 || row[0] == null) {
                continue;
            }
            Instant day = ((java.util.Date) row[0]).toInstant();
            result.add(new NameValue(DAY_FORMAT.format(day), toLong(row[1])));
        }
        return result;
    }

    private static double nvl(Double value, double fallback) {
        return value != null ? value : fallback;
    }

    private static long toLong(Object value) {
        return value instanceof Number number ? number.longValue() : 0L;
    }

    private static double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private static String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}