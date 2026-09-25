package com.projectmanagement.organization.dto.response;

import com.projectmanagement.organization.entity.JoinRequestStatus;
import java.time.Instant;

public record JoinRequestResponse(
        Long id,
        Long organizationId,
        String organizationName,
        String organizationSlug,
        Long userId,
        String userName,
        String userEmail,
        JoinRequestStatus status,
        Instant requestedAt,
        Instant reviewedAt,
        Long reviewerUserId,
        String reviewerName
) {}