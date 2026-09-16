package com.projectmanagement.user.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateUserRequest(    
    @NotBlank(message = "Name is required")
    String name,
    @NotBlank(message = "Email is required")
    String email,
    @NotBlank(message = "Full name is required")
    String fullName
) { }
