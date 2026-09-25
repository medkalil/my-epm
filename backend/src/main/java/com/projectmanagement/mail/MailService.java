package com.projectmanagement.mail;

public interface MailService {
    void sendPasswordResetEmail(String to, String fullName, String resetLink);

    void sendInvitationEmail(String to, String fullName, String username, String temporaryPassword,
                             String organizationName, String inviterName);
}