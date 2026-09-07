package com.projectmanagement.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class TaskCreateDto {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String description;

    private String status; // defaults to "TODO" if not provided

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    private Long affectedUserId; // optional

    public TaskCreateDto() {}

    public TaskCreateDto(String title, String description, String status, Long projectId, Long organizationId, Long affectedUserId) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.projectId = projectId;
        this.organizationId = organizationId;
        this.affectedUserId = affectedUserId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public Long getAffectedUserId() {
        return affectedUserId;
    }

    public void setAffectedUserId(Long affectedUserId) {
        this.affectedUserId = affectedUserId;
    }
}
