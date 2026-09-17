package com.projectmanagement.auth.controller;

import com.projectmanagement.auth.dto.response.JwtResponse;
import com.projectmanagement.auth.dto.request.LoginRequest;
import com.projectmanagement.auth.dto.request.RegisterRequest;
import com.projectmanagement.auth.dto.request.TokenRefreshRequest;
import com.projectmanagement.auth.dto.request.ForgotPasswordRequest;
import com.projectmanagement.auth.dto.request.ResetPasswordRequest;
import com.projectmanagement.auth.dto.response.TokenRefreshResponse;
import com.projectmanagement.auth.exception.TokenRefreshException;
import com.projectmanagement.organization.dto.request.CreateOrganizationRequest;
import com.projectmanagement.user.entity.User;
import com.projectmanagement.auth.entity.RefreshToken;
import com.projectmanagement.user.repository.UserRepository;
import com.projectmanagement.auth.security.JwtUtils;
import com.projectmanagement.user.mapper.UserMapper;
import com.projectmanagement.auth.service.RefreshTokenService;
import com.projectmanagement.auth.service.PasswordResetService;
import com.projectmanagement.organization.dto.response.OrganizationResponse;
import com.projectmanagement.organization.service.OrganizationService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final UserMapper userMapper;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetService passwordResetService;
    private final OrganizationService organizationService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder encoder,
                          JwtUtils jwtUtils,
                          UserMapper userMapper,
                          RefreshTokenService refreshTokenService,
                          PasswordResetService passwordResetService,
                          OrganizationService organizationService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
        this.userMapper = userMapper;
        this.refreshTokenService = refreshTokenService;
        this.passwordResetService = passwordResetService;
        this.organizationService = organizationService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.identifier(), loginRequest.password()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User userDetails = (User) authentication.getPrincipal();
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        List<OrganizationResponse> userOrgs = organizationService.getUserOrganizations(userDetails.getUsername());
        Long currentOrgId = organizationService.getActiveOrganizationId(userDetails.getUsername());

        return ResponseEntity.ok(new JwtResponse(jwt,
                refreshToken.getToken(),
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getFullName(),
                currentOrgId,
                userOrgs));
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.findByName(registerRequest.username()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Username is already taken!");
        }

        if (userRepository.findByEmail(registerRequest.email()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User();
        user.setName(registerRequest.username());
        user.setPassword(encoder.encode(registerRequest.password()));
        user.setEmail(registerRequest.email());
        user.setFullName(registerRequest.fullName());

        User savedUser = userRepository.save(user);

        // If onboarding org details are provided, provision the tenant within the same transaction
        if (registerRequest.organization() != null) {
            RegisterRequest.OrganizationOnboarding org = registerRequest.organization();
            organizationService.createOrganization(
                    new CreateOrganizationRequest(org.name(), org.slug()),
                    savedUser.getName());
        }

        return ResponseEntity.ok(userMapper.toResponse(savedUser));
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.refreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String newAccessToken = jwtUtils.generateTokenFromUsername(user.getUsername());
                    return ResponseEntity.ok(new TokenRefreshResponse(newAccessToken, requestRefreshToken));
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken,
                        "Refresh token is not in database!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        passwordResetService.requestPasswordReset(forgotPasswordRequest.identifier());
        return ResponseEntity.ok("If an account exists for this username or email, "
                + "a password reset link has been sent to its email address.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        passwordResetService.resetPassword(resetPasswordRequest.token(), resetPasswordRequest.newPassword());
        return ResponseEntity.ok("Password has been reset successfully. Please sign in with your new password.");
    }
}
