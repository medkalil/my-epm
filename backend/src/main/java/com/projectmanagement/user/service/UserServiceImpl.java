package com.projectmanagement.user.service;

import com.projectmanagement.user.service.UserService;
import com.projectmanagement.user.entity.User;
import com.projectmanagement.user.dto.request.CreateUserRequest;
import com.projectmanagement.user.dto.response.UserResponse;
import com.projectmanagement.user.exception.UserNotFoundException;
import com.projectmanagement.user.mapper.UserMapper;
import com.projectmanagement.user.repository.UserRepository;
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
        user.setEmail(createUserRequest.email());
        user.setFullName(createUserRequest.fullName());
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
