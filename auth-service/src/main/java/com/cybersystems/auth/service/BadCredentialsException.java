package com.cybersystems.auth.service;

public class BadCredentialsException extends RuntimeException {

    public BadCredentialsException() {
        super("Неверный логин или пароль");
    }
}
