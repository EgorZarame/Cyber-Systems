package com.cybersystems.service;

public class ProfileNotFoundException extends RuntimeException {

    public ProfileNotFoundException(String userId) {
        super("Профиль пользователя " + userId + " не найден");
    }
}
