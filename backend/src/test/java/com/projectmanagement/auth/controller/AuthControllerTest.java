package com.projectmanagement.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectmanagement.auth.dto.request.LoginRequest;
import com.projectmanagement.auth.dto.request.RegisterRequest;
import com.projectmanagement.auth.dto.request.TokenRefreshRequest;
import com.projectmanagement.auth.entity.RefreshToken;
import com.projectmanagement.auth.exception.TokenRefreshException;
import com.projectmanagement.auth.security.JwtUtils;
import com.projectmanagement.auth.service.RefreshTokenService;
import com.projectmanagement.common.exception.GlobalExceptionHandler;
import com.projectmanagement.organization.dto.response.OrganizationResponse;
import com.projectmanagement.organization.service.OrganizationService;
import com.projectmanagement.user.dto.response.UserResponse;
import com.projectmanagement.user.entity.User;
import com.projectmanagement.user.mapper.UserMapper;
import com.projectmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserMapper userMapper;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private OrganizationService organizationService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void register_success() throws Exception {
        RegisterRequest request = new RegisterRequest("alice", "password123");
        User savedUser = new User(1L, "alice", "encodedPassword");
        UserResponse userResponse = new UserResponse(1L, "alice");

        when(userRepository.findByName("alice")).thenReturn(Optional.empty());
        when(encoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(userMapper.toResponse(savedUser)).thenReturn(userResponse);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("alice"));
    }

    @Test
    void register_usernameAlreadyTaken_returns400() throws Exception {
        RegisterRequest request = new RegisterRequest("alice", "password123");
        User existing = new User(1L, "alice", "pass");

        when(userRepository.findByName("alice")).thenReturn(Optional.of(existing));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error: Username is already taken!"));
    }

    @Test
    void register_validationFailure_blankFields_returns400() throws Exception {
        RegisterRequest request = new RegisterRequest("", "");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void login_success() throws Exception {
        LoginRequest request = new LoginRequest("alice", "password123");
        User userDetails = new User(1L, "alice", "encodedPass");
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("mock-refresh-token");
        refreshToken.setUser(userDetails);

        OrganizationResponse orgResponse = new OrganizationResponse(10L, "Acme", "acme", 1L, "alice", Instant.now(), Instant.now());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtUtils.generateJwtToken(auth)).thenReturn("mock-jwt-token");
        when(refreshTokenService.createRefreshToken(1L)).thenReturn(refreshToken);
        when(organizationService.getUserOrganizations("alice")).thenReturn(List.of(orgResponse));
        when(organizationService.getActiveOrganizationId("alice")).thenReturn(10L);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.refreshToken").value("mock-refresh-token"))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("alice"))
                .andExpect(jsonPath("$.currentOrganizationId").value(10))
                .andExpect(jsonPath("$.organizations[0].name").value("Acme"));
    }

    @Test
    void login_badCredentials_returns401() throws Exception {
        LoginRequest request = new LoginRequest("alice", "wrongpass");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void refreshtoken_success() throws Exception {
        TokenRefreshRequest request = new TokenRefreshRequest("valid-refresh-token");
        User user = new User(1L, "alice", "pass");

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("valid-refresh-token");
        refreshToken.setUser(user);

        when(refreshTokenService.findByToken("valid-refresh-token")).thenReturn(Optional.of(refreshToken));
        when(refreshTokenService.verifyExpiration(refreshToken)).thenReturn(refreshToken);
        when(jwtUtils.generateTokenFromUsername("alice")).thenReturn("new-access-token");

        mockMvc.perform(post("/api/v1/auth/refreshtoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access-token"))
                .andExpect(jsonPath("$.refreshToken").value("valid-refresh-token"));
    }

    @Test
    void refreshtoken_tokenExpired_returns403() throws Exception {
        TokenRefreshRequest request = new TokenRefreshRequest("expired-refresh-token");
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("expired-refresh-token");

        when(refreshTokenService.findByToken("expired-refresh-token")).thenReturn(Optional.of(refreshToken));
        when(refreshTokenService.verifyExpiration(refreshToken))
                .thenThrow(new TokenRefreshException("expired-refresh-token", "Refresh token was expired"));

        mockMvc.perform(post("/api/v1/auth/refreshtoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Failed for [expired-refresh-token]: Refresh token was expired"));
    }

    @Test
    void refreshtoken_tokenNotInDb_returns403() throws Exception {
        TokenRefreshRequest request = new TokenRefreshRequest("unknown-refresh-token");

        when(refreshTokenService.findByToken("unknown-refresh-token")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/v1/auth/refreshtoken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Failed for [unknown-refresh-token]: Refresh token is not in database!"));
    }
}
