package com.projectmanagement.organization.security;

import com.projectmanagement.organization.entity.OrganizationRole;
import com.projectmanagement.organization.repository.OrganizationMemberRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component("orgSecurity")
public class OrgSecurity {

    private final OrganizationMemberRepository memberRepository;

    public OrgSecurity(OrganizationMemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    public boolean isMember(Long orgId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || orgId == null) {
            return false;
        }
        return memberRepository.existsByOrganization_IdAndUser_Name(orgId, auth.getName());
    }

    public boolean hasRole(Long orgId, String... roles) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || orgId == null) {
            return false;
        }
        List<OrganizationRole> roleEnums = Arrays.stream(roles)
                .map(OrganizationRole::valueOf)
                .toList();
        return memberRepository.existsByOrganization_IdAndUser_NameAndRoleIn(orgId, auth.getName(), roleEnums);
    }
}
