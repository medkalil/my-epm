package com.projectmanagement.organization.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectmanagement.common.exception.GlobalExceptionHandler;
import com.projectmanagement.organization.dto.request.InviteMemberRequest;
import com.projectmanagement.organization.dto.response.OrganizationMemberResponse;
import com.projectmanagement.organization.entity.OrganizationRole;
import com.projectmanagement.organization.service.OrganizationService;
import com.projectmanagement.user.dto.response.UserSummary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class InviteMemberControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private OrganizationService organizationService;

    @InjectMocks
    private OrganizationController organizationController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(organizationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private static RequestPostProcessor asUser(String username) {
        return request -> {
            request.setUserPrincipal(new UsernamePasswordAuthenticationToken(username, ""));
            return request;
        };
    }

    private OrganizationMemberResponse memberResponse() {
        return new OrganizationMemberResponse(
                9L, 1L, 3L,
                new UserSummary(3L, "jane.doe", "jane.doe@example.com"),
                OrganizationRole.MEMBER, true, Instant.now());
    }

    @Test
    void inviteMember_returnsCreated() throws Exception {
        InviteMemberRequest request = new InviteMemberRequest("Jane Doe", "jane.doe@example.com", OrganizationRole.MEMBER);

        when(organizationService.inviteUser(eq(1L), any(InviteMemberRequest.class), eq("bob")))
                .thenReturn(memberResponse());

        mockMvc.perform(post("/api/v1/organizations/1/members/invite")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(asUser("bob")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(9))
                .andExpect(jsonPath("$.role").value("MEMBER"))
                .andExpect(jsonPath("$.user.name").value("jane.doe"));
    }

    @Test
    void inviteMember_emailAlreadyRegistered_returns400() throws Exception {
        InviteMemberRequest request = new InviteMemberRequest("Jane Doe", "jane.doe@example.com", OrganizationRole.MEMBER);

        when(organizationService.inviteUser(eq(1L), any(InviteMemberRequest.class), eq("bob")))
                .thenThrow(new IllegalArgumentException("A user with this email is already registered"));

        mockMvc.perform(post("/api/v1/organizations/1/members/invite")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(asUser("bob")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("A user with this email is already registered"));
    }

    @Test
    void inviteMember_ownerRole_returns400() throws Exception {
        InviteMemberRequest request = new InviteMemberRequest("Jane Doe", "jane.doe@example.com", OrganizationRole.OWNER);

        when(organizationService.inviteUser(eq(1L), any(InviteMemberRequest.class), eq("bob")))
                .thenThrow(new IllegalArgumentException("Cannot invite a user with the OWNER role"));

        mockMvc.perform(post("/api/v1/organizations/1/members/invite")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(asUser("bob")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot invite a user with the OWNER role"));
    }

    @Test
    void inviteMember_blankFields_returns400() throws Exception {
        InviteMemberRequest request = new InviteMemberRequest("", "", null);

        mockMvc.perform(post("/api/v1/organizations/1/members/invite")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(asUser("bob")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }
}