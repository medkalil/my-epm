package com.projectmanagement.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "Username or email is required")
        String identifier
) {}