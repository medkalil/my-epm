package com.projectmanagement.project.controller;

import com.projectmanagement.project.dto.ProjectCreateDto;
import com.projectmanagement.project.dto.ProjectResponseDto;
import com.projectmanagement.project.dto.ProjectUpdateDto;
import com.projectmanagement.project.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    @PreAuthorize("@orgSecurity.isMember(#request.organizationId)")
    public ResponseEntity<ProjectResponseDto> createProject(
            @P("request") @Valid @RequestBody ProjectCreateDto request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        ProjectResponseDto response = projectService.createProject(request, username);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@orgSecurity.isMember(#orgId)")
    public ResponseEntity<ProjectResponseDto> getProjectById(
            @P("id") @PathVariable("id") Long id,
            @P("orgId") @RequestParam("orgId") Long orgId) {
        ProjectResponseDto response = projectService.getProjectById(id, orgId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/organization/{orgId}")
    @PreAuthorize("@orgSecurity.isMember(#orgId)")
    public ResponseEntity<List<ProjectResponseDto>> getProjectsByOrganization(
            @P("orgId") @PathVariable("orgId") Long orgId) {
        List<ProjectResponseDto> response = projectService.getProjectsByOrganization(orgId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@orgSecurity.isMember(#orgId)")
    public ResponseEntity<ProjectResponseDto> updateProject(
            @P("id") @PathVariable("id") Long id,
            @P("orgId") @RequestParam("orgId") Long orgId,
            @P("dto") @Valid @RequestBody ProjectUpdateDto dto) {
        ProjectResponseDto response = projectService.updateProject(id, orgId, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@orgSecurity.isMember(#orgId)")
    public ResponseEntity<Void> deleteProject(
            @P("id") @PathVariable("id") Long id,
            @P("orgId") @RequestParam("orgId") Long orgId) {
        projectService.deleteProject(id, orgId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members/{userId}")
    @PreAuthorize("@orgSecurity.isMember(#orgId)")
    public ResponseEntity<ProjectResponseDto> addMember(
            @P("id") @PathVariable("id") Long id,
            @P("userId") @PathVariable("userId") Long userId,
            @P("orgId") @RequestParam("orgId") Long orgId) {
        ProjectResponseDto response = projectService.addMemberToProject(id, orgId, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("@orgSecurity.isMember(#orgId)")
    public ResponseEntity<ProjectResponseDto> removeMember(
            @P("id") @PathVariable("id") Long id,
            @P("userId") @PathVariable("userId") Long userId,
            @P("orgId") @RequestParam("orgId") Long orgId) {
        ProjectResponseDto response = projectService.removeMemberFromProject(id, orgId, userId);
        return ResponseEntity.ok(response);
    }
}
