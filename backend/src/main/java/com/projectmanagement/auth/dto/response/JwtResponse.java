package com.projectmanagement.auth.dto.response;

import com.projectmanagement.organization.dto.response.OrganizationResponse;
import java.util.List;

public record JwtResponse(
    String token,
    String type,
    String refreshToken,
    Long id,
    String username,
    Long currentOrganizationId,
    List<OrganizationResponse> organizations
) {
    public JwtResponse(String accessToken, String refreshToken, Long id, String username, Long currentOrganizationId, List<OrganizationResponse> organizations) {
        this(accessToken, "Bearer", refreshToken, id, username, currentOrganizationId, organizations);
    }

    public JwtResponse(String accessToken, String refreshToken, Long id, String username, List<OrganizationResponse> organizations) {
        this(accessToken, "Bearer", refreshToken, id, username, organizations.isEmpty() ? null : organizations.get(0).id(), organizations);
    }

    public JwtResponse(String accessToken, String refreshToken, Long id, String username) {
        this(accessToken, "Bearer", refreshToken, id, username, null, List.of());
    }
}
