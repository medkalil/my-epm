package com.projectmanagement.auth.service;

import com.projectmanagement.auth.entity.PasswordResetToken;
import com.projectmanagement.auth.exception.InvalidPasswordResetTokenException;
import com.projectmanagement.auth.repository.PasswordResetTokenRepository;
import com.projectmanagement.mail.MailService;
import com.projectmanagement.user.entity.User;
import com.projectmanagement.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder encoder;
    private final MailService mailService;

    @Value("${epm.app.passwordResetExpirationMs}")
    private Long passwordResetExpirationMs;

    @Value("${epm.app.frontendUrl}")
    private String frontendUrl;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository passwordResetTokenRepository,
                                RefreshTokenService refreshTokenService,
                                PasswordEncoder encoder,
                                MailService mailService) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.refreshTokenService = refreshTokenService;
        this.encoder = encoder;
        this.mailService = mailService;
    }

    private Optional<User> findByUsernameOrEmail(String identifier) {
        return userRepository.findByName(identifier)
                .or(() -> userRepository.findByEmail(identifier));
    }

    @Transactional
    public void requestPasswordReset(String identifier) {
        Optional<User> userOpt = findByUsernameOrEmail(identifier);

        // Do not reveal whether the account exists
        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();

        // Only one active reset token per user
        passwordResetTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plusMillis(passwordResetExpirationMs);

        PasswordResetToken resetToken = new PasswordResetToken(user, token, expiryDate);
        passwordResetTokenRepository.save(resetToken);

        String resetLink = frontendUrl + "/reset-password?token=" + token;

        try {
            mailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink);
        } catch (Exception ex) {
            log.error("Failed to send password reset email to user {}", user.getEmail(), ex);
        }
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidPasswordResetTokenException(
                        "Password reset token is invalid or has expired"));

        if (resetToken.isUsed()) {
            throw new InvalidPasswordResetTokenException(
                    "Password reset token has already been used");
        }

        if (resetToken.isExpired()) {
            throw new InvalidPasswordResetTokenException(
                    "Password reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsedAt(Instant.now());

        // Invalidate all existing sessions/refresh tokens for the user
        refreshTokenService.deleteByUserId(user.getId());
    }
}