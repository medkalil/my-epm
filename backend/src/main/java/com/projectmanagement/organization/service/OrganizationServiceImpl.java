package com.projectmanagement.organization.service;

import com.projectmanagement.organization.dto.request.AddMemberRequest;
import com.projectmanagement.organization.dto.request.CreateOrganizationRequest;
import com.projectmanagement.organization.dto.request.InviteMemberRequest;
import com.projectmanagement.organization.dto.response.OrganizationMemberResponse;
import com.projectmanagement.organization.dto.response.OrganizationResponse;
import com.projectmanagement.organization.entity.Organization;
import com.projectmanagement.organization.entity.OrganizationMember;
import com.projectmanagement.organization.entity.OrganizationRole;
import com.projectmanagement.organization.exception.OrganizationNotFoundException;
import com.projectmanagement.organization.exception.OrganizationSlugAlreadyExistsException;
import com.projectmanagement.organization.mapper.OrganizationMemberMapper;
import com.projectmanagement.organization.mapper.OrganizationMapper;
import com.projectmanagement.organization.repository.OrganizationMemberRepository;
import com.projectmanagement.organization.repository.OrganizationRepository;
import com.projectmanagement.mail.MailService;
import com.projectmanagement.user.entity.User;
import com.projectmanagement.user.exception.UserNotFoundException;
import com.projectmanagement.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
public class OrganizationServiceImpl implements OrganizationService {

    private static final Logger log = LoggerFactory.getLogger(OrganizationServiceImpl.class);

    private static final String PASSWORD_CHARS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final OrganizationMapper organizationMapper;
    private final OrganizationMemberMapper organizationMemberMapper;
    private final PasswordEncoder encoder;
    private final MailService mailService;

    public OrganizationServiceImpl(OrganizationRepository organizationRepository,
                                   OrganizationMemberRepository memberRepository,
                                   UserRepository userRepository,
                                   OrganizationMapper organizationMapper,
                                   OrganizationMemberMapper organizationMemberMapper,
                                   PasswordEncoder encoder,
                                   MailService mailService) {
        this.organizationRepository = organizationRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.organizationMapper = organizationMapper;
        this.organizationMemberMapper = organizationMemberMapper;
        this.encoder = encoder;
        this.mailService = mailService;
    }

    @Override
    @Transactional
    public OrganizationResponse createOrganization(CreateOrganizationRequest request, String currentUsername) {
        if (organizationRepository.existsBySlug(request.slug())) {
            throw new OrganizationSlugAlreadyExistsException("Organization with slug '" + request.slug() + "' already exists");
        }

        User owner = userRepository.findByName(currentUsername)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + currentUsername));

        Organization organization = new Organization(request.name(), request.slug(), owner);
        Organization savedOrg = organizationRepository.save(organization);

        // Deactivate existing organization memberships for the owner and set the new one as active
        memberRepository.deactivateAllForUser(owner);
        OrganizationMember ownerMember = new OrganizationMember(savedOrg, owner, OrganizationRole.OWNER, true);
        memberRepository.save(ownerMember);

        return organizationMapper.toResponse(savedOrg, OrganizationRole.OWNER);
    }

    @Override
    public OrganizationResponse getOrganizationById(Long id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new OrganizationNotFoundException("Organization not found with ID: " + id));
        return organizationMapper.toResponse(org);
    }

    @Override
    public OrganizationResponse getOrganizationBySlug(String slug) {
        Organization org = organizationRepository.findBySlug(slug)
                .orElseThrow(() -> new OrganizationNotFoundException("Organization not found with slug: " + slug));
        return organizationMapper.toResponse(org);
    }

    @Override
    public List<OrganizationResponse> getUserOrganizations(String currentUsername) {
        User user = userRepository.findByName(currentUsername)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + currentUsername));

        List<OrganizationMember> memberships = memberRepository.findByUser(user);
        return memberships.stream()
                .map(m -> organizationMapper.toResponse(m.getOrganization(), m.getRole()))
                .toList();
    }

    @Override
    @Transactional
    public Long getActiveOrganizationId(String currentUsername) {
        User user = userRepository.findByName(currentUsername)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + currentUsername));

        return memberRepository.findByUserAndActiveTrue(user)
                .map(m -> m.getOrganization().getId())
                .orElseGet(() -> { // if no active organization, set the first one as active
                    List<OrganizationMember> memberships = memberRepository.findByUser(user);
                    if (memberships.isEmpty()) {
                        return null;
                    }
                    OrganizationMember firstMember = memberships.get(0);
                    firstMember.setActive(true);
                    memberRepository.save(firstMember);
                    return firstMember.getOrganization().getId();
                });
    }

    @Override
    @Transactional
    public OrganizationResponse switchActiveOrganization(Long organizationId, String currentUsername) {
        User user = userRepository.findByName(currentUsername)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + currentUsername));

        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException("Organization not found with ID: " + organizationId));

        OrganizationMember member = memberRepository.findByOrganizationAndUser(org, user)
                .orElseThrow(() -> new IllegalArgumentException("User is not a member of organization with ID: " + organizationId));

        memberRepository.deactivateAllForUser(user);
        member.setActive(true);
        memberRepository.save(member);

        return organizationMapper.toResponse(org, member.getRole());
    }

    @Override
    @Transactional
    public OrganizationMemberResponse addMember(Long organizationId, AddMemberRequest request) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException("Organization not found with ID: " + organizationId));

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + request.userId()));

        if (memberRepository.existsByOrganizationAndUser(org, user)) {
            throw new IllegalArgumentException("User is already a member of this organization");
        }

        boolean hasActive = memberRepository.findByUserAndActiveTrue(user).isPresent();
        OrganizationMember member = new OrganizationMember(org, user, request.role(), !hasActive);
        OrganizationMember savedMember = memberRepository.save(member);

        return organizationMemberMapper.toResponse(savedMember);
    }

    @Override
    @Transactional
    public OrganizationMemberResponse inviteUser(Long organizationId, InviteMemberRequest request, String currentUsername) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException("Organization not found with ID: " + organizationId));

        if (request.role() == OrganizationRole.OWNER) {
            throw new IllegalArgumentException("Cannot invite a user with the OWNER role");
        }

        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("A user with this email is already registered");
        }

        User inviter = userRepository.findByName(currentUsername)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + currentUsername));

        String username = generateUniqueUsername(request.email());
        String temporaryPassword = generateTemporaryPassword();

        User user = new User();
        user.setName(username);
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setPassword(encoder.encode(temporaryPassword));
        user.setMustChangePassword(true);
        User savedUser = userRepository.save(user);

        boolean hasActive = memberRepository.findByUserAndActiveTrue(savedUser).isPresent();
        OrganizationMember member = new OrganizationMember(org, savedUser, request.role(), !hasActive);
        OrganizationMember savedMember = memberRepository.save(member);

        try {
            mailService.sendInvitationEmail(savedUser.getEmail(), savedUser.getFullName(),
                    savedUser.getName(), temporaryPassword, org.getName(), inviter.getFullName());
        } catch (Exception ex) {
            log.error("Failed to send invitation email to user {}", savedUser.getEmail(), ex);
        }

        return organizationMemberMapper.toResponse(savedMember);
    }

    private String generateUniqueUsername(String email) {
        String base = email.substring(0, email.indexOf('@'))
                .replaceAll("[^a-zA-Z0-9._-]", "");
        if (base.isBlank() || base.length() < 2) {
            base = "user";
        }
        String candidate = base;
        int suffix = 2;
        while (userRepository.findByName(candidate).isPresent()) {
            candidate = base + "-" + suffix;
            suffix++;
        }
        return candidate;
    }

    private String generateTemporaryPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(12);
        for (int i = 0; i < 12; i++) {
            sb.append(PASSWORD_CHARS.charAt(random.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    @Override
    public List<OrganizationMemberResponse> getMembers(Long organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException("Organization not found with ID: " + organizationId));

        return memberRepository.findByOrganization(org).stream()
                .map(organizationMemberMapper::toResponse)
                .toList();
    }
}
