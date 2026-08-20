package com.projectmanagement.auth.service;

import com.projectmanagement.auth.dto.request.CreateUserRequest;
import com.projectmanagement.auth.dto.response.UserResponse;
import java.util.List;

public interface UserService {
    UserResponse createUser(CreateUserRequest createUserRequest);
    UserResponse getUserById(Long id);
    List<UserResponse> getAll();
}
