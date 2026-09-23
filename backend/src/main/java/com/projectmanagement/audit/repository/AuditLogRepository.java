package com.projectmanagement.audit.repository;

import com.projectmanagement.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {

    long countByOrganizationIdAndCreatedAtAfter(Long organizationId, Instant after);

    @Query("""
            SELECT COUNT(a.id)
            FROM AuditLog a
            WHERE a.organizationId = :orgId
              AND (CAST(:from AS timestamp) IS NULL OR a.createdAt >= :from)
              AND (CAST(:to AS timestamp) IS NULL OR a.createdAt < :to)
            """)
    long countEvents(@Param("orgId") Long orgId,
                     @Param("from") Instant from,
                     @Param("to") Instant to);

    @Query("""
            SELECT AVG(CASE WHEN a.success = true THEN 1.0 ELSE 0.0 END)
            FROM AuditLog a
            WHERE a.organizationId = :orgId
              AND (CAST(:from AS timestamp) IS NULL OR a.createdAt >= :from)
              AND (CAST(:to AS timestamp) IS NULL OR a.createdAt < :to)
            """)
    Double avgSuccessRate(@Param("orgId") Long orgId,
                          @Param("from") Instant from,
                          @Param("to") Instant to);

    @Query("""
            SELECT AVG(a.durationMs)
            FROM AuditLog a
            WHERE a.organizationId = :orgId
              AND (CAST(:from AS timestamp) IS NULL OR a.createdAt >= :from)
              AND (CAST(:to AS timestamp) IS NULL OR a.createdAt < :to)
            """)
    Double avgDurationMs(@Param("orgId") Long orgId,
                         @Param("from") Instant from,
                         @Param("to") Instant to);

    @Query("""
            SELECT a.action, COUNT(a.id)
            FROM AuditLog a
            WHERE a.organizationId = :orgId
              AND (CAST(:from AS timestamp) IS NULL OR a.createdAt >= :from)
              AND (CAST(:to AS timestamp) IS NULL OR a.createdAt < :to)
            GROUP BY a.action
            ORDER BY COUNT(a.id) DESC
            """)
    List<Object[]> countByAction(@Param("orgId") Long orgId,
                                 @Param("from") Instant from,
                                 @Param("to") Instant to);

    @Query("""
            SELECT a.resource, COUNT(a.id)
            FROM AuditLog a
            WHERE a.organizationId = :orgId
              AND (CAST(:from AS timestamp) IS NULL OR a.createdAt >= :from)
              AND (CAST(:to AS timestamp) IS NULL OR a.createdAt < :to)
              AND a.resource IS NOT NULL
            GROUP BY a.resource
            ORDER BY COUNT(a.id) DESC
            """)
    List<Object[]> countByResource(@Param("orgId") Long orgId,
                                   @Param("from") Instant from,
                                   @Param("to") Instant to);

    @Query("""
            SELECT a.actor, COUNT(a.id)
            FROM AuditLog a
            WHERE a.organizationId = :orgId
              AND (CAST(:from AS timestamp) IS NULL OR a.createdAt >= :from)
              AND (CAST(:to AS timestamp) IS NULL OR a.createdAt < :to)
            GROUP BY a.actor
            ORDER BY COUNT(a.id) DESC
            """)
    List<Object[]> countByActor(@Param("orgId") Long orgId,
                                @Param("from") Instant from,
                                @Param("to") Instant to,
                                org.springframework.data.domain.Pageable pageable);

    @Query("""
            SELECT FUNCTION('date_trunc', 'day', a.createdAt), COUNT(a.id)
            FROM AuditLog a
            WHERE a.organizationId = :orgId
              AND (CAST(:from AS timestamp) IS NULL OR a.createdAt >= :from)
              AND (CAST(:to AS timestamp) IS NULL OR a.createdAt < :to)
            GROUP BY FUNCTION('date_trunc', 'day', a.createdAt)
            ORDER BY FUNCTION('date_trunc', 'day', a.createdAt) ASC
            """)
    List<Object[]> countByDay(@Param("orgId") Long orgId,
                              @Param("from") Instant from,
                              @Param("to") Instant to);
}