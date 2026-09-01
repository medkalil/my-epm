package com.projectmanagement.organization.service;

import com.projectmanagement.organization.dto.request.AddMemberRequest;
import com.projectmanagement.organization.dto.request.CreateOrganizationRequest;
import com.projectmanagement.organization.dto.response.OrganizationMemberResponse;
import com.projectmanagement.organization.dto.response.OrganizationResponse;

import java.util.List;

public interface OrganizationService {
    OrganizationResponse createOrganization(CreateOrganizationRequest request, String currentUsername);
    OrganizationResponse getOrganizationById(Long id);
    OrganizationResponse getOrganizationBySlug(String slug);
    List<OrganizationResponse> getUserOrganizations(String currentUsername);
    Long getActiveOrganizationId(String currentUsername);
    OrganizationResponse switchActiveOrganization(Long organizationId, String currentUsername);
    OrganizationMemberResponse addMember(Long organizationId, AddMemberRequest request);
    List<OrganizationMemberResponse> getMembers(Long organizationId);
}
