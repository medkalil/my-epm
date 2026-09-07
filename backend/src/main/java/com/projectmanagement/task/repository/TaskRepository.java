package com.projectmanagement.task.repository;

import com.projectmanagement.task.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByOrganization_Id(Long organizationId);
    List<Task> findByProject_Id(Long projectId);
    List<Task> findByProject_IdAndOrganization_Id(Long projectId, Long organizationId);
    List<Task> findByAffectedUser_IdAndOrganization_Id(Long userId, Long organizationId);
    Optional<Task> findByIdAndOrganization_Id(Long id, Long organizationId);
    boolean existsByIdAndOrganization_Id(Long id, Long organizationId);
}
