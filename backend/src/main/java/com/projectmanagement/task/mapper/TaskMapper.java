package com.projectmanagement.task.mapper;

import com.projectmanagement.task.dto.TaskResponseDto;
import com.projectmanagement.task.model.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TaskMapper {

    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "organization.id", target = "organizationId")
    @Mapping(source = "affectedUser.id", target = "affectedUserId")
    @Mapping(source = "affectedUser.name", target = "affectedUserName")
    TaskResponseDto toDto(Task task);

    List<TaskResponseDto> toDtoList(List<Task> tasks);
}
