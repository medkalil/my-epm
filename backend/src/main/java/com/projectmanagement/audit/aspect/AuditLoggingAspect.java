package com.projectmanagement.audit.aspect;

import com.projectmanagement.audit.dto.AuditLogEntry;
import com.projectmanagement.audit.types.AuditActionType;
import com.projectmanagement.audit.types.AuditResourceType;
import com.projectmanagement.audit.service.AuditLogService;
import com.projectmanagement.organization.exception.OrganizationNotFoundException;
import com.projectmanagement.organization.exception.OrganizationSlugAlreadyExistsException;
import com.projectmanagement.project.exception.ProjectNotEditableException;
import com.projectmanagement.project.exception.ProjectNotFoundException;
import com.projectmanagement.task.exception.TaskNotFoundException;
import com.projectmanagement.user.exception.UserNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.util.Optional;

@Aspect
@Component
public class AuditLoggingAspect {

    private final AuditLogService auditLogService;

    public AuditLoggingAspect(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    // Join point = a place where something can happen exp: method executions
    // Pointcut = a rule that selects which places you care about exp: "within(@org....
    @Around("within(@org.springframework.web.bind.annotation.RestController *) "
            + "&& !within(com.projectmanagement.audit.controller..*)")
    public Object logMutatingOperations(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = currentRequest();
        String httpMethod = request != null ? request.getMethod() : "UNKNOWN";
        String uri = request != null ? request.getRequestURI() : "";

        Optional<AuditActionType> action = resolveAction(httpMethod, uri);
        if (action.isEmpty()) {
            return joinPoint.proceed();
        }

        String actor = currentActor();
        String ip = request != null ? clientIp(request) : null;
        String userAgent = request != null ? request.getHeader("User-Agent") : null;

        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            int status = result instanceof ResponseEntity<?> response
                    ? response.getStatusCode().value()
                    : HttpStatus.OK.value();
            persist(uri, httpMethod, action.get(), actor, ip, userAgent, status, true, null,
                    System.currentTimeMillis() - start);
            return result;
        } catch (Throwable t) {
            persist(uri, httpMethod, action.get(), actor, ip, userAgent, statusFor(t), false,
                    t.getMessage(), System.currentTimeMillis() - start);
            throw t;
        }
    }

    private void persist(String uri, String httpMethod, AuditActionType action, String actor,
                         String ip, String userAgent, int status, boolean success,
                         String errorMessage, long durationMs) {
        AuditResourceInfo resource = resolveResource(uri);
        AuditLogEntry entry = new AuditLogEntry(
                resolveOrgId(uri),
                actor,
                action.name(),
                resource.type().name(),
                resource.id(),
                httpMethod,
                uri,
                status,
                success,
                errorMessage,
                ip,
                userAgent,
                durationMs,
                Instant.now()
        );
        auditLogService.record(entry);
    }

    private Optional<AuditActionType> resolveAction(String httpMethod, String uri) {
        boolean mutating = httpMethod.equals("POST")
                || httpMethod.equals("PUT")
                || httpMethod.equals("PATCH")
                || httpMethod.equals("DELETE");
        if (!mutating) {
            return Optional.empty();
        }

        String[] segments = uri.split("/");
        if (segments.length < 4) {
            return Optional.empty();
        }
        String base = segments[3];
        if (base.equals("audit-logs")) {
            return Optional.empty();
        }
        if (base.equals("auth")) {
            String last = segments[segments.length - 1];
            return switch (last) {
                case "login" -> Optional.of(AuditActionType.LOGIN);
                case "register" -> Optional.of(AuditActionType.REGISTER);
                case "logout" -> Optional.of(AuditActionType.LOGOUT);
                default -> Optional.empty();
            };
        }
        if (uri.contains("/switch")) {
            return Optional.of(AuditActionType.SWITCH);
        }
        if (uri.contains("/move")) {
            return Optional.of(AuditActionType.MOVE);
        }
        return switch (httpMethod) {
            case "POST" -> Optional.of(AuditActionType.CREATE);
            case "PUT", "PATCH" -> Optional.of(AuditActionType.UPDATE);
            case "DELETE" -> Optional.of(AuditActionType.DELETE);
            default -> Optional.empty();
        };
    }

    private AuditResourceInfo resolveResource(String uri) {
        String[] segments = uri.split("/");
        if (segments.length < 4) {
            return new AuditResourceInfo(AuditResourceType.OTHER, null);
        }
        String base = segments[3];
        return switch (base) {
            case "auth" -> new AuditResourceInfo(AuditResourceType.AUTH, null);
            case "tasks" -> new AuditResourceInfo(AuditResourceType.TASK, parseLong(segments, 4));
            case "projects" -> new AuditResourceInfo(AuditResourceType.PROJECT, parseLong(segments, 4));
            case "users" -> new AuditResourceInfo(AuditResourceType.USER, parseLong(segments, 4));
            case "organizations" -> {
                if (segments.length > 5 && segments[5].equals("members")) {
                    yield new AuditResourceInfo(AuditResourceType.MEMBER, parseLong(segments, 6));
                }
                yield new AuditResourceInfo(AuditResourceType.ORGANIZATION, parseLong(segments, 4));
            }
            default -> new AuditResourceInfo(AuditResourceType.OTHER, null);
        };
    }

    private Long resolveOrgId(String uri) {
        HttpServletRequest request = currentRequest();
        if (request != null) {
            String orgIdParam = request.getParameter("orgId");
            if (orgIdParam != null && !orgIdParam.isBlank()) {
                try {
                    return Long.parseLong(orgIdParam);
                } catch (NumberFormatException ignored) {
                    // fall through to path-based resolution
                }
            }
        }
        String[] segments = uri.split("/");
        if (segments.length > 4 && segments[3].equals("organizations")) {
            return parseLong(segments, 4);
        }
        return null;
    }

    private Long parseLong(String[] segments, int index) {
        if (index >= segments.length) {
            return null;
        }
        try {
            return Long.parseLong(segments[index]);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String currentActor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return "anonymous";
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof String str && str.equals("anonymousUser")) {
            return "anonymous";
        }
        return auth.getName();
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private int statusFor(Throwable t) {
        if (t instanceof ProjectNotFoundException
                || t instanceof TaskNotFoundException
                || t instanceof OrganizationNotFoundException
                || t instanceof UserNotFoundException) {
            return HttpStatus.NOT_FOUND.value();
        }
        if (t instanceof ProjectNotEditableException
                || t instanceof OrganizationSlugAlreadyExistsException) {
            return HttpStatus.CONFLICT.value();
        }
        if (t instanceof AccessDeniedException) {
            return HttpStatus.FORBIDDEN.value();
        }
        if (t instanceof IllegalArgumentException
                || t instanceof org.springframework.http.converter.HttpMessageNotReadableException
                || t instanceof org.springframework.web.bind.MethodArgumentNotValidException) {
            return HttpStatus.BAD_REQUEST.value();
        }
        return HttpStatus.INTERNAL_SERVER_ERROR.value();
    }

    private HttpServletRequest currentRequest() {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    private record AuditResourceInfo(AuditResourceType type, Long id) {}
}