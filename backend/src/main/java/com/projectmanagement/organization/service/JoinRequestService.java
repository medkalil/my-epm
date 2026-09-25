package com.projectmanagement.organization.service;

import com.projectmanagement.organization.dto.response.JoinRequestResponse;
import com.projectmanagement.organization.entity.JoinRequestStatus;
import com.projectmanagement.organization.entity.OrganizationJoinRequest;

import java.util.List;
import java.util.Optional;

public interface JoinRequestService {

    JoinRequestResponse createForRegister(String slug, String username);

    List<JoinRequestResponse> listByOrganization(Long organizationId, JoinRequestStatus status);

    JoinRequestResponse approve(Long organizationId, Long requestId, Long reviewerId);

    JoinRequestResponse reject(Long organizationId, Long requestId, Long reviewerId);

    long countPending(Long organizationId);

    Optional<OrganizationJoinRequest> findBlockingRequest(String username);
}