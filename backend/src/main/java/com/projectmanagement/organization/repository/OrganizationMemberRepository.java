package com.projectmanagement.organization.repository;

import com.projectmanagement.organization.entity.Organization;
import com.projectmanagement.organization.entity.OrganizationMember;
import com.projectmanagement.organization.entity.OrganizationRole;
import com.projectmanagement.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {
    List<OrganizationMember> findByOrganization(Organization organization);
    List<OrganizationMember> findByUser(User user);
    Optional<OrganizationMember> findByOrganizationAndUser(Organization organization, User user);
    Optional<OrganizationMember> findByUserAndActiveTrue(User user);
    Optional<OrganizationMember> findByUser_NameAndActiveTrue(String username);
    boolean existsByOrganizationAndUser(Organization organization, User user);
    boolean existsByOrganization_IdAndUser_Name(Long organizationId, String name);
    boolean existsByOrganization_IdAndUser_NameAndRoleIn(Long organizationId, String name, List<OrganizationRole> roles);

    @Modifying
    @Query("UPDATE OrganizationMember m SET m.active = false WHERE m.user = :user")
    void deactivateAllForUser(@Param("user") User user);
}
