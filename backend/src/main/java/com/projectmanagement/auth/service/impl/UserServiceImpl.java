package com.projectmanagement.auth.service.impl;

import com.projectmanagement.auth.service.UserService;
import com.projectmanagement.auth.entity.User;
import com.projectmanagement.auth.dto.request.CreateUserRequest;
import com.projectmanagement.auth.dto.response.UserResponse;
import com.projectmanagement.auth.exception.UserNotFoundException;
import com.projectmanagement.auth.mapper.UserMapper;
import com.projectmanagement.auth.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserServiceImpl(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @Override
    public UserResponse createUser(CreateUserRequest createUserRequest) {
        User user = new User();
        user.setName(createUserRequest.name());
        User saved = userRepository.save(user);
        
        return userMapper.toResponse(saved);
    }

    @Override
    public UserResponse getUserById(Long id) {
        return userRepository.findById(id)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
    }

    @Override
    public List<UserResponse> getAll() {
        return userRepository.findAll().stream().map(userMapper::toResponse).toList();
    }
}
