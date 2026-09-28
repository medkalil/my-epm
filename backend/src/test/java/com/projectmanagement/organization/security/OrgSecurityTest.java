package com.projectmanagement.organization.security;

import com.projectmanagement.organization.repository.OrganizationMemberRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrgSecurityTest {

    private static final Long ORG_ID = 42L;
    private static final String USERNAME = "alice";

    @Mock
    private OrganizationMemberRepository memberRepository;

    private OrgSecurity orgSecurity;

    @BeforeEach
    void setUp() {
        orgSecurity = new OrgSecurity(memberRepository);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(USERNAME, "", List.of()));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void isMember_anyRole_returnsTrue() {
        when(memberRepository.existsByOrganization_IdAndUser_Name(ORG_ID, USERNAME)).thenReturn(true);
        assertTrue(orgSecurity.isMember(ORG_ID));
    }

    @Test
    void isMember_notMember_returnsFalse() {
        when(memberRepository.existsByOrganization_IdAndUser_Name(ORG_ID, USERNAME)).thenReturn(false);
        assertFalse(orgSecurity.isMember(ORG_ID));
    }

    @Test
    void isMember_noAuthentication_returnsFalse() {
        SecurityContextHolder.clearContext();
        assertFalse(orgSecurity.isMember(ORG_ID));
    }

    @Test
    void isMember_nullOrgId_returnsFalse() {
        assertFalse(orgSecurity.isMember(null));
    }

    @Test
    void isEditor_ownerAdminMember_returnsTrue() {
        when(memberRepository.existsByOrganization_IdAndUser_NameAndRoleIn(eq(ORG_ID), eq(USERNAME), anyList()))
                .thenReturn(true);
        assertTrue(orgSecurity.isEditor(ORG_ID));
    }

    @Test
    void isEditor_guest_returnsFalse() {
        assertFalse(orgSecurity.isEditor(ORG_ID));
    }

    @Test
    void isEditor_noAuthentication_returnsFalse() {
        SecurityContextHolder.clearContext();
        assertFalse(orgSecurity.isEditor(ORG_ID));
    }

    @Test
    void hasRole_matchingRole_returnsTrue() {
        when(memberRepository.existsByOrganization_IdAndUser_NameAndRoleIn(eq(ORG_ID), eq(USERNAME), anyList()))
                .thenReturn(true);
        assertTrue(orgSecurity.hasRole(ORG_ID, "OWNER", "ADMIN"));
    }

    @Test
    void hasRole_noMatchingRole_returnsFalse() {
        assertFalse(orgSecurity.hasRole(ORG_ID, "OWNER", "ADMIN"));
    }

    @Test
    void hasRole_nullOrgId_returnsFalse() {
        assertFalse(orgSecurity.hasRole(null, "OWNER"));
    }
}