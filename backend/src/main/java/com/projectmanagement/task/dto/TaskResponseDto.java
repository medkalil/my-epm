package com.projectmanagement.task.dto;

public class TaskResponseDto {

    private Long id;
    private String title;
    private String description;
    private String status;
    private Long projectId;
    private Long organizationId;
    private Long affectedUserId;
    private String affectedUserName;

    public TaskResponseDto() {}

    public TaskResponseDto(Long id, String title, String description, String status, Long projectId, Long organizationId, Long affectedUserId, String affectedUserName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.projectId = projectId;
        this.organizationId = organizationId;
        this.affectedUserId = affectedUserId;
        this.affectedUserName = affectedUserName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getAffectedUserName() {
        return affectedUserName;
    }

    public void setAffectedUserName(String affectedUserName) {
        this.affectedUserName = affectedUserName;
    }
}
