package com.projectmanagement.audit.service;

import com.projectmanagement.audit.dto.AuditLogEntry;
import com.projectmanagement.audit.dto.AuditLogFilter;
import com.projectmanagement.audit.dto.AuditLogPageResponse;
import com.projectmanagement.audit.dto.AuditStatisticsResponse;
import com.projectmanagement.audit.entity.AuditLog;
import com.projectmanagement.audit.repository.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditLogServiceImpl auditLogService;

    private AuditLog sampleLog() {
        AuditLog log = new AuditLog();
        log.setId(1L);
        log.setOrganizationId(1L);
        log.setActor("bob");
        log.setAction("CREATE");
        log.setResource("PROJECT");
        log.setResourceId(10L);
        log.setHttpMethod("POST");
        log.setPath("/api/v1/projects");
        log.setStatusCode(201);
        log.setSuccess(true);
        log.setDurationMs(5L);
        log.setCreatedAt(Instant.now());
        return log;
    }

    @Test
    void record_persistsAuditLog() {
        AuditLogEntry entry = new AuditLogEntry(
                1L, "bob", "CREATE", "PROJECT", 10L, "POST", "/api/v1/projects",
                201, true, null, "127.0.0.1", "test-agent", 5L, Instant.now());

        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        auditLogService.record(entry);

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());
        AuditLog saved = captor.getValue();
        assertEquals("bob", saved.getActor());
        assertEquals("CREATE", saved.getAction());
        assertEquals("PROJECT", saved.getResource());
        assertEquals(1L, saved.getOrganizationId());
        assertEquals(10L, saved.getResourceId());
    }

    @Test
    void search_returnsPage() {
        Page<AuditLog> page = new PageImpl<>(List.of(sampleLog()), PageRequest.of(0, 10), 1);
        when(auditLogRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        AuditLogPageResponse response =
                auditLogService.search(1L, new AuditLogFilter(null, null, null, null, null, null), 0, 10);

        assertEquals(1, response.getTotalElements());
        assertEquals(0, response.getPage());
        assertEquals(1, response.getContent().size());
        assertEquals("bob", response.getContent().get(0).getActor());
        assertEquals("CREATE", response.getContent().get(0).getAction());
    }

    @Test
    void stats_aggregatesRows() {
        when(auditLogRepository.summarize(eq(1L), any(), any()))
                .thenReturn(Optional.of(new Object[]{2L, 0.5, 100.0}));
        when(auditLogRepository.countByOrganizationIdAndCreatedAtAfter(eq(1L), any())).thenReturn(3L);
        when(auditLogRepository.countByAction(eq(1L), any(), any()))
                .thenReturn(List.<Object[]>of(
                        new Object[]{"CREATE", 1L},
                        new Object[]{"UPDATE", 1L}));
        when(auditLogRepository.countByResource(eq(1L), any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{"PROJECT", 2L}));
        when(auditLogRepository.countByActor(eq(1L), any(), any(), any(Pageable.class)))
                .thenReturn(List.<Object[]>of(new Object[]{"bob", 2L}));
        when(auditLogRepository.countByDay(eq(1L), any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{
                        java.sql.Timestamp.from(Instant.parse("2026-09-20T00:00:00Z")), 2L
                }));

        AuditStatisticsResponse response = auditLogService.stats(1L, null, null);

        assertEquals(2L, response.getTotalEvents());
        assertEquals(50.0, response.getSuccessRate(), 0.001);
        assertEquals(100.0, response.getAvgDurationMs(), 0.001);
        assertEquals(3L, response.getLast24hCount());
        assertEquals(2, response.getByAction().size());
        assertEquals("CREATE", response.getByAction().get(0).getName());
        assertEquals("PROJECT", response.getByResource().get(0).getName());
        assertEquals("bob", response.getTopActors().get(0).getName());
        assertEquals("2026-09-20", response.getDailyTrend().get(0).getName());
    }

    @Test
    void exportCsv_returnsContent() {
        when(auditLogRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(sampleLog()));

        byte[] bytes = auditLogService.exportCsv(1L, new AuditLogFilter(null, null, null, null, null, null));

        assertTrue(bytes.length > 0);
        String content = new String(bytes, StandardCharsets.UTF_8);
        assertTrue(content.contains("Actor"));
        assertTrue(content.contains("bob"));
    }

    @Test
    void exportXlsx_returnsContent() {
        when(auditLogRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(sampleLog()));

        byte[] bytes = auditLogService.exportXlsx(1L, new AuditLogFilter(null, null, null, null, null, null));

        assertNotNull(bytes);
        assertTrue(bytes.length > 0);
        byte[] expected = new byte[]{
                (byte) 0x50, (byte) 0x4B, (byte) 0x03, (byte) 0x04
        };
        assertArrayEquals(expected, new byte[]{bytes[0], bytes[1], bytes[2], bytes[3]});
    }
}