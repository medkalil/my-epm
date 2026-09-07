package com.projectmanagement.project.service;

import com.projectmanagement.organization.entity.Organization;
import com.projectmanagement.organization.exception.OrganizationNotFoundException;
import com.projectmanagement.organization.repository.OrganizationMemberRepository;
import com.projectmanagement.organization.repository.OrganizationRepository;
import com.projectmanagement.project.dto.ProjectCreateDto;
import com.projectmanagement.project.dto.ProjectResponseDto;
import com.projectmanagement.project.dto.ProjectUpdateDto;
import com.projectmanagement.project.exception.ProjectNotFoundException;
import com.projectmanagement.project.mapper.ProjectMapper;
import com.projectmanagement.project.model.Project;
import com.projectmanagement.project.repository.ProjectRepository;
import com.projectmanagement.user.entity.User;
import com.projectmanagement.user.exception.UserNotFoundException;
import com.projectmanagement.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;

    public ProjectServiceImpl(ProjectRepository projectRepository,
                              OrganizationRepository organizationRepository,
                              OrganizationMemberRepository organizationMemberRepository,
                              UserRepository userRepository,
                              ProjectMapper projectMapper) {
        this.projectRepository = projectRepository;
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.userRepository = userRepository;
        this.projectMapper = projectMapper;
    }

    @Override
    @Transactional
    public ProjectResponseDto createProject(ProjectCreateDto dto, String currentUsername) {
        Organization organization = organizationRepository.findById(dto.getOrganizationId())
                .orElseThrow(() -> new OrganizationNotFoundException("Organization not found with ID: " + dto.getOrganizationId()));

        Project project = new Project();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setOrganization(organization);

        Set<User> members = new HashSet<>();

        // by default add the creator as member if exist
        if (currentUsername != null) {
            userRepository.findByName(currentUsername).ifPresent(members::add);
        }

        // Add additional requested members
        if (dto.getMemberIds() != null && !dto.getMemberIds().isEmpty()) {
            for (Long userId : dto.getMemberIds()) {
                User member = userRepository.findById(userId)
                        .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
                if (!organizationMemberRepository.existsByOrganizationAndUser(organization, member)) {
                    throw new IllegalArgumentException("User with ID " + userId + " is not a member of organization " + organization.getId());
                }
                members.add(member);
            }
        }

        project.setMembers(members);
        Project saved = projectRepository.save(project);
        return projectMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponseDto getProjectById(Long id, Long orgId) {
        Project project = projectRepository.findByIdAndOrganization_Id(id, orgId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + id + " in organization: " + orgId));
        return projectMapper.toDto(project);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponseDto> getProjectsByOrganization(Long orgId) {
        if (!organizationRepository.existsById(orgId)) {
            throw new OrganizationNotFoundException("Organization not found with ID: " + orgId);
        }
        List<Project> projects = projectRepository.findByOrganization_Id(orgId);
        return projectMapper.toDtoList(projects);
    }

    @Override
    @Transactional
    public ProjectResponseDto updateProject(Long id, Long orgId, ProjectUpdateDto dto) {
        Project project = projectRepository.findByIdAndOrganization_Id(id, orgId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + id + " in organization: " + orgId));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            project.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            project.setDescription(dto.getDescription());
        }

        Project saved = projectRepository.save(project);
        return projectMapper.toDto(saved);
    }

    @Override
    @Transactional
    public void deleteProject(Long id, Long orgId) {
        Project project = projectRepository.findByIdAndOrganization_Id(id, orgId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + id + " in organization: " + orgId));
        projectRepository.delete(project);
    }

    @Override
    @Transactional
    public ProjectResponseDto addMemberToProject(Long projectId, Long orgId, Long userId) {
        Project project = projectRepository.findByIdAndOrganization_Id(projectId, orgId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + projectId + " in organization: " + orgId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        if (!organizationMemberRepository.existsByOrganizationAndUser(project.getOrganization(), user)) {
            throw new IllegalArgumentException("User with ID " + userId + " is not a member of organization " + orgId);
        }

        project.getMembers().add(user);
        Project saved = projectRepository.save(project);
        return projectMapper.toDto(saved);
    }

    @Override
    @Transactional
    public ProjectResponseDto removeMemberFromProject(Long projectId, Long orgId, Long userId) {
        Project project = projectRepository.findByIdAndOrganization_Id(projectId, orgId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + projectId + " in organization: " + orgId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        project.getMembers().remove(user);
        Project saved = projectRepository.save(project);
        return projectMapper.toDto(saved);
    }
}
