package com.projectmanagement.project.service;

import com.projectmanagement.project.dto.ProjectCreateDto;
import com.projectmanagement.project.dto.ProjectResponseDto;
import com.projectmanagement.project.dto.ProjectUpdateDto;

import java.util.List;

public interface ProjectService {

    ProjectResponseDto createProject(ProjectCreateDto dto, String currentUsername);
    ProjectResponseDto getProjectById(Long id, Long orgId);
    List<ProjectResponseDto> getProjectsByOrganization(Long orgId);
    ProjectResponseDto updateProject(Long id, Long orgId, ProjectUpdateDto dto);
    void deleteProject(Long id, Long orgId);
    ProjectResponseDto addMemberToProject(Long projectId, Long orgId, Long userId);
    ProjectResponseDto removeMemberFromProject(Long projectId, Long orgId, Long userId);
}
