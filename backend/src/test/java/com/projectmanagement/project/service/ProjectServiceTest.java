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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.control.MappingControl.Use;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private OrganizationMemberRepository organizationMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProjectMapper projectMapper;

    @InjectMocks
    private ProjectServiceImpl projectService;

    private Organization organization;
    private User user;
    private Project project;

    @BeforeEach
    void setUp() {
        organization = new Organization();
        organization.setId(1L);
        organization.setName("Test Org");

        user = new User(10L, "testuser", "pass");

        project = new Project();
        project.setId(100L);
        project.setName("Test Project");
        project.setDescription("Project description");
        project.setOrganization(organization);
    }

    @Test
    void createProject_success() {
        ProjectCreateDto dto = new ProjectCreateDto();
        dto.setName("New Project");
        dto.setDescription("Desc");
        dto.setOrganizationId(1L);
        dto.setMemberIds(Set.of(10L));

        when(organizationRepository.findById(1L)).thenReturn(Optional.of(organization));
        when(userRepository.findByName("testuser")).thenReturn(Optional.of(user));
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(organizationMemberRepository.existsByOrganizationAndUser(organization, user)).thenReturn(true);
        when(projectRepository.save(any(Project.class))).thenAnswer(i -> {
            Project p = i.getArgument(0);
            p.setId(101L);
            return p;
        });

        ProjectResponseDto responseDto = new ProjectResponseDto(101L, "New Project", "Desc", 1L, Set.of(10L));
        when(projectMapper.toDto(any(Project.class))).thenReturn(responseDto);

        ProjectResponseDto result = projectService.createProject(dto, "testuser");

        assertNotNull(result);
        assertEquals("New Project", result.getName());
        assertEquals(1L, result.getOrganizationId());
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void createProject_organizationNotFound_throwsException() {
        ProjectCreateDto dto = new ProjectCreateDto();
        dto.setOrganizationId(999L);

        when(organizationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(OrganizationNotFoundException.class, () -> projectService.createProject(dto, "testuser"));
    }

    @Test
    void getProjectById_success() {
        when(projectRepository.findByIdAndOrganization_Id(100L, 1L)).thenReturn(Optional.of(project));
        ProjectResponseDto responseDto = new ProjectResponseDto(100L, "Test Project", "Desc", 1L, Collections.emptySet());
        when(projectMapper.toDto(project)).thenReturn(responseDto);

        ProjectResponseDto result = projectService.getProjectById(100L, 1L);

        assertNotNull(result);
        assertEquals(100L, result.getId());
    }

    @Test
    void getProjectById_notFound_throwsException() {
        when(projectRepository.findByIdAndOrganization_Id(100L, 1L)).thenReturn(Optional.empty());

        assertThrows(ProjectNotFoundException.class, () -> projectService.getProjectById(100L, 1L));
    }

    @Test
    void updateProject_success() {
        when(projectRepository.findByIdAndOrganization_Id(100L, 1L)).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        ProjectResponseDto responseDto = new ProjectResponseDto(100L, "Updated Name", "Updated Desc", 1L, Collections.emptySet());
        when(projectMapper.toDto(project)).thenReturn(responseDto);

        ProjectUpdateDto updateDto = new ProjectUpdateDto("Updated Name", "Updated Desc");
        ProjectResponseDto result = projectService.updateProject(100L, 1L, updateDto);

        assertNotNull(result);
        assertEquals("Updated Name", result.getName());
    }

    @Test
    void deleteProject_success() {
        when(projectRepository.findByIdAndOrganization_Id(100L, 1L)).thenReturn(Optional.of(project));

        projectService.deleteProject(100L, 1L);

        verify(projectRepository).delete(project);
    }

    @Test
    void addMemberToProject_userNotInOrg_throwsException() {
        when(projectRepository.findByIdAndOrganization_Id(100L, 1L)).thenReturn(Optional.of(project));
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(organizationMemberRepository.existsByOrganizationAndUser(organization, user)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> projectService.addMemberToProject(100L, 1L, 10L));
    }
}
