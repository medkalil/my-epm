package com.projectmanagement.organization.mapper;

import com.projectmanagement.organization.dto.response.JoinRequestResponse;
import com.projectmanagement.organization.entity.OrganizationJoinRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface JoinRequestMapper {

    @Mapping(source = "organization.id", target = "organizationId")
    @Mapping(source = "organization.name", target = "organizationName")
    @Mapping(source = "organization.slug", target = "organizationSlug")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.name", target = "userName")
    @Mapping(source = "user.email", target = "userEmail")
    @Mapping(source = "reviewer.id", target = "reviewerUserId")
    @Mapping(source = "reviewer.name", target = "reviewerName")
    JoinRequestResponse toResponse(OrganizationJoinRequest request);
}