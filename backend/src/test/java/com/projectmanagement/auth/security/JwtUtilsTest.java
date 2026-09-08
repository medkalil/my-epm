package com.projectmanagement.auth.security;

import com.projectmanagement.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    private JwtUtils jwtUtils;
    // Valid Base64 encoded 256-bit key
    private static final String TEST_SECRET = "c2VjcmV0S2V5Rm9ySldUVG9rZW5zQW5kVGhpcyBpcyBhIHZlcnkgc3Ryb25nIGFuZCBzZWN1cmUgZm9yIHByb2R1Y3Rpb24=";
    private static final int TEST_EXPIRATION_MS = 60000; // 1 minute

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", TEST_EXPIRATION_MS);
    }

    @Test
    void generateJwtToken_fromAuthentication_success() {
        User user = new User(1L, "alice", "pass");
        Authentication auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

        String token = jwtUtils.generateJwtToken(auth);

        assertNotNull(token);
        assertTrue(jwtUtils.validateJwtToken(token));
        assertEquals("alice", jwtUtils.getUserNameFromJwtToken(token));
    }

    @Test
    void generateTokenFromUsername_success() {
        String token = jwtUtils.generateTokenFromUsername("bob");

        assertNotNull(token);
        assertTrue(jwtUtils.validateJwtToken(token));
        assertEquals("bob", jwtUtils.getUserNameFromJwtToken(token));
    }

    @Test
    void validateJwtToken_withExpiredToken_returnsFalse() {
        // Set expiration to negative milliseconds (already expired)
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", -1000);
        String expiredToken = jwtUtils.generateTokenFromUsername("charlie");

        MockHttpServletRequest request = new MockHttpServletRequest();
        boolean isValid = jwtUtils.validateJwtToken(expiredToken, request);

        assertFalse(isValid);
        assertEquals("JWT token is expired", request.getAttribute("authError"));
    }

    @Test
    void validateJwtToken_withMalformedToken_returnsFalse() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        boolean isValid = jwtUtils.validateJwtToken("invalid.token.structure", request);

        assertFalse(isValid);
        assertEquals("Invalid JWT signature or token format", request.getAttribute("authError"));
    }

    @Test
    void validateJwtToken_withEmptyToken_returnsFalse() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        boolean isValid = jwtUtils.validateJwtToken("", request);

        assertFalse(isValid);
        assertEquals("JWT claims string is empty", request.getAttribute("authError"));
    }

    @Test
    void parseJwt_withValidBearerHeader_returnsToken() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer sample.jwt.token");

        String parsedToken = jwtUtils.parseJwt(request);

        assertEquals("sample.jwt.token", parsedToken);
    }

    @Test
    void parseJwt_withMissingOrNonBearerHeader_returnsNull() {
        MockHttpServletRequest requestNoHeader = new MockHttpServletRequest();
        assertNull(jwtUtils.parseJwt(requestNoHeader));

        MockHttpServletRequest requestBasicAuth = new MockHttpServletRequest();
        requestBasicAuth.addHeader("Authorization", "Basic dXNlcjpwYXNz");
        assertNull(jwtUtils.parseJwt(requestBasicAuth));
    }
}
