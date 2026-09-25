package com.projectmanagement.organization.service;

import com.projectmanagement.mail.MailService;
import com.projectmanagement.organization.dto.request.InviteMemberRequest;
import com.projectmanagement.organization.dto.response.OrganizationMemberResponse;
import com.projectmanagement.organization.entity.Organization;
import com.projectmanagement.organization.entity.OrganizationMember;
import com.projectmanagement.organization.entity.OrganizationRole;
import com.projectmanagement.organization.exception.OrganizationNotFoundException;
import com.projectmanagement.organization.mapper.OrganizationMemberMapper;
import com.projectmanagement.organization.repository.OrganizationMemberRepository;
import com.projectmanagement.organization.repository.OrganizationRepository;
import com.projectmanagement.user.dto.response.UserSummary;
import com.projectmanagement.user.entity.User;
import com.projectmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InviteMemberServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private OrganizationMemberRepository memberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.projectmanagement.organization.mapper.OrganizationMapper organizationMapper;

    @Mock
    private OrganizationMemberMapper organizationMemberMapper;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private MailService mailService;

    private OrganizationServiceImpl service() {
        return new OrganizationServiceImpl(
                organizationRepository, memberRepository, userRepository,
                organizationMapper, organizationMemberMapper, encoder, mailService);
    }

    private Organization org() {
        Organization org = new Organization("Acme Corp", "acme-corp", null);
        org.setId(10L);
        return org;
    }

    private OrganizationMemberResponse memberResponse() {
        return new OrganizationMemberResponse(
                9L, 10L, 3L,
                new UserSummary(3L, "jane.doe", "jane.doe@example.com"),
                OrganizationRole.MEMBER, true, Instant.now());
    }

    private InviteMemberRequest request() {
        return new InviteMemberRequest("Jane Doe", "jane.doe@example.com", OrganizationRole.MEMBER);
    }

    @Test
    void inviteUser_createsUser_addsMember_sendsEmail() {
        User inviter = new User(2L, "bob", "pass", "bob@example.com", "Bob Vance");
        OrganizationMemberResponse expected = memberResponse();

        when(organizationRepository.findById(10L)).thenReturn(Optional.of(org()));
        when(userRepository.findByEmail("jane.doe@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByName("bob")).thenReturn(Optional.of(inviter));
        when(userRepository.findByName("jane.doe")).thenReturn(Optional.empty());
        when(encoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(3L);
            return u;
        });
        when(memberRepository.findByUserAndActiveTrue(any(User.class))).thenReturn(Optional.empty());
        when(memberRepository.save(any(OrganizationMember.class))).thenAnswer(invocation -> {
            OrganizationMember m = invocation.getArgument(0);
            m.setId(9L);
            return m;
        });
        when(organizationMemberMapper.toResponse(any(OrganizationMember.class))).thenReturn(expected);

        OrganizationServiceImpl svc = service();
        OrganizationMemberResponse result = svc.inviteUser(10L, request(), "bob");

        ArgumentCaptor<String> passwordCaptor = ArgumentCaptor.forClass(String.class);
        verify(encoder).encode(passwordCaptor.capture());
        String temporaryPassword = passwordCaptor.getValue();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertEquals("jane.doe", saved.getName());
        assertEquals("jane.doe@example.com", saved.getEmail());
        assertEquals("Jane Doe", saved.getFullName());
        assertTrue(saved.isMustChangePassword());
        assertEquals(temporaryPassword.length(), 12);

        verify(mailService).sendInvitationEmail(
                "jane.doe@example.com", "Jane Doe", "jane.doe", temporaryPassword, "Acme Corp", "Bob Vance");

        assertEquals("encoded", saved.getPassword());
        assertSame(result, expected);

        ArgumentCaptor<OrganizationMember> memberCaptor = ArgumentCaptor.forClass(OrganizationMember.class);
        verify(memberRepository).save(memberCaptor.capture());
        assertTrue(memberCaptor.getValue().isActive());
        assertEquals(OrganizationRole.MEMBER, memberCaptor.getValue().getRole());
    }

    @Test
    void inviteUser_ownerRole_throws() {
        OrganizationServiceImpl svc = service();
        InviteMemberRequest ownerRequest =
                new InviteMemberRequest("Jane Doe", "jane.doe@example.com", OrganizationRole.OWNER);

        when(organizationRepository.findById(10L)).thenReturn(Optional.of(org()));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> svc.inviteUser(10L, ownerRequest, "bob"));
        assertTrue(ex.getMessage().contains("OWNER"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void inviteUser_emailAlreadyRegistered_throws() {
        User existing = new User(5L, "jane.doe", "pass", "jane.doe@example.com", "Jane Doe");

        when(organizationRepository.findById(10L)).thenReturn(Optional.of(org()));
        when(userRepository.findByEmail("jane.doe@example.com")).thenReturn(Optional.of(existing));

        OrganizationServiceImpl svc = service();
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> svc.inviteUser(10L, request(), "bob"));
        assertTrue(ex.getMessage().contains("already registered"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void inviteUser_organizationNotFound_throws() {
        when(organizationRepository.findById(10L)).thenReturn(Optional.empty());

        OrganizationServiceImpl svc = service();
        assertThrows(OrganizationNotFoundException.class, () -> svc.inviteUser(10L, request(), "bob"));
    }

    @Test
    void inviteUser_mailFailure_stillReturnsResponse() {
        User inviter = new User(2L, "bob", "pass", "bob@example.com", "Bob Vance");
        OrganizationMemberResponse expected = memberResponse();

        when(organizationRepository.findById(10L)).thenReturn(Optional.of(org()));
        when(userRepository.findByEmail("jane.doe@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByName("bob")).thenReturn(Optional.of(inviter));
        when(userRepository.findByName("jane.doe")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(3L);
            return u;
        });
        when(memberRepository.findByUserAndActiveTrue(any(User.class))).thenReturn(Optional.empty());
        when(memberRepository.save(any(OrganizationMember.class))).thenAnswer(invocation -> {
            OrganizationMember m = invocation.getArgument(0);
            m.setId(9L);
            return m;
        });
        when(organizationMemberMapper.toResponse(any(OrganizationMember.class))).thenReturn(expected);
        doThrow(new RuntimeException("smtp down"))
                .when(mailService).sendInvitationEmail(anyString(), anyString(), anyString(), anyString(), anyString(), anyString());

        OrganizationServiceImpl svc = service();
        OrganizationMemberResponse result = svc.inviteUser(10L, request(), "bob");

        assertSame(result, expected);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void inviteUser_usernameCollision_appendsSuffix() {
        User inviter = new User(2L, "bob", "pass", "bob@example.com", "Bob Vance");
        User existing = new User(7L, "jane.doe", "pass", "jane.doe@old.com", "Jane Doe");

        when(organizationRepository.findById(10L)).thenReturn(Optional.of(org()));
        when(userRepository.findByEmail("jane.doe@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByName("bob")).thenReturn(Optional.of(inviter));
        when(userRepository.findByName("jane.doe")).thenReturn(Optional.of(existing));
        when(userRepository.findByName("jane.doe-2")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(3L);
            return u;
        });
        when(memberRepository.findByUserAndActiveTrue(any(User.class))).thenReturn(Optional.empty());
        when(memberRepository.save(any(OrganizationMember.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(organizationMemberMapper.toResponse(any(OrganizationMember.class))).thenReturn(memberResponse());

        OrganizationServiceImpl svc = service();
        svc.inviteUser(10L, request(), "bob");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals("jane.doe-2", userCaptor.getValue().getName());
    }
}