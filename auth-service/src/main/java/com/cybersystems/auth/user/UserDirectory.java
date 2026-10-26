package com.cybersystems.auth.user;

import java.util.Optional;

/** Где лежат пользователи. Сейчас это data-service, но сервис авторизации об этом не знает. */
public interface UserDirectory {

    Optional<UserRecord> findByLogin(String login);

    /** @throws LoginTakenException если такой логин уже есть */
    UserRecord create(String login, String passwordHash);
}
