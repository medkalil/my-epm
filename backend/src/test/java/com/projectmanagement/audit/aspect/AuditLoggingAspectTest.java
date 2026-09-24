package com.projectmanagement.audit.aspect;

import com.projectmanagement.audit.dto.AuditLogEntry;
import com.projectmanagement.audit.service.AuditLogService;
import com.projectmanagement.project.exception.ProjectNotFoundException;
import org.aspectj.lang.ProceedingJoinPoint;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLoggingAspectTest {

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private ProceedingJoinPoint joinPoint;

    private AuditLoggingAspect aspect;

    @BeforeEach
    void setUp() {
        aspect = new AuditLoggingAspect(auditLogService);
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
        SecurityContextHolder.clearContext();
    }

    private MockHttpServletRequest setRequest(String method, String uri) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, uri);
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        return request;
    }

    private void authenticateAs(String user) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, "pass", List.of()));
    }

    @Test
    void createOperation_isLogged() throws Throwable {
        setRequest("POST", "/api/v1/tasks").addParameter("orgId", "7");
        authenticateAs("bob");
        when(joinPoint.proceed()).thenReturn(new ResponseEntity<>(HttpStatus.CREATED));

        aspect.logMutatingOperations(joinPoint);

        ArgumentCaptor<AuditLogEntry> captor = ArgumentCaptor.forClass(AuditLogEntry.class);
        verify(auditLogService).record(captor.capture());
        AuditLogEntry entry = captor.getValue();
        assertEquals("bob", entry.actor());
        assertEquals("CREATE", entry.action());
        assertEquals("TASK", entry.resource());
        assertNull(entry.resourceId());
        assertEquals(7L, entry.organizationId());
        assertEquals("POST", entry.httpMethod());
        assertEquals(201, entry.statusCode());
        assertTrue(entry.success());
        assertNotNull(entry.createdAt());
    }

    @Test
    void moveOperation_isLoggedWithResourceId() throws Throwable {
        setRequest("PUT", "/api/v1/tasks/5/move").addParameter("orgId", "9");
        authenticateAs("alice");
        when(joinPoint.proceed()).thenReturn(new ResponseEntity<>(HttpStatus.OK));

        aspect.logMutatingOperations(joinPoint);

        ArgumentCaptor<AuditLogEntry> captor = ArgumentCaptor.forClass(AuditLogEntry.class);
        verify(auditLogService).record(captor.capture());
        assertEquals("MOVE", captor.getValue().action());
        assertEquals("TASK", captor.getValue().resource());
        assertEquals(5L, captor.getValue().resourceId());
    }

    @Test
    void loginOperation_isLogged() throws Throwable {
        setRequest("POST", "/api/v1/auth/login");
        when(joinPoint.proceed()).thenReturn(new ResponseEntity<>(HttpStatus.OK));
        when(joinPoint.getArgs()).thenReturn(new Object[0]);

        aspect.logMutatingOperations(joinPoint);

        ArgumentCaptor<AuditLogEntry> captor = ArgumentCaptor.forClass(AuditLogEntry.class);
        verify(auditLogService).record(captor.capture());
        assertEquals("LOGIN", captor.getValue().action());
        assertEquals("AUTH", captor.getValue().resource());
        assertNull(captor.getValue().organizationId());
    }

    @Test
    void getRequest_isNotLogged() throws Throwable {
        setRequest("GET", "/api/v1/tasks");
        when(joinPoint.proceed()).thenReturn(new ResponseEntity<>(HttpStatus.OK));

        aspect.logMutatingOperations(joinPoint);

        verify(joinPoint).proceed();
        verify(auditLogService, never()).record(any());
    }

    @Test
    void auditEndpoints_areNotLogged() throws Throwable {
        setRequest("GET", "/api/v1/audit-logs");
        when(joinPoint.proceed()).thenReturn(new ResponseEntity<>(HttpStatus.OK));

        aspect.logMutatingOperations(joinPoint);

        verify(joinPoint).proceed();
        verify(auditLogService, never()).record(any());
    }

    @Test
    void thrownException_isLoggedAsFailure() throws Throwable {
        setRequest("DELETE", "/api/v1/projects/42").addParameter("orgId", "3");
        authenticateAs("bob");
        when(joinPoint.proceed()).thenThrow(new ProjectNotFoundException("not found"));

        assertThrows(ProjectNotFoundException.class, () -> aspect.logMutatingOperations(joinPoint));

        ArgumentCaptor<AuditLogEntry> captor = ArgumentCaptor.forClass(AuditLogEntry.class);
        verify(auditLogService).record(captor.capture());
        AuditLogEntry entry = captor.getValue();
        assertEquals("DELETE", entry.action());
        assertEquals("PROJECT", entry.resource());
        assertEquals(42L, entry.resourceId());
        assertFalse(entry.success());
        assertEquals("not found", entry.errorMessage());
        assertEquals(404, entry.statusCode());
    }

}