package com.projectmanagement.auth.service;

import com.projectmanagement.auth.entity.RefreshToken;
import com.projectmanagement.auth.exception.TokenRefreshException;
import com.projectmanagement.auth.repository.RefreshTokenRepository;
import com.projectmanagement.user.entity.User;
import com.projectmanagement.user.exception.UserNotFoundException;
import com.projectmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private User testUser;
    private static final Long DURATION_MS = 604800000L;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenDurationMs", DURATION_MS);
        testUser = new User(1L, "alice", "pass");
    }

    @Test
    void createRefreshToken_newUser_success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(refreshTokenRepository.findByUser(testUser)).thenReturn(Optional.empty());
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));

        RefreshToken token = refreshTokenService.createRefreshToken(1L);

        assertNotNull(token);
        assertEquals(testUser, token.getUser());
        assertNotNull(token.getToken());
        assertTrue(token.getExpiryDate().isAfter(Instant.now()));
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void createRefreshToken_existingUser_reusesAndRefreshesToken() {
        RefreshToken existingToken = new RefreshToken();
        existingToken.setUser(testUser);
        existingToken.setToken("old-token");
        existingToken.setExpiryDate(Instant.now().minusSeconds(100));

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(refreshTokenRepository.findByUser(testUser)).thenReturn(Optional.of(existingToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));

        RefreshToken updatedToken = refreshTokenService.createRefreshToken(1L);

        assertNotNull(updatedToken);
        assertNotEquals("old-token", updatedToken.getToken());
        assertTrue(updatedToken.getExpiryDate().isAfter(Instant.now()));
    }

    @Test
    void createRefreshToken_userNotFound_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> refreshTokenService.createRefreshToken(99L));
    }

    @Test
    void verifyExpiration_validToken_returnsToken() {
        RefreshToken validToken = new RefreshToken();
        validToken.setToken("valid-token");
        validToken.setExpiryDate(Instant.now().plusSeconds(3600));

        RefreshToken result = refreshTokenService.verifyExpiration(validToken);

        assertEquals(validToken, result);
        verify(refreshTokenRepository, never()).delete(any());
    }

    @Test
    void verifyExpiration_expiredToken_deletesAndThrowsException() {
        RefreshToken expiredToken = new RefreshToken();
        expiredToken.setToken("expired-token");
        expiredToken.setExpiryDate(Instant.now().minusSeconds(10));

        TokenRefreshException ex = assertThrows(TokenRefreshException.class, () ->
                refreshTokenService.verifyExpiration(expiredToken));

        assertEquals("Failed for [expired-token]: Refresh token was expired. Please make a new signin request", ex.getMessage());
        verify(refreshTokenRepository).delete(expiredToken);
    }

    @Test
    void findByToken_success() {
        RefreshToken token = new RefreshToken();
        token.setToken("sample-token");
        when(refreshTokenRepository.findByToken("sample-token")).thenReturn(Optional.of(token));

        Optional<RefreshToken> result = refreshTokenService.findByToken("sample-token");

        assertTrue(result.isPresent());
        assertEquals("sample-token", result.get().getToken());
    }

    @Test
    void revokeToken_existingToken_deletes() {
        RefreshToken token = new RefreshToken();
        token.setToken("to-revoke");
        when(refreshTokenRepository.findByToken("to-revoke")).thenReturn(Optional.of(token));

        refreshTokenService.revokeToken("to-revoke");

        verify(refreshTokenRepository).delete(token);
    }

    @Test
    void revokeToken_unknownToken_noOp() {
        when(refreshTokenRepository.findByToken("missing")).thenReturn(Optional.empty());

        refreshTokenService.revokeToken("missing");

        verify(refreshTokenRepository, never()).delete(any());
    }

    @Test
    void deleteByUserId_success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(refreshTokenRepository.deleteByUser(testUser)).thenReturn(1);

        int count = refreshTokenService.deleteByUserId(1L);

        assertEquals(1, count);
        verify(refreshTokenRepository).deleteByUser(testUser);
    }

    @Test
    void deleteByUserId_userNotFound_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> refreshTokenService.deleteByUserId(99L));
    }
}
