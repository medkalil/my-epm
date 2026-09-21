package com.projectmanagement.organization.dto.response;

import com.projectmanagement.organization.entity.OrganizationRole;
import com.projectmanagement.user.dto.response.UserSummary;
import java.time.Instant;

public record OrganizationMemberResponse(
        Long id,
        Long organizationId,
        Long userId,
        UserSummary user,
        OrganizationRole role,
        boolean active,
        Instant joinedAt
) {}
