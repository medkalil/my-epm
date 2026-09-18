package com.projectmanagement.project.dto;

import com.projectmanagement.project.model.ProjectStatus;
import java.util.Set;

public class ProjectResponseDto {

    private Long id;
    private String name;
    private String description;
    private ProjectStatus status;
    private Long organizationId;
    private Set<Long> memberIds;

    public ProjectResponseDto() {}

    public ProjectResponseDto(Long id, String name, String description, Long organizationId, Set<Long> memberIds) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = ProjectStatus.IN_PROGRESS;
        this.organizationId = organizationId;
        this.memberIds = memberIds;
    }

    public ProjectResponseDto(Long id, String name, String description, ProjectStatus status, Long organizationId, Set<Long> memberIds) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
        this.organizationId = organizationId;
        this.memberIds = memberIds;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public Set<Long> getMemberIds() {
        return memberIds;
    }

    public void setMemberIds(Set<Long> memberIds) {
        this.memberIds = memberIds;
    }
}
