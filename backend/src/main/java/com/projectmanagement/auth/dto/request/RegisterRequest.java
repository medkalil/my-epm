package com.projectmanagement.auth.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
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
    OrganizationOnboarding organization,

    @Size(max = 100, message = "Organization slug must not exceed 100 characters")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    String joinOrganizationSlug
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

    // The ^ means XOR
    // XOR = exactly one must be true.
    @AssertTrue(message = "Provide either organization details to create a workspace, or an organization slug to join an existing one — exactly one must be present")
    public boolean isRegistrationModeValid() {
        return (organization != null) ^ (joinOrganizationSlug != null);
    }
}