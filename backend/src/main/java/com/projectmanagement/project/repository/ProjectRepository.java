package com.projectmanagement.project.repository;

import com.projectmanagement.project.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOrganization_Id(Long organizationId);
    Optional<Project> findByIdAndOrganization_Id(Long id, Long organizationId);
    boolean existsByIdAndOrganization_Id(Long id, Long organizationId);
}
