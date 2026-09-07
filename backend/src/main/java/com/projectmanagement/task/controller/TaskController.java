package com.projectmanagement.task.controller;

import com.projectmanagement.task.dto.TaskCreateDto;
import com.projectmanagement.task.dto.TaskResponseDto;
import com.projectmanagement.task.dto.TaskUpdateDto;
import com.projectmanagement.task.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    @PreAuthorize("@orgSecurity.isMember(#request.organizationId)")
    public ResponseEntity<TaskResponseDto> createTask(
        @P("request") @Valid @RequestBody TaskCreateDto request) {
        TaskResponseDto response = taskService.createTask(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@orgSecurity.isMember(#orgId)")
    public ResponseEntity<TaskResponseDto> getTaskById(
            @P("id") @PathVariable("id") Long id,
            @P("orgId") @RequestParam("orgId") Long orgId) {
        TaskResponseDto response = taskService.getTaskById(id, orgId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("@orgSecurity.isMember(#orgId)")
    public ResponseEntity<List<TaskResponseDto>> getTasksByProject(
            @P("projectId") @PathVariable("projectId") Long projectId,
            @P("orgId") @RequestParam("orgId") Long orgId) {
        List<TaskResponseDto> response = taskService.getTasksByProject(projectId, orgId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/organization/{orgId}")
    @PreAuthorize("@orgSecurity.isMember(#orgId)")
    public ResponseEntity<List<TaskResponseDto>> getTasksByOrganization(
            @P("orgId") @PathVariable("orgId") Long orgId) {
        List<TaskResponseDto> response = taskService.getTasksByOrganization(orgId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("@orgSecurity.isMember(#orgId)")
    public ResponseEntity<List<TaskResponseDto>> getTasksByAffectedUser(
            @P("userId") @PathVariable("userId") Long userId,
            @P("orgId") @RequestParam("orgId") Long orgId) {
        List<TaskResponseDto> response = taskService.getTasksByAffectedUser(userId, orgId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@orgSecurity.isMember(#orgId)")
    public ResponseEntity<TaskResponseDto> updateTask(
            @P("id") @PathVariable("id") Long id,
            @P("orgId") @RequestParam("orgId") Long orgId,
            @P("dto") @Valid @RequestBody TaskUpdateDto dto) {
        TaskResponseDto response = taskService.updateTask(id, orgId, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@orgSecurity.isMember(#orgId)")
    public ResponseEntity<Void> deleteTask(
            @P("id") @PathVariable("id") Long id,
            @P("orgId") @RequestParam("orgId") Long orgId) {
        taskService.deleteTask(id, orgId);
        return ResponseEntity.noContent().build();
    }
}
