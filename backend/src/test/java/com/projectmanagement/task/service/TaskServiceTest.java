package com.projectmanagement.task.service;

import com.projectmanagement.organization.entity.Organization;
import com.projectmanagement.organization.exception.OrganizationNotFoundException;
import com.projectmanagement.organization.repository.OrganizationMemberRepository;
import com.projectmanagement.organization.repository.OrganizationRepository;
import com.projectmanagement.project.exception.ProjectNotFoundException;
import com.projectmanagement.project.model.Project;
import com.projectmanagement.project.repository.ProjectRepository;
import com.projectmanagement.task.dto.TaskCreateDto;
import com.projectmanagement.task.dto.TaskResponseDto;
import com.projectmanagement.task.dto.TaskUpdateDto;
import com.projectmanagement.task.exception.TaskNotFoundException;
import com.projectmanagement.task.mapper.TaskMapper;
import com.projectmanagement.task.model.Task;
import com.projectmanagement.task.repository.TaskRepository;
import com.projectmanagement.user.entity.User;
import com.projectmanagement.user.exception.UserNotFoundException;
import com.projectmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private OrganizationMemberRepository organizationMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TaskMapper taskMapper;

    @InjectMocks
    private TaskServiceImpl taskService;

    private Organization organization;
    private Project project;
    private User user;
    private Task task;

    @BeforeEach
    void setUp() {
        organization = new Organization();
        organization.setId(1L);
        organization.setName("Test Org");

        project = new Project();
        project.setId(10L);
        project.setName("Test Project");
        project.setOrganization(organization);

        user = new User(100L, "john_doe", "pass");

        task = new Task();
        task.setId(1000L);
        task.setTitle("Test Task");
        task.setDescription("Task Description");
        task.setStatus("TODO");
        task.setProject(project);
        task.setOrganization(organization);
        task.setAffectedUser(user);
    }

    @Test
    void createTask_success() {
        TaskCreateDto dto = new TaskCreateDto("Test Task", "Task Description", "TODO", 10L, 1L, 100L);

        when(organizationRepository.findById(1L)).thenReturn(Optional.of(organization));
        when(projectRepository.findByIdAndOrganization_Id(10L, 1L)).thenReturn(Optional.of(project));
        when(userRepository.findById(100L)).thenReturn(Optional.of(user));
        when(organizationMemberRepository.existsByOrganizationAndUser(organization, user)).thenReturn(true);
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        TaskResponseDto responseDto = new TaskResponseDto(1000L, "Test Task", "Task Description", "TODO", 10L, 1L, 100L, "john_doe");
        when(taskMapper.toDto(any(Task.class))).thenReturn(responseDto);

        TaskResponseDto result = taskService.createTask(dto);

        assertNotNull(result);
        assertEquals("Test Task", result.getTitle());
        assertEquals(10L, result.getProjectId());
        assertEquals(1L, result.getOrganizationId());
        assertEquals(100L, result.getAffectedUserId());
    }

    @Test
    void createTask_projectNotFoundInOrg_throwsException() {
        TaskCreateDto dto = new TaskCreateDto("Test Task", "Desc", "TODO", 999L, 1L, null);

        when(organizationRepository.findById(1L)).thenReturn(Optional.of(organization));
        when(projectRepository.findByIdAndOrganization_Id(999L, 1L)).thenReturn(Optional.empty());

        assertThrows(ProjectNotFoundException.class, () -> taskService.createTask(dto));
    }

    @Test
    void createTask_affectedUserNotInOrg_throwsException() {
        TaskCreateDto dto = new TaskCreateDto("Test Task", "Desc", "TODO", 10L, 1L, 100L);

        when(organizationRepository.findById(1L)).thenReturn(Optional.of(organization));
        when(projectRepository.findByIdAndOrganization_Id(10L, 1L)).thenReturn(Optional.of(project));
        when(userRepository.findById(100L)).thenReturn(Optional.of(user));
        when(organizationMemberRepository.existsByOrganizationAndUser(organization, user)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> taskService.createTask(dto));
    }

    @Test
    void getTaskById_success() {
        when(taskRepository.findByIdAndOrganization_Id(1000L, 1L)).thenReturn(Optional.of(task));
        TaskResponseDto responseDto = new TaskResponseDto(1000L, "Test Task", "Desc", "TODO", 10L, 1L, 100L, "john_doe");
        when(taskMapper.toDto(task)).thenReturn(responseDto);

        TaskResponseDto result = taskService.getTaskById(1000L, 1L);

        assertNotNull(result);
        assertEquals(1000L, result.getId());
    }

    @Test
    void getTaskById_notFound_throwsException() {
        when(taskRepository.findByIdAndOrganization_Id(9999L, 1L)).thenReturn(Optional.empty());

        assertThrows(TaskNotFoundException.class, () -> taskService.getTaskById(9999L, 1L));
    }

    @Test
    void updateTask_success() {
        when(taskRepository.findByIdAndOrganization_Id(1000L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        TaskResponseDto responseDto = new TaskResponseDto(1000L, "Updated Task", "New Desc", "IN_PROGRESS", 10L, 1L, 100L, "john_doe");
        when(taskMapper.toDto(task)).thenReturn(responseDto);

        TaskUpdateDto updateDto = new TaskUpdateDto("Updated Task", "New Desc", "IN_PROGRESS", null);
        TaskResponseDto result = taskService.updateTask(1000L, 1L, updateDto);

        assertNotNull(result);
        assertEquals("Updated Task", result.getTitle());
    }

    @Test
    void deleteTask_success() {
        when(taskRepository.findByIdAndOrganization_Id(1000L, 1L)).thenReturn(Optional.of(task));

        taskService.deleteTask(1000L, 1L);

        verify(taskRepository).delete(task);
    }
}
