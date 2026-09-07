package com.projectmanagement.project.mapper;

import com.projectmanagement.project.dto.ProjectResponseDto;
import com.projectmanagement.project.model.Project;
import com.projectmanagement.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    @Mapping(source = "organization.id", target = "organizationId")
    @Mapping(source = "members", target = "memberIds", qualifiedByName = "mapMembersToMemberIds")
    ProjectResponseDto toDto(Project project);

    List<ProjectResponseDto> toDtoList(List<Project> projects);

    @Named("mapMembersToMemberIds")
    default Set<Long> mapMembersToMemberIds(Set<User> members) {
        if (members == null) {
            return Collections.emptySet();
        }
        return members.stream()
                .map(User::getId)
                .collect(Collectors.toSet());
    }

}
