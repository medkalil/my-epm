package com.projectmanagement.mail;

public interface MailService {
    void sendPasswordResetEmail(String to, String fullName, String resetLink);
}