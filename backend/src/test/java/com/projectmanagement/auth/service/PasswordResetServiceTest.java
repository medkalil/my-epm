package com.projectmanagement.auth.service;

import com.projectmanagement.auth.entity.PasswordResetToken;
import com.projectmanagement.auth.exception.InvalidPasswordResetTokenException;
import com.projectmanagement.auth.repository.PasswordResetTokenRepository;
import com.projectmanagement.mail.MailService;
import com.projectmanagement.user.entity.User;
import com.projectmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private MailService mailService;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private User testUser;
    private static final Long EXPIRATION_MS = 1800000L;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(passwordResetService, "passwordResetExpirationMs", EXPIRATION_MS);
        ReflectionTestUtils.setField(passwordResetService, "frontendUrl", "http://localhost:5173");
        testUser = new User(1L, "alice", "pass", "alice@example.com", "Alice Vance");
    }

    @Test
    void requestPasswordReset_existingUser_savesTokenAndSendsEmail() {
        when(userRepository.findByName("alice")).thenReturn(Optional.of(testUser));
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(i -> i.getArgument(0));

        passwordResetService.requestPasswordReset("alice");

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(tokenCaptor.capture());

        PasswordResetToken saved = tokenCaptor.getValue();
        assertEquals(testUser, saved.getUser());
        assertNotNull(saved.getToken());
        assertTrue(saved.getExpiryDate().isAfter(Instant.now()));
        assertFalse(saved.isUsed());

        String resetLink = "http://localhost:5173/reset-password?token=" + saved.getToken();
        verify(mailService).sendPasswordResetEmail("alice@example.com", "Alice Vance", resetLink);
    }

    @Test
    void requestPasswordReset_unknownIdentifier_sendsNoEmail() {
        when(userRepository.findByName("nobody")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("nobody")).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> passwordResetService.requestPasswordReset("nobody"));

        verify(passwordResetTokenRepository, never()).save(any(PasswordResetToken.class));
        verify(mailService, never()).sendPasswordResetEmail(anyString(), anyString(), anyString());
    }

    @Test
    void requestPasswordReset_deletesPreviousTokens() {
        when(userRepository.findByName("alice")).thenReturn(Optional.of(testUser));
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(i -> i.getArgument(0));

        passwordResetService.requestPasswordReset("alice");

        verify(passwordResetTokenRepository).deleteByUser(testUser);
    }

    @Test
    void resetPassword_validToken_updatesPasswordAndInvalidatesRefreshTokens() {
        PasswordResetToken token = new PasswordResetToken(testUser, "reset-token-123",
                Instant.now().plusMillis(100000));
        when(passwordResetTokenRepository.findByToken("reset-token-123")).thenReturn(Optional.of(token));
        when(encoder.encode("newPassword1")).thenReturn("encodedNewPassword");

        passwordResetService.resetPassword("reset-token-123", "newPassword1");

        assertEquals("encodedNewPassword", testUser.getPassword());
        assertNotNull(token.getUsedAt());
        verify(userRepository).save(testUser);
        verify(refreshTokenService).deleteByUserId(1L);
    }

    @Test
    void resetPassword_invalidToken_throws() {
        when(passwordResetTokenRepository.findByToken("unknown")).thenReturn(Optional.empty());

        assertThrows(InvalidPasswordResetTokenException.class,
                () -> passwordResetService.resetPassword("unknown", "newPassword1"));
    }

    @Test
    void resetPassword_usedToken_throws() {
        PasswordResetToken token = new PasswordResetToken(testUser, "used-token",
                Instant.now().plusMillis(100000));
        token.setUsedAt(Instant.now().minusSeconds(10));
        when(passwordResetTokenRepository.findByToken("used-token")).thenReturn(Optional.of(token));

        assertThrows(InvalidPasswordResetTokenException.class,
                () -> passwordResetService.resetPassword("used-token", "newPassword1"));
    }

    @Test
    void resetPassword_expiredToken_throws() {
        PasswordResetToken token = new PasswordResetToken(testUser, "expired-token",
                Instant.now().minusSeconds(10));
        when(passwordResetTokenRepository.findByToken("expired-token")).thenReturn(Optional.of(token));

        assertThrows(InvalidPasswordResetTokenException.class,
                () -> passwordResetService.resetPassword("expired-token", "newPassword1"));
    }
}