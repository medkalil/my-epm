package com.projectmanagement.organization.repository;

import com.projectmanagement.organization.entity.JoinRequestStatus;
import com.projectmanagement.organization.entity.Organization;
import com.projectmanagement.organization.entity.OrganizationJoinRequest;
import com.projectmanagement.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JoinRequestRepository extends JpaRepository<OrganizationJoinRequest, Long> {

    List<OrganizationJoinRequest> findByOrganizationOrderByRequestedAtDesc(Organization organization);

    List<OrganizationJoinRequest> findByOrganizationAndStatusOrderByRequestedAtDesc(
            Organization organization, JoinRequestStatus status);

    Optional<OrganizationJoinRequest> findByOrganization_IdAndId(Long organizationId, Long id);

    boolean existsByOrganizationAndUserAndStatus(
            Organization organization, User user, JoinRequestStatus status);

    Optional<OrganizationJoinRequest> findFirstByUser_NameAndStatusInOrderByRequestedAtAsc(
            String username, List<JoinRequestStatus> statuses);

    long countByOrganizationAndStatus(Organization organization, JoinRequestStatus status);
}