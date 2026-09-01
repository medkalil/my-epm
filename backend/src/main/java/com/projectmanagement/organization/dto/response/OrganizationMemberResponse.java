package com.projectmanagement.organization.dto.response;

import com.projectmanagement.organization.entity.OrganizationRole;
import java.time.Instant;

public record OrganizationMemberResponse(
        Long id,
        Long organizationId,
        Long userId,
        String userName,
        OrganizationRole role,
        boolean active,
        Instant joinedAt
) {}
