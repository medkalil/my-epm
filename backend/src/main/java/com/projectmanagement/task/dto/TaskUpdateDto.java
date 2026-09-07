package com.projectmanagement.task.dto;

import jakarta.validation.constraints.Size;

public class TaskUpdateDto {

    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String description;

    @Size(max = 50, message = "Status must not exceed 50 characters")
    private String status;

    private Long affectedUserId;

    public TaskUpdateDto() {}

    public TaskUpdateDto(String title, String description, String status, Long affectedUserId) {
        this.title = title;
        this.description = description;
        this.status = status;
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

    public Long getAffectedUserId() {
        return affectedUserId;
    }

    public void setAffectedUserId(Long affectedUserId) {
        this.affectedUserId = affectedUserId;
    }
}
