package com.cybersystems.data.repository;

import com.cybersystems.data.domain.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserAccount, UUID> {

    Optional<UserAccount> findByLogin(String login);

    boolean existsByLogin(String login);
}
