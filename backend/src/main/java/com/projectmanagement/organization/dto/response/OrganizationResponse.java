package com.projectmanagement.organization.dto.response;

import java.time.Instant;

public record OrganizationResponse(
        Long id,
        String name,
        String slug,
        Long ownerId,
        String ownerName,
        Instant createdAt,
        Instant updatedAt
) {}
