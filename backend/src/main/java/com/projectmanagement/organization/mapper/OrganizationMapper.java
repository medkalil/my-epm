package com.projectmanagement.organization.mapper;

import com.projectmanagement.organization.dto.response.OrganizationResponse;
import com.projectmanagement.organization.entity.Organization;
import com.projectmanagement.organization.entity.OrganizationRole;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrganizationMapper {

    @Mapping(source = "owner.id", target = "ownerId")
    @Mapping(source = "owner.name", target = "ownerName")
    OrganizationResponse toResponse(Organization organization);

    @Mapping(source = "organization.owner.id", target = "ownerId")
    @Mapping(source = "organization.owner.name", target = "ownerName")
    @Mapping(source = "myRole", target = "myRole")
    OrganizationResponse toResponse(Organization organization, OrganizationRole myRole);
}
