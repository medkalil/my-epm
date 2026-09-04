package com.projectmanagement.organization.controller;

import com.projectmanagement.organization.dto.request.AddMemberRequest;
import com.projectmanagement.organization.dto.request.CreateOrganizationRequest;
import com.projectmanagement.organization.dto.response.OrganizationMemberResponse;
import com.projectmanagement.organization.dto.response.OrganizationResponse;
import com.projectmanagement.organization.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @PostMapping
    public ResponseEntity<OrganizationResponse> createOrganization(
            @Valid @RequestBody CreateOrganizationRequest request,
            Authentication authentication) {
        OrganizationResponse response = organizationService.createOrganization(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrganizationResponse>> getUserOrganizations(Authentication authentication) {
        List<OrganizationResponse> organizations = organizationService.getUserOrganizations(authentication.getName());
        return ResponseEntity.ok(organizations);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@orgSecurity.isMember(#id)")
    public ResponseEntity<OrganizationResponse> getOrganizationById(@P("id") @PathVariable("id") Long id) {
        OrganizationResponse response = organizationService.getOrganizationById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<OrganizationResponse> getOrganizationBySlug(@PathVariable("slug") String slug) {
        OrganizationResponse response = organizationService.getOrganizationBySlug(slug);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("@orgSecurity.hasRole(#id, 'OWNER', 'ADMIN')")
    public ResponseEntity<OrganizationMemberResponse> addMember(
            @P("id") @PathVariable("id") Long id,
            @Valid @RequestBody AddMemberRequest request) {
        OrganizationMemberResponse response = organizationService.addMember(id, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/members")
    @PreAuthorize("@orgSecurity.isMember(#id)")
    public ResponseEntity<List<OrganizationMemberResponse>> getMembers(@P("id") @PathVariable("id") Long id) {
        List<OrganizationMemberResponse> members = organizationService.getMembers(id);
        return ResponseEntity.ok(members);
    }

    @PostMapping("/{id}/switch")
    @PreAuthorize("@orgSecurity.isMember(#id)")
    public ResponseEntity<OrganizationResponse> switchActiveOrganization(
            @P("id") @PathVariable("id") Long id,
            Authentication authentication) {
        OrganizationResponse response = organizationService.switchActiveOrganization(id, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
