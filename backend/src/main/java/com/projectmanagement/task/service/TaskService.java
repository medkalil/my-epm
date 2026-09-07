package com.projectmanagement.task.service;

import com.projectmanagement.task.dto.TaskCreateDto;
import com.projectmanagement.task.dto.TaskResponseDto;
import com.projectmanagement.task.dto.TaskUpdateDto;

import java.util.List;

public interface TaskService {

    TaskResponseDto createTask(TaskCreateDto dto);
    TaskResponseDto getTaskById(Long id, Long orgId);
    List<TaskResponseDto> getTasksByProject(Long projectId, Long orgId);
    List<TaskResponseDto> getTasksByOrganization(Long orgId);
    List<TaskResponseDto> getTasksByAffectedUser(Long userId, Long orgId);
    TaskResponseDto updateTask(Long id, Long orgId, TaskUpdateDto dto);
    void deleteTask(Long id, Long orgId);
}
