package com.projectmanagement.user.service;

import com.projectmanagement.user.dto.request.CreateUserRequest;
import com.projectmanagement.user.dto.response.UserResponse;
import java.util.List;

public interface UserService {
    UserResponse createUser(CreateUserRequest createUserRequest);
    UserResponse getUserById(Long id);
    List<UserResponse> getAll();
}
