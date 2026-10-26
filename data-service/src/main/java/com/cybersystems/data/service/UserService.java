package com.cybersystems.data.service;

import com.cybersystems.data.domain.PlayerProfile;
import com.cybersystems.data.domain.UserAccount;
import com.cybersystems.data.repository.ProfileRepository;
import com.cybersystems.data.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    static final String START_LEVEL = "1.1";

    private final UserRepository users;
    private final ProfileRepository profiles;

    public UserService(UserRepository users, ProfileRepository profiles) {
        this.users = users;
        this.profiles = profiles;
    }

    /** Создаёт пользователя вместе с его профилем: ник по умолчанию равен логину. */
    @Transactional
    public UserAccount register(String login, String passwordHash) {
        if (users.existsByLogin(login)) {
            throw new ConflictException("Пользователь с логином " + login + " уже есть");
        }
        UserAccount user = users.save(new UserAccount(login, passwordHash));
        profiles.save(new PlayerProfile(user.getId(), login, START_LEVEL));
        return user;
    }

    @Transactional(readOnly = true)
    public UserAccount getByLogin(String login) {
        return users.findByLogin(login)
                .orElseThrow(() -> new NotFoundException("Пользователь " + login + " не найден"));
    }

    @Transactional(readOnly = true)
    public UserAccount getById(UUID id) {
        return users.findById(id)
                .orElseThrow(() -> new NotFoundException("Пользователь " + id + " не найден"));
    }
}
