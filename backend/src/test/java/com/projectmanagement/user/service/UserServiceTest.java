package com.projectmanagement.user.service;

import com.projectmanagement.user.dto.request.CreateUserRequest;
import com.projectmanagement.user.dto.response.UserResponse;
import com.projectmanagement.user.entity.User;
import com.projectmanagement.user.exception.UserNotFoundException;
import com.projectmanagement.user.mapper.UserMapper;
import com.projectmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        user = new User(1L, "alice", "pass");
        userResponse = new UserResponse(1L, "alice");
    }

    @Test
    void createUser_success() {
        CreateUserRequest request = new CreateUserRequest("alice");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userMapper.toResponse(user)).thenReturn(userResponse);

        UserResponse result = userService.createUser(request);

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("alice", result.name());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void getUserById_found_returnsUserResponse() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.toResponse(user)).thenReturn(userResponse);

        UserResponse result = userService.getUserById(1L);

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("alice", result.name());
    }

    @Test
    void getUserById_notFound_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.getUserById(99L));
    }

    @Test
    void getAll_returnsList() {
        User user2 = new User(2L, "bob", "pass2");
        UserResponse response2 = new UserResponse(2L, "bob");

        when(userRepository.findAll()).thenReturn(List.of(user, user2));
        when(userMapper.toResponse(user)).thenReturn(userResponse);
        when(userMapper.toResponse(user2)).thenReturn(response2);

        List<UserResponse> list = userService.getAll();

        assertEquals(2, list.size());
        assertEquals("alice", list.get(0).name());
        assertEquals("bob", list.get(1).name());
    }
}
