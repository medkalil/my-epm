package com.projectmanagement.auth.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Username is required")
    String username,
    @NotBlank(message = "Email is required")
    String email,
    @NotBlank(message = "Full name is required")
    String fullName,
    @NotBlank(message = "Password is required")
    String password,
    @Valid
    OrganizationOnboarding organization
) {

    public record OrganizationOnboarding(
            @NotBlank(message = "Organization name is required")
            @Size(max = 100, message = "Organization name must not exceed 100 characters")
            String name,

            @NotBlank(message = "Organization slug is required")
            @Size(max = 100, message = "Organization slug must not exceed 100 characters")
            @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
            String slug
    ) {}
}