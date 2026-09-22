package com.projectmanagement.task.service;

import com.projectmanagement.organization.entity.Organization;
import com.projectmanagement.organization.exception.OrganizationNotFoundException;
import com.projectmanagement.organization.repository.OrganizationMemberRepository;
import com.projectmanagement.organization.repository.OrganizationRepository;
import com.projectmanagement.project.exception.ProjectNotFoundException;
import com.projectmanagement.project.exception.ProjectNotEditableException;
import com.projectmanagement.project.model.Project;
import com.projectmanagement.project.model.ProjectStatus;
import com.projectmanagement.project.repository.ProjectRepository;
import com.projectmanagement.task.dto.TaskCreateDto;
import com.projectmanagement.task.dto.TaskMoveDto;
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
import static org.mockito.ArgumentMatchers.anyList;
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
    void createTask_projectInReview_throwsException() {
        TaskCreateDto dto = new TaskCreateDto("Test Task", "Desc", "TODO", 10L, 1L, 100L);
        project.setStatus(ProjectStatus.IN_REVIEW);

        when(organizationRepository.findById(1L)).thenReturn(Optional.of(organization));
        when(projectRepository.findByIdAndOrganization_Id(10L, 1L)).thenReturn(Optional.of(project));

        assertThrows(ProjectNotEditableException.class, () -> taskService.createTask(dto));
    }

    @Test
    void createTask_projectCompleted_throwsException() {
        TaskCreateDto dto = new TaskCreateDto("Test Task", "Desc", "TODO", 10L, 1L, 100L);
        project.setStatus(ProjectStatus.COMPLETED);

        when(organizationRepository.findById(1L)).thenReturn(Optional.of(organization));
        when(projectRepository.findByIdAndOrganization_Id(10L, 1L)).thenReturn(Optional.of(project));

        assertThrows(ProjectNotEditableException.class, () -> taskService.createTask(dto));
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
        when(taskRepository.findByProject_Id(10L)).thenReturn(List.of(task));

        TaskResponseDto responseDto = new TaskResponseDto(1000L, "Updated Task", "New Desc", "IN_PROGRESS", 10L, 1L, 100L, "john_doe");
        when(taskMapper.toDto(task)).thenReturn(responseDto);

        TaskUpdateDto updateDto = new TaskUpdateDto("Updated Task", "New Desc", "IN_PROGRESS", null);
        TaskResponseDto result = taskService.updateTask(1000L, 1L, updateDto);

        assertNotNull(result);
        assertEquals("Updated Task", result.getTitle());
    }

    @Test
    void updateTask_lastTaskDone_setsProjectToReview() {
        task.setStatus("IN_PROGRESS");
        project.setStatus(ProjectStatus.IN_PROGRESS);

        when(taskRepository.findByIdAndOrganization_Id(1000L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        when(taskRepository.findByProject_Id(10L)).thenReturn(List.of(task));

        TaskResponseDto responseDto = new TaskResponseDto(1000L, "Test Task", "Desc", "DONE", 10L, 1L, 100L, "john_doe");
        when(taskMapper.toDto(any(Task.class))).thenReturn(responseDto);

        taskService.updateTask(1000L, 1L, new TaskUpdateDto(null, null, "DONE", null));

        assertEquals("DONE", task.getStatus());
        assertEquals(ProjectStatus.IN_REVIEW, project.getStatus());
        verify(projectRepository).save(project);
    }

    @Test
    void updateTask_taskReopenedFromDone_projectBackToInProgress() {
        task.setStatus("DONE");
        project.setStatus(ProjectStatus.IN_REVIEW);

        when(taskRepository.findByIdAndOrganization_Id(1000L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        when(taskRepository.findByProject_Id(10L)).thenReturn(List.of(task));

        TaskResponseDto responseDto = new TaskResponseDto(1000L, "Test Task", "Desc", "TODO", 10L, 1L, 100L, "john_doe");
        when(taskMapper.toDto(any(Task.class))).thenReturn(responseDto);

        taskService.updateTask(1000L, 1L, new TaskUpdateDto(null, null, "TODO", null));

        assertEquals("TODO", task.getStatus());
        assertEquals(ProjectStatus.IN_PROGRESS, project.getStatus());
        verify(projectRepository).save(project);
    }

    @Test
    void deleteTask_success() {
        when(taskRepository.findByIdAndOrganization_Id(1000L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.findByProject_Id(10L)).thenReturn(List.of(task));

        taskService.deleteTask(1000L, 1L);

        verify(taskRepository).delete(task);
    }

    @Test
    void deleteTask_remainingTasksAllDone_setsProjectToReview() {
        Task otherDone = new Task();
        otherDone.setId(2001L);
        otherDone.setTitle("Done A");
        otherDone.setStatus("DONE");
        otherDone.setProject(project);

        task.setStatus("TODO");
        project.setStatus(ProjectStatus.IN_PROGRESS);

        when(taskRepository.findByIdAndOrganization_Id(1000L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.findByProject_Id(10L)).thenReturn(List.of(otherDone));

        taskService.deleteTask(1000L, 1L);

        verify(taskRepository).delete(task);
        assertEquals(ProjectStatus.IN_REVIEW, project.getStatus());
        verify(projectRepository).save(project);
    }

    @Test
    void deleteTask_noRemainingTasks_keepsProjectStatus() {
        task.setStatus("DONE");
        project.setStatus(ProjectStatus.IN_PROGRESS);

        when(taskRepository.findByIdAndOrganization_Id(1000L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.findByProject_Id(10L)).thenReturn(Collections.emptyList());

        taskService.deleteTask(1000L, 1L);

        verify(taskRepository).delete(task);
        assertEquals(ProjectStatus.IN_PROGRESS, project.getStatus());
        verify(projectRepository, never()).save(any());
    }

    @Test
    void moveTask_notFound_throwsException() {
        when(taskRepository.findByIdAndOrganization_Id(9999L, 1L)).thenReturn(Optional.empty());

        assertThrows(TaskNotFoundException.class, () -> taskService.moveTask(9999L, 1L, new TaskMoveDto("TODO", 0)));
    }

    @Test
    void moveTask_withinSameLane_reordersAndRenumbers() {
        Task otherA = new Task();
        otherA.setId(2001L);
        otherA.setTitle("A");
        otherA.setStatus("TODO");
        otherA.setPosition(0);
        Task otherB = new Task();
        otherB.setId(2002L);
        otherB.setTitle("B");
        otherB.setStatus("TODO");
        otherB.setPosition(1);

        task.setStatus("TODO");
        task.setPosition(2);

        when(taskRepository.findByIdAndOrganization_Id(1000L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.findByOrganization_IdAndStatusOrderByPositionAsc(1L, "TODO"))
                .thenReturn(List.of(otherA, otherB, task));
        when(taskRepository.findByProject_Id(10L)).thenReturn(List.of(otherA, otherB, task));

        TaskResponseDto responseDto = new TaskResponseDto(1000L, "Test Task", "Desc", "TODO", 10L, 1L, 100L, "john_doe");
        when(taskMapper.toDto(any(Task.class))).thenReturn(responseDto);

        taskService.moveTask(1000L, 1L, new TaskMoveDto("TODO", 0));

        assertEquals("TODO", task.getStatus());
        assertEquals(0, task.getPosition());
        assertEquals(1, otherA.getPosition());
        assertEquals(2, otherB.getPosition());
        verify(taskRepository, times(1)).saveAll(anyList());
    }

    @Test
    void moveTask_crossLane_renumbersBothLanes() {
        Task todoTask = new Task();
        todoTask.setId(2001L);
        todoTask.setTitle("TODO A");
        todoTask.setStatus("TODO");
        todoTask.setPosition(0);
        Task progressTask = new Task();
        progressTask.setId(2002L);
        progressTask.setTitle("PROGRESS A");
        progressTask.setStatus("IN_PROGRESS");
        progressTask.setPosition(0);

        task.setStatus("TODO");
        task.setPosition(1);

        when(taskRepository.findByIdAndOrganization_Id(1000L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.findByOrganization_IdAndStatusOrderByPositionAsc(1L, "TODO"))
                .thenReturn(List.of(todoTask));
        when(taskRepository.findByOrganization_IdAndStatusOrderByPositionAsc(1L, "IN_PROGRESS"))
                .thenReturn(List.of(progressTask));
        when(taskRepository.findByProject_Id(10L)).thenReturn(List.of(todoTask, progressTask, task));

        TaskResponseDto responseDto = new TaskResponseDto(1000L, "Test Task", "Desc", "IN_PROGRESS", 10L, 1L, 100L, "john_doe");
        when(taskMapper.toDto(any(Task.class))).thenReturn(responseDto);

        taskService.moveTask(1000L, 1L, new TaskMoveDto("IN_PROGRESS", 0));

        assertEquals("IN_PROGRESS", task.getStatus());
        assertEquals(0, task.getPosition());
        assertEquals(1, progressTask.getPosition());
        assertEquals(0, todoTask.getPosition());
        verify(taskRepository, times(2)).saveAll(anyList());
    }

    @Test
    void moveTask_lastTaskDone_setsProjectToReview() {
        task.setStatus("TODO");
        project.setStatus(ProjectStatus.IN_PROGRESS);

        when(taskRepository.findByIdAndOrganization_Id(1000L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.findByOrganization_IdAndStatusOrderByPositionAsc(1L, "DONE"))
                .thenReturn(List.of());
        when(taskRepository.findByOrganization_IdAndStatusOrderByPositionAsc(1L, "TODO"))
                .thenReturn(List.of());
        when(taskRepository.findByProject_Id(10L)).thenReturn(List.of(task));

        TaskResponseDto responseDto = new TaskResponseDto(1000L, "Test Task", "Desc", "DONE", 10L, 1L, 100L, "john_doe");
        when(taskMapper.toDto(any(Task.class))).thenReturn(responseDto);

        taskService.moveTask(1000L, 1L, new TaskMoveDto("DONE", 0));

        assertEquals("DONE", task.getStatus());
        assertEquals(ProjectStatus.IN_REVIEW, project.getStatus());
        verify(projectRepository).save(project);
    }

    @Test
    void moveTask_movedOutOfDone_projectBackToInProgress() {
        task.setStatus("DONE");
        project.setStatus(ProjectStatus.IN_REVIEW);

        when(taskRepository.findByIdAndOrganization_Id(1000L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.findByOrganization_IdAndStatusOrderByPositionAsc(1L, "TODO")).thenReturn(List.of());
        when(taskRepository.findByOrganization_IdAndStatusOrderByPositionAsc(1L, "DONE")).thenReturn(List.of());
        when(taskRepository.findByProject_Id(10L)).thenReturn(List.of(task));

        TaskResponseDto responseDto = new TaskResponseDto(1000L, "Test Task", "Desc", "TODO", 10L, 1L, 100L, "john_doe");
        when(taskMapper.toDto(any(Task.class))).thenReturn(responseDto);

        taskService.moveTask(1000L, 1L, new TaskMoveDto("TODO", 0));

        assertEquals("TODO", task.getStatus());
        assertEquals(ProjectStatus.IN_PROGRESS, project.getStatus());
        verify(projectRepository).save(project);
    }
}
