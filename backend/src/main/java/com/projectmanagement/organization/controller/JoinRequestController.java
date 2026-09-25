package com.projectmanagement.organization.controller;

import com.projectmanagement.organization.dto.response.JoinRequestResponse;
import com.projectmanagement.organization.entity.JoinRequestStatus;
import com.projectmanagement.organization.service.JoinRequestService;
import com.projectmanagement.user.entity.User;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organizations/{orgId}/join-requests")
public class JoinRequestController {

    private final JoinRequestService joinRequestService;

    public JoinRequestController(JoinRequestService joinRequestService) {
        this.joinRequestService = joinRequestService;
    }

    @GetMapping
    public ResponseEntity<List<JoinRequestResponse>> list(
            @PathVariable("orgId") Long orgId,
            @RequestParam(value = "status", required = false) JoinRequestStatus status) {
        return ResponseEntity.ok(joinRequestService.listByOrganization(orgId, status));
    }

    @PostMapping("/{requestId}/approve")
    public ResponseEntity<JoinRequestResponse> approve(
            @PathVariable("orgId") Long orgId,
            @PathVariable("requestId") Long requestId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Long reviewerId = user.getId();
        JoinRequestResponse response = joinRequestService.approve(orgId, requestId, reviewerId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{requestId}/reject")
    public ResponseEntity<JoinRequestResponse> reject(
            @PathVariable("orgId") Long orgId,
            @PathVariable("requestId") Long requestId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Long reviewerId = user.getId();
        JoinRequestResponse response = joinRequestService.reject(orgId, requestId, reviewerId);
        return ResponseEntity.ok(response);
    }
}