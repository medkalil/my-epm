package com.projectmanagement.organization.mapper;

import com.projectmanagement.organization.dto.response.OrganizationResponse;
import com.projectmanagement.organization.entity.Organization;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrganizationMapper {

    @Mapping(source = "owner.id", target = "ownerId")
    @Mapping(source = "owner.name", target = "ownerName")
    OrganizationResponse toResponse(Organization organization);
}
