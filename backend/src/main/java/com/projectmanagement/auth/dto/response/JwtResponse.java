package com.projectmanagement.auth.dto.response;

public record JwtResponse(
    String token,
    String type,
    String refreshToken,
    Long id,
    String username,
    String role
) {
    public JwtResponse(String accessToken, String refreshToken, Long id, String username, String role) {
        this(accessToken, "Bearer", refreshToken, id, username, role);
    }
}
