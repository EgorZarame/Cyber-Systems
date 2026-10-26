package com.cybersystems.data.web.dto;

import com.cybersystems.data.domain.UserAccount;

import java.util.UUID;

/** Хэш пароля отдаём только auth-сервису, чтобы тот проверил вход. */
public record UserDto(UUID id, String login, String passwordHash) {

    public static UserDto from(UserAccount user) {
        return new UserDto(user.getId(), user.getLogin(), user.getPasswordHash());
    }
}
