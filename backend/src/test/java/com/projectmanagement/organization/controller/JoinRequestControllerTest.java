package com.projectmanagement.organization.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectmanagement.common.exception.GlobalExceptionHandler;
import com.projectmanagement.organization.dto.response.JoinRequestResponse;
import com.projectmanagement.organization.entity.JoinRequestStatus;
import com.projectmanagement.organization.exception.JoinRequestAlreadyReviewedException;
import com.projectmanagement.organization.exception.OrganizationJoinRequestNotFoundException;
import com.projectmanagement.organization.service.JoinRequestService;
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
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class JoinRequestControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private JoinRequestService joinRequestService;

    @InjectMocks
    private JoinRequestController joinRequestController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(joinRequestController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private static RequestPostProcessor asUser(String username) {
        return request -> {
            request.setUserPrincipal(new UsernamePasswordAuthenticationToken(username, ""));
            return request;
        };
    }

    private JoinRequestResponse response(JoinRequestStatus status) {
        return new JoinRequestResponse(
                100L, 1L, "Acme Corp", "acme-corp", 10L, "alice", "alice@example.com",
                status, Instant.now(), status == JoinRequestStatus.PENDING ? null : Instant.now(), 20L, "bob");
    }

    @Test
    void list_returnsAllRequests() throws Exception {
        when(joinRequestService.listByOrganization(1L, null)).thenReturn(List.of(response(JoinRequestStatus.PENDING)));

        mockMvc.perform(get("/api/v1/organizations/1/join-requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100))
                .andExpect(jsonPath("$[0].userName").value("alice"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void list_filteredByStatus() throws Exception {
        when(joinRequestService.listByOrganization(1L, JoinRequestStatus.PENDING))
                .thenReturn(List.of(response(JoinRequestStatus.PENDING)));

        mockMvc.perform(get("/api/v1/organizations/1/join-requests").param("status", "PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void approve_returnsReviewedRequest() throws Exception {
        when(joinRequestService.approve(1L, 100L, "bob")).thenReturn(response(JoinRequestStatus.APPROVED));

        mockMvc.perform(post("/api/v1/organizations/1/join-requests/100/approve")
                        .contentType(MediaType.APPLICATION_JSON).with(asUser("bob")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void reject_returnsReviewedRequest() throws Exception {
        when(joinRequestService.reject(1L, 100L, "bob")).thenReturn(response(JoinRequestStatus.REJECTED));

        mockMvc.perform(post("/api/v1/organizations/1/join-requests/100/reject")
                        .contentType(MediaType.APPLICATION_JSON).with(asUser("bob")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    void approve_alreadyReviewed_returns409() throws Exception {
        when(joinRequestService.approve(1L, 100L, "bob"))
                .thenThrow(new JoinRequestAlreadyReviewedException("This join request has already been approved"));

        mockMvc.perform(post("/api/v1/organizations/1/join-requests/100/approve")
                        .contentType(MediaType.APPLICATION_JSON).with(asUser("bob")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("This join request has already been approved"));
    }

    @Test
    void approve_notFound_returns404() throws Exception {
        when(joinRequestService.approve(1L, 999L, "bob"))
                .thenThrow(new OrganizationJoinRequestNotFoundException("Join request not found with ID: 999"));

        mockMvc.perform(post("/api/v1/organizations/1/join-requests/999/approve")
                        .contentType(MediaType.APPLICATION_JSON).with(asUser("bob")))
                .andExpect(status().isNotFound());
    }
}