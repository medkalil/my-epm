package com.projectmanagement.audit.controller;

import com.projectmanagement.audit.dto.AuditFilterOptionsResponse;
import com.projectmanagement.audit.dto.AuditLogFilter;
import com.projectmanagement.audit.dto.AuditLogPageResponse;
import com.projectmanagement.audit.dto.AuditStatisticsResponse;
import com.projectmanagement.audit.dto.NameValue;
import com.projectmanagement.audit.service.AuditLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuditLogControllerTest {

    @Mock
    private AuditLogService auditLogService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new AuditLogController(auditLogService)).build();
    }

    @Test
    void getLogs_returnsPage() throws Exception {
        when(auditLogService.search(eq(1L), any(AuditLogFilter.class), eq(0), eq(10)))
                .thenReturn(new AuditLogPageResponse(List.of(), 0, 10, 1, 0));

        mockMvc.perform(get("/api/v1/audit-logs").param("orgId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(0))
                .andExpect(jsonPath("$.content.size()").value(0));
    }

    @Test
    void getLogs_withInstantRange_forwardedToService() throws Exception {
        when(auditLogService.search(eq(1L), any(AuditLogFilter.class), eq(1), eq(20)))
                .thenReturn(new AuditLogPageResponse(List.of(), 1, 20, 0, 0));

        mockMvc.perform(get("/api/v1/audit-logs")
                        .param("orgId", "1")
                        .param("page", "1")
                        .param("size", "20")
                        .param("actor", "bob")
                        .param("action", "CREATE")
                        .param("success", "true"))
                .andExpect(status().isOk());
    }

    @Test
    void getStats_returnsStatistics() throws Exception {
        when(auditLogService.stats(eq(1L), isNull(), isNull()))
                .thenReturn(new AuditStatisticsResponse(
                        4L, 75.0, 12.5, 2L,
                        List.of(new NameValue("CREATE", 3L)),
                        List.of(new NameValue("PROJECT", 4L)),
                        List.of(new NameValue("bob", 4L)),
                        List.of(new NameValue("2026-09-20", 4L))));

        mockMvc.perform(get("/api/v1/audit-logs/stats").param("orgId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEvents").value(4))
                .andExpect(jsonPath("$.successRate").value(75.0))
                .andExpect(jsonPath("$.dailyTrend.size()").value(1));
    }

    @Test
    void getFilterOptions_returnsOptions() throws Exception {
        when(auditLogService.filterOptions(eq(1L), isNull(), isNull()))
                .thenReturn(new AuditFilterOptionsResponse(
                        List.of("bob"),
                        List.of("CREATE", "UPDATE"),
                        List.of("PROJECT", "TASK")));

        mockMvc.perform(get("/api/v1/audit-logs/filter-options").param("orgId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.actors.size()").value(1))
                .andExpect(jsonPath("$.actions[1]").value("UPDATE"));
    }

    @Test
    void export_asCsv_returnsAttachment() throws Exception {
        byte[] csv = "Actor,Action\nbob,CREATE\n".getBytes();
        when(auditLogService.exportCsv(eq(1L), any(AuditLogFilter.class))).thenReturn(csv);

        mockMvc.perform(get("/api/v1/audit-logs/export")
                        .param("orgId", "1")
                        .param("format", "csv"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment; filename=")))
                .andExpect(content().bytes(csv));
    }

    @Test
    void export_asXlsx_returnsAttachment() throws Throwable {
        byte[] xlsx = {(byte) 0x50, (byte) 0x4B, (byte) 0x03, (byte) 0x04, 0x00};
        when(auditLogService.exportXlsx(eq(1L), any(AuditLogFilter.class))).thenReturn(xlsx);

        mockMvc.perform(get("/api/v1/audit-logs/export")
                        .param("orgId", "1")
                        .param("format", "xlsx"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(content().bytes(xlsx));
    }
}