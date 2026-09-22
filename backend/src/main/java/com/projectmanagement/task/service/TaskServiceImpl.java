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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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

        ProjectStatus projectStatus = project.getStatus() != null ? project.getStatus() : ProjectStatus.IN_PROGRESS;
        if (projectStatus == ProjectStatus.IN_REVIEW || projectStatus == ProjectStatus.COMPLETED) {
            throw new ProjectNotEditableException(
                    "Project \"" + project.getName() + "\" is " + projectStatus.name().replace('_', ' ').toLowerCase()
                            + " and cannot accept new tasks");
        }

        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus() != null && !dto.getStatus().isBlank() ? dto.getStatus() : "TODO");
        task.setPriority(dto.getPriority());
        task.setPosition(dto.getPosition());
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
        syncProjectStatusWithTasks(task.getProject());
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
        if (dto.getPriority() != null) {
            task.setPriority(dto.getPriority());
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
        syncProjectStatusWithTasks(task.getProject());
        return taskMapper.toDto(saved);
    }

    @Override
    @Transactional
    public TaskResponseDto moveTask(Long id, Long orgId, TaskMoveDto dto) {
        Task task = taskRepository.findByIdAndOrganization_Id(id, orgId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with ID: " + id + " in organization: " + orgId));

        String oldStatus = task.getStatus();
        String newStatus = dto.getStatus();
        boolean sameLane = oldStatus.equals(newStatus);

        List<Task> laneWithoutTask = taskRepository
                .findByOrganization_IdAndStatusOrderByPositionAsc(orgId, newStatus)
                .stream()
                .filter(t -> !t.getId().equals(task.getId()))
                .collect(Collectors.toList());

        // putting the task with the new status in the list in the position: insertAt.
        int insertAt = Math.max(0, Math.min(dto.getPosition(), laneWithoutTask.size()));
        task.setStatus(newStatus);
        laneWithoutTask.add(insertAt, task);

        // update all the lines tasks positions, to ensure there is no redudent and unique positions values for very lane.
        // IN_PROGRESS

        // D → 0
        // E → 1
        // F → 2

        // and:

        // insertAt = 1

        // After laneWithoutTask.add(insertAt, task):

        // D -> 0
        // Task being moved -> 1
        // E -> 1
        // F -> 2

        // The Java list is now:

        // [
        //     D,
        //     task,
        //     E,
        //     F
        // ]
        // then to not have Task being moved -> 1, and E -> 1 has the same position value, we need to re-calculate all the values.
        
        // D -> 0
        // Task being moved -> 1
        // E -> 2
        // F -> 3

        int pos = 0;
        for (Task t : laneWithoutTask) {
            t.setPosition(pos++);
        }
        taskRepository.saveAll(laneWithoutTask);

        // if !sameLane: so we need to re-calculate the old Line prioritie values because that task is no longer in that line.
        // before moving E:

        // D -> 0
        // A -> 1
        // E -> 2
        // F -> 3

        //after moving E:

        // D -> 0
        // A -> 1
        // F -> 2
        if (!sameLane) {
            List<Task> oldLane = taskRepository
                    .findByOrganization_IdAndStatusOrderByPositionAsc(orgId, oldStatus);
            if (!oldLane.isEmpty()) {
                int p = 0;
                for (Task t : oldLane) {
                    t.setPosition(p++);
                }
                taskRepository.saveAll(oldLane);
            }
        }

        syncProjectStatusWithTasks(task.getProject());

        return taskMapper.toDto(task);
    }

    @Override
    @Transactional
    public void deleteTask(Long id, Long orgId) {
        Task task = taskRepository.findByIdAndOrganization_Id(id, orgId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with ID: " + id + " in organization: " + orgId));
        Project project = task.getProject();
        taskRepository.delete(task);
        syncProjectStatusWithTasks(project);
    }

    private void syncProjectStatusWithTasks(Project project) {
        if (project == null) {
            return;
        }
        List<Task> tasks = taskRepository.findByProject_Id(project.getId());
        if (tasks.isEmpty()) {
            return;
        }
        boolean allDone = tasks.stream().allMatch(t -> "DONE".equals(t.getStatus()));
        ProjectStatus projectStatus = project.getStatus() != null ? project.getStatus() : ProjectStatus.IN_PROGRESS;
        if (allDone && projectStatus != ProjectStatus.IN_REVIEW && projectStatus != ProjectStatus.COMPLETED) {
            project.setStatus(ProjectStatus.IN_REVIEW);
            projectRepository.save(project);
        } else if (!allDone && projectStatus == ProjectStatus.IN_REVIEW) {
            project.setStatus(ProjectStatus.IN_PROGRESS);
            projectRepository.save(project);
        }
    }
}
