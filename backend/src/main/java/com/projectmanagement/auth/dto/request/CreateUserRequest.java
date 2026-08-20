package com.projectmanagement.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateUserRequest(    
    @NotBlank(message = "Name is required")
    String name
) { }
