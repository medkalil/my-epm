package com.projectmanagement.organization.service;

import com.projectmanagement.organization.dto.response.JoinRequestResponse;
import com.projectmanagement.organization.entity.JoinRequestStatus;
import com.projectmanagement.organization.entity.Organization;
import com.projectmanagement.organization.entity.OrganizationJoinRequest;
import com.projectmanagement.organization.exception.JoinRequestAlreadyReviewedException;
import com.projectmanagement.organization.exception.JoinRequestConflictException;
import com.projectmanagement.organization.exception.OrganizationNotFoundException;
import com.projectmanagement.organization.mapper.JoinRequestMapper;
import com.projectmanagement.organization.repository.JoinRequestRepository;
import com.projectmanagement.organization.repository.OrganizationMemberRepository;
import com.projectmanagement.organization.repository.OrganizationRepository;
import com.projectmanagement.user.entity.User;
import com.projectmanagement.user.exception.UserNotFoundException;
import com.projectmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JoinRequestServiceTest {

    @Mock
    private JoinRequestRepository joinRequestRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private OrganizationMemberRepository memberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JoinRequestMapper joinRequestMapper;

    @InjectMocks
    private JoinRequestServiceImpl joinRequestService;

    private Organization organization;
    private User user;
    private OrganizationJoinRequest request;

    @BeforeEach
    void setUp() {
        organization = new Organization();
        organization.setId(1L);
        organization.setName("Acme Corp");
        organization.setSlug("acme-corp");

        user = new User(10L, "alice", "pass", "alice@example.com", "Alice Vance");

        request = new OrganizationJoinRequest(organization, user);
        request.setId(100L);
        request.setRequestedAt(Instant.now());
    }

    @Test
    void createForRegister_success() {
        when(organizationRepository.findBySlug("acme-corp")).thenReturn(Optional.of(organization));
        when(userRepository.findByName("alice")).thenReturn(Optional.of(user));
        when(memberRepository.existsByOrganizationAndUser(organization, user)).thenReturn(false);
        when(joinRequestRepository.existsByOrganizationAndUserAndStatus(organization, user, JoinRequestStatus.PENDING))
                .thenReturn(false);
        when(joinRequestRepository.save(any(OrganizationJoinRequest.class))).thenReturn(request);
        when(joinRequestMapper.toResponse(request)).thenReturn(new JoinRequestResponse(
                100L, 1L, "Acme Corp", "acme-corp", 10L, "alice", "alice@example.com",
                JoinRequestStatus.PENDING, request.getRequestedAt(), null, null, null));

        var result = joinRequestService.createForRegister("acme-corp", "alice");

        assertNotNull(result);
        assertEquals(JoinRequestStatus.PENDING, result.status());
        verify(joinRequestRepository).save(any(OrganizationJoinRequest.class));
    }

    @Test
    void createForRegister_orgNotFound_throws() {
        when(organizationRepository.findBySlug("unknown")).thenReturn(Optional.empty());

        assertThrows(OrganizationNotFoundException.class, () -> joinRequestService.createForRegister("unknown", "alice"));
    }

    @Test
    void createForRegister_userNotFound_throws() {
        when(organizationRepository.findBySlug("acme-corp")).thenReturn(Optional.of(organization));
        when(userRepository.findByName("alice")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> joinRequestService.createForRegister("acme-corp", "alice"));
    }

    @Test
    void createForRegister_alreadyMember_throws() {
        when(organizationRepository.findBySlug("acme-corp")).thenReturn(Optional.of(organization));
        when(userRepository.findByName("alice")).thenReturn(Optional.of(user));
        when(memberRepository.existsByOrganizationAndUser(organization, user)).thenReturn(true);

        assertThrows(JoinRequestConflictException.class, () -> joinRequestService.createForRegister("acme-corp", "alice"));
    }

    @Test
    void createForRegister_duplicatePending_throws() {
        when(organizationRepository.findBySlug("acme-corp")).thenReturn(Optional.of(organization));
        when(userRepository.findByName("alice")).thenReturn(Optional.of(user));
        when(memberRepository.existsByOrganizationAndUser(organization, user)).thenReturn(false);
        when(joinRequestRepository.existsByOrganizationAndUserAndStatus(organization, user, JoinRequestStatus.PENDING))
                .thenReturn(true);

        assertThrows(JoinRequestConflictException.class, () -> joinRequestService.createForRegister("acme-corp", "alice"));
    }

    @Test
    void listByOrganization_success() {
        when(organizationRepository.findById(1L)).thenReturn(Optional.of(organization));
        when(joinRequestRepository.findByOrganizationOrderByRequestedAtDesc(organization)).thenReturn(List.of(request));
        when(joinRequestMapper.toResponse(request)).thenReturn(new JoinRequestResponse(
                100L, 1L, "Acme Corp", "acme-corp", 10L, "alice", "alice@example.com",
                JoinRequestStatus.PENDING, request.getRequestedAt(), null, null, null));

        var result = joinRequestService.listByOrganization(1L, null);

        assertEquals(1, result.size());
        verify(joinRequestRepository).findByOrganizationOrderByRequestedAtDesc(organization);
    }

    @Test
    void listByOrganization_filteredByStatus() {
        when(organizationRepository.findById(1L)).thenReturn(Optional.of(organization));
        when(joinRequestRepository.findByOrganizationAndStatusOrderByRequestedAtDesc(organization, JoinRequestStatus.PENDING))
                .thenReturn(List.of(request));

        joinRequestService.listByOrganization(1L, JoinRequestStatus.PENDING);

        verify(joinRequestRepository).findByOrganizationAndStatusOrderByRequestedAtDesc(organization, JoinRequestStatus.PENDING);
    }

    @Test
    void approve_success_createsMember() {
        when(joinRequestRepository.findByOrganization_IdAndId(1L, 100L)).thenReturn(Optional.of(request));
        when(memberRepository.existsByOrganizationAndUser(organization, user)).thenReturn(false);
        when(userRepository.findById(20L)).thenReturn(Optional.of(new User(20L, "bob", "pass")));
        when(memberRepository.findByUserAndActiveTrue(user)).thenReturn(Optional.empty());
        when(joinRequestRepository.save(request)).thenReturn(request);
        when(joinRequestMapper.toResponse(request)).thenReturn(new JoinRequestResponse(
                100L, 1L, "Acme Corp", "acme-corp", 10L, "alice", "alice@example.com",
                JoinRequestStatus.APPROVED, request.getRequestedAt(), Instant.now(), 20L, "bob"));

        var result = joinRequestService.approve(1L, 100L, 20L);

        assertEquals(JoinRequestStatus.APPROVED, result.status());
        verify(memberRepository).save(any());
    }

    @Test
    void approve_existingMember_throws() {
        when(joinRequestRepository.findByOrganization_IdAndId(1L, 100L)).thenReturn(Optional.of(request));
        when(memberRepository.existsByOrganizationAndUser(organization, user)).thenReturn(true);

        JoinRequestConflictException ex = assertThrows(JoinRequestConflictException.class,
                () -> joinRequestService.approve(1L, 100L, 20L));
        assertTrue(ex.getMessage().contains("already a member"));
    }

    @Test
    void reject_success() {
        when(joinRequestRepository.findByOrganization_IdAndId(1L, 100L)).thenReturn(Optional.of(request));
        when(userRepository.findById(20L)).thenReturn(Optional.of(new User(20L, "bob", "pass")));
        when(joinRequestRepository.save(request)).thenReturn(request);
        when(joinRequestMapper.toResponse(request)).thenReturn(new JoinRequestResponse(
                100L, 1L, "Acme Corp", "acme-corp", 10L, "alice", "alice@example.com",
                JoinRequestStatus.REJECTED, request.getRequestedAt(), Instant.now(), 20L, "bob"));

        var result = joinRequestService.reject(1L, 100L, 20L);

        assertEquals(JoinRequestStatus.REJECTED, result.status());
        verify(memberRepository, never()).save(any());
    }

    @Test
    void review_alreadyReviewed_throws() {
        request.setStatus(JoinRequestStatus.APPROVED);
        when(joinRequestRepository.findByOrganization_IdAndId(1L, 100L)).thenReturn(Optional.of(request));

        assertThrows(JoinRequestAlreadyReviewedException.class, () -> joinRequestService.approve(1L, 100L, 20L));
    }

    @Test
    void review_notFound_throws() {
        when(joinRequestRepository.findByOrganization_IdAndId(1L, 999L)).thenReturn(Optional.empty());

        assertThrows(com.projectmanagement.organization.exception.OrganizationJoinRequestNotFoundException.class,
                () -> joinRequestService.approve(1L, 999L, 20L));
    }

    @Test
    void findBlockingRequest_returnsPendingOrRejected() {
        when(joinRequestRepository.findFirstByUser_NameAndStatusInOrderByRequestedAtAsc(
                "alice", List.of(JoinRequestStatus.PENDING, JoinRequestStatus.REJECTED)))
                .thenReturn(Optional.of(request));

        var result = joinRequestService.findBlockingRequest("alice");

        assertTrue(result.isPresent());
        assertEquals(request, result.get());
    }
}