package com.projectmanagement.auth.security;

import com.projectmanagement.user.entity.User;
import com.projectmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void loadUserByUsername_userExists_returnsUserDetails() {
        User user = new User(1L, "alice", "encodedPass");
        when(userRepository.findByName("alice")).thenReturn(Optional.of(user));

        UserDetails userDetails = userDetailsService.loadUserByUsername("alice");

        assertNotNull(userDetails);
        assertEquals("alice", userDetails.getUsername());
        assertEquals("encodedPass", userDetails.getPassword());
    }

    @Test
    void loadUserByEmail_emailExists_returnsUserDetails() {
        User user = new User(1L, "alice", "encodedPass");
        when(userRepository.findByName("alice@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));

        UserDetails userDetails = userDetailsService.loadUserByUsername("alice@example.com");

        assertNotNull(userDetails);
        assertEquals("alice", userDetails.getUsername());
        assertEquals("encodedPass", userDetails.getPassword());
    }

    @Test
    void loadUserByUsername_userNotFound_throwsException() {
        when(userRepository.findByName("unknown")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("unknown")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () ->
                userDetailsService.loadUserByUsername("unknown"));
    }
}
