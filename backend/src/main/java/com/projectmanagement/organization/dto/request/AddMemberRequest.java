package com.projectmanagement.organization.dto.request;

import com.projectmanagement.organization.entity.OrganizationRole;
import jakarta.validation.constraints.NotNull;

public record AddMemberRequest(
        @NotNull(message = "User ID is required")
        Long userId,

        @NotNull(message = "Role is required")
        OrganizationRole role
) {}
