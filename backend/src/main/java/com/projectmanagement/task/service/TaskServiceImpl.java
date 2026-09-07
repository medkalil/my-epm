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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;

    public TaskServiceImpl(TaskRepository taskRepository,
                           ProjectRepository projectRepository,
                           OrganizationRepository organizationRepository,
                           OrganizationMemberRepository organizationMemberRepository,
                           UserRepository userRepository,
                           TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.userRepository = userRepository;
        this.taskMapper = taskMapper;
    }

    @Override
    @Transactional
    public TaskResponseDto createTask(TaskCreateDto dto) {
        Organization organization = organizationRepository.findById(dto.getOrganizationId())
                .orElseThrow(() -> new OrganizationNotFoundException("Organization not found with ID: " + dto.getOrganizationId()));

        Project project = projectRepository.findByIdAndOrganization_Id(dto.getProjectId(), dto.getOrganizationId())
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with ID: " + dto.getProjectId() + " in organization: " + dto.getOrganizationId()));

        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus() != null && !dto.getStatus().isBlank() ? dto.getStatus() : "TODO");
        task.setProject(project);
        task.setOrganization(organization);

        if (dto.getAffectedUserId() != null) {
            User affectedUser = userRepository.findById(dto.getAffectedUserId())
                    .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + dto.getAffectedUserId()));
            if (!organizationMemberRepository.existsByOrganizationAndUser(organization, affectedUser)) {
                throw new IllegalArgumentException("User with ID " + dto.getAffectedUserId() + " is not a member of organization " + organization.getId());
            }
            task.setAffectedUser(affectedUser);
        }

        Task saved = taskRepository.save(task);
        return taskMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponseDto getTaskById(Long id, Long orgId) {
        Task task = taskRepository.findByIdAndOrganization_Id(id, orgId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with ID: " + id + " in organization: " + orgId));
        return taskMapper.toDto(task);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponseDto> getTasksByProject(Long projectId, Long orgId) {
        if (!projectRepository.existsByIdAndOrganization_Id(projectId, orgId)) {
            throw new ProjectNotFoundException("Project not found with ID: " + projectId + " in organization: " + orgId);
        }
        List<Task> tasks = taskRepository.findByProject_IdAndOrganization_Id(projectId, orgId);
        return taskMapper.toDtoList(tasks);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponseDto> getTasksByOrganization(Long orgId) {
        if (!organizationRepository.existsById(orgId)) {
            throw new OrganizationNotFoundException("Organization not found with ID: " + orgId);
        }
        List<Task> tasks = taskRepository.findByOrganization_Id(orgId);
        return taskMapper.toDtoList(tasks);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponseDto> getTasksByAffectedUser(Long userId, Long orgId) {
        if (!organizationRepository.existsById(orgId)) {
            throw new OrganizationNotFoundException("Organization not found with ID: " + orgId);
        }
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found with ID: " + userId);
        }
        List<Task> tasks = taskRepository.findByAffectedUser_IdAndOrganization_Id(userId, orgId);
        return taskMapper.toDtoList(tasks);
    }

    @Override
    @Transactional
    public TaskResponseDto updateTask(Long id, Long orgId, TaskUpdateDto dto) {
        Task task = taskRepository.findByIdAndOrganization_Id(id, orgId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with ID: " + id + " in organization: " + orgId));

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            task.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null) {
            task.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            task.setStatus(dto.getStatus());
        }
        if (dto.getAffectedUserId() != null) {
            User affectedUser = userRepository.findById(dto.getAffectedUserId())
                    .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + dto.getAffectedUserId()));
            if (!organizationMemberRepository.existsByOrganizationAndUser(task.getOrganization(), affectedUser)) {
                throw new IllegalArgumentException("User with ID " + dto.getAffectedUserId() + " is not a member of organization " + orgId);
            }
            task.setAffectedUser(affectedUser);
        }

        Task saved = taskRepository.save(task);
        return taskMapper.toDto(saved);
    }

    @Override
    @Transactional
    public void deleteTask(Long id, Long orgId) {
        Task task = taskRepository.findByIdAndOrganization_Id(id, orgId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with ID: " + id + " in organization: " + orgId));
        taskRepository.delete(task);
    }
}
