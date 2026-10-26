package com.cybersystems.auth.user;

public class LoginTakenException extends RuntimeException {

    public LoginTakenException(String login) {
        super("Логин " + login + " уже занят");
    }
}
