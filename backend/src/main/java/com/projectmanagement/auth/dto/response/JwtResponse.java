package com.projectmanagement.auth.dto.response;

import com.projectmanagement.organization.dto.response.OrganizationResponse;
import java.util.List;

public record JwtResponse(
    String token,
    String type,
    String refreshToken,
    Long id,
    String username,
    String email,
    String fullName,
    Long currentOrganizationId,
    List<OrganizationResponse> organizations
) {
    public JwtResponse(String accessToken, String refreshToken, Long id, String username, String email, String fullName, Long currentOrganizationId, List<OrganizationResponse> organizations) {
        this(accessToken, "Bearer", refreshToken, id, username, email, fullName, currentOrganizationId, organizations);
    }

    public JwtResponse(String accessToken, String refreshToken, Long id, String username, String email, String fullName, List<OrganizationResponse> organizations) {
        this(accessToken, "Bearer", refreshToken, id, username, email, fullName, organizations.isEmpty() ? null : organizations.get(0).id(), organizations);
    }

    public JwtResponse(String accessToken, String refreshToken, Long id, String username) {
        this(accessToken, "Bearer", refreshToken, id, username, null, null, null, List.of());
    }
}
