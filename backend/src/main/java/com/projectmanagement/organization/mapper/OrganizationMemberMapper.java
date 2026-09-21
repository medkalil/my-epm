package com.projectmanagement.organization.mapper;

import com.projectmanagement.organization.dto.response.OrganizationMemberResponse;
import com.projectmanagement.organization.entity.OrganizationMember;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrganizationMemberMapper {

    @Mapping(source = "organization.id", target = "organizationId")
    @Mapping(source = "user.id", target = "userId")
    OrganizationMemberResponse toResponse(OrganizationMember member);
}
