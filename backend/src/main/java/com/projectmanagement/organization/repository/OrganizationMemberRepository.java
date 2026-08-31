package com.projectmanagement.organization.repository;

import com.projectmanagement.organization.entity.Organization;
import com.projectmanagement.organization.entity.OrganizationMember;
import com.projectmanagement.organization.entity.OrganizationRole;
import com.projectmanagement.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {
    List<OrganizationMember> findByOrganization(Organization organization);
    List<OrganizationMember> findByUser(User user);
    Optional<OrganizationMember> findByOrganizationAndUser(Organization organization, User user);
    boolean existsByOrganizationAndUser(Organization organization, User user);
    boolean existsByOrganization_IdAndUser_Name(Long organizationId, String name);
    boolean existsByOrganization_IdAndUser_NameAndRoleIn(Long organizationId, String name, List<OrganizationRole> roles);
}
