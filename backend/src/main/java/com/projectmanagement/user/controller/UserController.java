package com.projectmanagement.user.controller;

import com.projectmanagement.user.dto.request.CreateUserRequest;
import com.projectmanagement.user.dto.response.UserResponse;
import com.projectmanagement.user.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest createUserRequest) {
        UserResponse createdUser = userService.createUser(createUserRequest);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable("id") Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll() {
        List<UserResponse> users = userService.getAll();
        return ResponseEntity.ok(users);
    }
}
