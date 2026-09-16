package com.projectmanagement.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectmanagement.common.exception.GlobalExceptionHandler;
import com.projectmanagement.user.dto.request.CreateUserRequest;
import com.projectmanagement.user.dto.response.UserResponse;
import com.projectmanagement.user.exception.UserNotFoundException;
import com.projectmanagement.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void create_success() throws Exception {
        CreateUserRequest request = new CreateUserRequest("alice", "alice@example.com", "Alice Vance");
        UserResponse response = new UserResponse(1L, "alice", "alice@example.com", "Alice Vance");

        when(userService.createUser(any(CreateUserRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("alice"))
                .andExpect(jsonPath("$.email").value("alice@example.com"))
                .andExpect(jsonPath("$.fullName").value("Alice Vance"));
    }

    @Test
    void create_blankFields_returns400() throws Exception {
        CreateUserRequest request = new CreateUserRequest("", "", "");

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void getById_success() throws Exception {
        UserResponse response = new UserResponse(1L, "alice", "alice@example.com", "Alice Vance");
        when(userService.getUserById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("alice"));
    }

    @Test
    void getById_notFound_returns404() throws Exception {
        when(userService.getUserById(99L)).thenThrow(new UserNotFoundException("User not found with ID: 99"));

        mockMvc.perform(get("/api/v1/users/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("User not found with ID: 99"));
    }

    @Test
    void getAll_success() throws Exception {
        List<UserResponse> list = List.of(
                new UserResponse(1L, "alice", "alice@example.com", "Alice Vance"),
                new UserResponse(2L, "bob", "bob@example.com", "Bob Stone"));
        when(userService.getAll()).thenReturn(list);

        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("alice"))
                .andExpect(jsonPath("$[1].name").value("bob"));
    }
}
