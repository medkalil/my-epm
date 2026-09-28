package com.projectmanagement.organization.dto.response;

import com.projectmanagement.organization.entity.OrganizationRole;

import java.time.Instant;

public record OrganizationResponse(
        Long id,
        String name,
        String slug,
        Long ownerId,
        String ownerName,
        Instant createdAt,
        Instant updatedAt,
        OrganizationRole myRole
) {}
