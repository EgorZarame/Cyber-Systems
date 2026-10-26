package com.cybersystems.data.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class UserAccount {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String login;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected UserAccount() {
    }

    public UserAccount(String login, String passwordHash) {
        this.id = UUID.randomUUID();
        this.login = login;
        this.passwordHash = passwordHash;
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public String getLogin() {
        return login;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
