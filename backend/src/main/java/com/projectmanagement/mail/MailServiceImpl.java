package com.projectmanagement.mail;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailServiceImpl implements MailService {

    private final JavaMailSender javaMailSender;

    @Value("${epm.app.noReplyEmail}")
    private String noReplyEmail;

    @Value("${epm.app.frontendUrl}")
    private String frontendUrl;

    public MailServiceImpl(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    @Override
    public void sendPasswordResetEmail(String to, String fullName, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(noReplyEmail);
        message.setTo(to);
        message.setSubject("MY-EPM Password Reset Request");

        String text = "Hello " + fullName + ",\n\n"
                + "We received a request to reset the password for your MY-EPM account.\n\n"
                + "To reset your password, open the following link within the next 30 minutes:\n"
                + resetLink + "\n\n"
                + "If you did not request a password reset, you can safely ignore this email.\n\n"
                + "Thank you,\n"
                + "The MY-EPM Team";

        message.setText(text);
        javaMailSender.send(message);
    }

    @Override
    public void sendInvitationEmail(String to, String fullName, String username, String temporaryPassword,
                                    String organizationName, String inviterName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(noReplyEmail);
        message.setTo(to);
        message.setSubject("You have been invited to " + organizationName + " on MY-EPM");

        String text = "Hello " + fullName + ",\n\n"
                + inviterName + " has invited you to join " + organizationName + " on MY-EPM.\n\n"
                + "Your account has been created with the following credentials:\n"
                + "Username: " + username + "\n"
                + "Temporary password: " + temporaryPassword + "\n\n"
                + "Sign in at " + frontendUrl + "/login and change your password as soon as possible.\n\n"
                + "Thank you,\n"
                + "The MY-EPM Team";

        message.setText(text);
        javaMailSender.send(message);
    }
}