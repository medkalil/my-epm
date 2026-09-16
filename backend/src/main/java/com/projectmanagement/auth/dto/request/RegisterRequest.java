package com.projectmanagement.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
    @NotBlank(message = "Username is required")
    String username,
    @NotBlank(message = "Email is required")
    String email,
    @NotBlank(message = "Full name is required")
    String fullName,
    @NotBlank(message = "Password is required")
    String password
) {}
