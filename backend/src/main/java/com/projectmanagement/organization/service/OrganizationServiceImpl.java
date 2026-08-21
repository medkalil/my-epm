package com.projectmanagement.organization.service;

import com.projectmanagement.organization.dto.request.AddMemberRequest;
import com.projectmanagement.organization.dto.request.CreateOrganizationRequest;
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
import com.projectmanagement.user.entity.User;
import com.projectmanagement.user.exception.UserNotFoundException;
import com.projectmanagement.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final OrganizationMapper organizationMapper;
    private final OrganizationMemberMapper organizationMemberMapper;

    public OrganizationServiceImpl(OrganizationRepository organizationRepository,
                                   OrganizationMemberRepository memberRepository,
                                   UserRepository userRepository,
                                   OrganizationMapper organizationMapper,
                                   OrganizationMemberMapper organizationMemberMapper) {
        this.organizationRepository = organizationRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.organizationMapper = organizationMapper;
        this.organizationMemberMapper = organizationMemberMapper;
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

        // Automatically add owner as OWNER role member
        OrganizationMember ownerMember = new OrganizationMember(savedOrg, owner, OrganizationRole.OWNER);
        memberRepository.save(ownerMember);

        return organizationMapper.toResponse(savedOrg);
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
                .map(m -> organizationMapper.toResponse(m.getOrganization()))
                .toList();
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

        OrganizationMember member = new OrganizationMember(org, user, request.role());
        OrganizationMember savedMember = memberRepository.save(member);

        return organizationMemberMapper.toResponse(savedMember);
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
