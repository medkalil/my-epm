package com.projectmanagement.user.dto.response;

public record UserResponse(
    Long id,
    String name,
    String email,
    String fullName
) {}