package com.projectmanagement.organization.service;

import com.projectmanagement.organization.dto.response.JoinRequestResponse;
import com.projectmanagement.organization.entity.JoinRequestStatus;
import com.projectmanagement.organization.entity.Organization;
import com.projectmanagement.organization.entity.OrganizationJoinRequest;
import com.projectmanagement.organization.entity.OrganizationMember;
import com.projectmanagement.organization.entity.OrganizationRole;
import com.projectmanagement.organization.exception.JoinRequestAlreadyReviewedException;
import com.projectmanagement.organization.exception.JoinRequestConflictException;
import com.projectmanagement.organization.exception.OrganizationJoinRequestNotFoundException;
import com.projectmanagement.organization.exception.OrganizationNotFoundException;
import com.projectmanagement.organization.mapper.JoinRequestMapper;
import com.projectmanagement.organization.repository.JoinRequestRepository;
import com.projectmanagement.organization.repository.OrganizationMemberRepository;
import com.projectmanagement.organization.repository.OrganizationRepository;
import com.projectmanagement.user.entity.User;
import com.projectmanagement.user.exception.UserNotFoundException;
import com.projectmanagement.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class JoinRequestServiceImpl implements JoinRequestService {

    private final JoinRequestRepository joinRequestRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final JoinRequestMapper joinRequestMapper;

    public JoinRequestServiceImpl(JoinRequestRepository joinRequestRepository,
                                  OrganizationRepository organizationRepository,
                                  OrganizationMemberRepository memberRepository,
                                  UserRepository userRepository,
                                  JoinRequestMapper joinRequestMapper) {
        this.joinRequestRepository = joinRequestRepository;
        this.organizationRepository = organizationRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.joinRequestMapper = joinRequestMapper;
    }

    @Override
    @Transactional
    public JoinRequestResponse createForRegister(String slug, String username) {
        Organization org = organizationRepository.findBySlug(slug)
                .orElseThrow(() -> new OrganizationNotFoundException("Organization not found with slug: " + slug));

        User user = userRepository.findByName(username)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));

        if (memberRepository.existsByOrganizationAndUser(org, user)) {
            throw new JoinRequestConflictException("You are already a member of this organization");
        }

        if (joinRequestRepository.existsByOrganizationAndUserAndStatus(org, user, JoinRequestStatus.PENDING)) {
            throw new JoinRequestConflictException("You already have a pending request to join this organization");
        }

        OrganizationJoinRequest saved = joinRequestRepository.save(new OrganizationJoinRequest(org, user));
        return joinRequestMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JoinRequestResponse> listByOrganization(Long organizationId, JoinRequestStatus status) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException("Organization not found with ID: " + organizationId));

        List<OrganizationJoinRequest> requests = status == null
                ? joinRequestRepository.findByOrganizationOrderByRequestedAtDesc(org)
                : joinRequestRepository.findByOrganizationAndStatusOrderByRequestedAtDesc(org, status);

        return requests.stream().map(joinRequestMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public JoinRequestResponse approve(Long organizationId, Long requestId, Long reviewerId) {
        OrganizationJoinRequest request = findPendingRequest(organizationId, requestId);
        User user = request.getUser();
        Organization org = request.getOrganization();

        if (memberRepository.existsByOrganizationAndUser(org, user)) {
            throw new JoinRequestConflictException("User is already a member of this organization");
        }

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new UserNotFoundException("Reviewer not found"));

        request.setStatus(JoinRequestStatus.APPROVED);
        request.setReviewedAt(Instant.now());
        request.setReviewer(reviewer);

        boolean hasActive = memberRepository.findByUserAndActiveTrue(user).isPresent();
        memberRepository.save(new OrganizationMember(org, user, OrganizationRole.MEMBER, !hasActive));

        return joinRequestMapper.toResponse(joinRequestRepository.save(request));
    }

    @Override
    @Transactional
    public JoinRequestResponse reject(Long organizationId, Long requestId, Long reviewerId) {
        OrganizationJoinRequest request = findPendingRequest(organizationId, requestId);

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new UserNotFoundException("Reviewer not found"));

        request.setStatus(JoinRequestStatus.REJECTED);
        request.setReviewedAt(Instant.now());
        request.setReviewer(reviewer);

        return joinRequestMapper.toResponse(joinRequestRepository.save(request));
    }

    @Override
    @Transactional(readOnly = true)
    public long countPending(Long organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException("Organization not found with ID: " + organizationId));
        return joinRequestRepository.countByOrganizationAndStatus(org, JoinRequestStatus.PENDING);
    }

    @Override
    public Optional<OrganizationJoinRequest> findBlockingRequest(String username) {
        return joinRequestRepository.findFirstByUser_NameAndStatusInOrderByRequestedAtAsc(
                username, List.of(JoinRequestStatus.PENDING, JoinRequestStatus.REJECTED));
    }

    private OrganizationJoinRequest findPendingRequest(Long organizationId, Long requestId) {
        OrganizationJoinRequest request = joinRequestRepository.findByOrganization_IdAndId(organizationId, requestId)
                .orElseThrow(() -> new OrganizationJoinRequestNotFoundException(
                        "Join request not found with ID: " + requestId + " for organization: " + organizationId));

        if (request.getStatus() != JoinRequestStatus.PENDING) {
            throw new JoinRequestAlreadyReviewedException(
                    "This join request has already been " + request.getStatus().name().toLowerCase());
        }
        return request;
    }
}