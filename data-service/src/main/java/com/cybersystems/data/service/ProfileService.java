package com.cybersystems.data.service;

import com.cybersystems.data.domain.Attempt;
import com.cybersystems.data.domain.LevelProgress;
import com.cybersystems.data.domain.PlayerProfile;
import com.cybersystems.data.repository.AttemptRepository;
import com.cybersystems.data.repository.LevelProgressRepository;
import com.cybersystems.data.repository.ProfileRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProfileService {

    private final ProfileRepository profiles;
    private final LevelProgressRepository progress;
    private final AttemptRepository attempts;

    public ProfileService(ProfileRepository profiles,
                          LevelProgressRepository progress,
                          AttemptRepository attempts) {
        this.profiles = profiles;
        this.progress = progress;
        this.attempts = attempts;
    }

    @Transactional(readOnly = true)
    public PlayerProfile getById(UUID id) {
        return profiles.findById(id)
                .orElseThrow(() -> new NotFoundException("Профиль " + id + " не найден"));
    }

    @Transactional(readOnly = true)
    public PlayerProfile getByUserId(UUID userId) {
        return profiles.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("У пользователя " + userId + " нет профиля"));
    }

    @Transactional
    public PlayerProfile updateNickname(UUID profileId, String nickname) {
        PlayerProfile profile = getById(profileId);
        profile.setNickname(nickname);
        return profiles.save(profile);
    }

    @Transactional
    public PlayerProfile updateCurrentLevel(UUID profileId, String levelId) {
        PlayerProfile profile = getById(profileId);
        profile.setCurrentLevelId(levelId);
        return profiles.save(profile);
    }

    /** Сохраняет попытку; если она успешная, уровень попадает в список пройденных (один раз). */
    @Transactional
    public Attempt addAttempt(UUID profileId, String levelId, String program, boolean success) {
        getById(profileId);
        Attempt attempt = attempts.save(new Attempt(profileId, levelId, program, success));
        if (success && !progress.existsByProfileIdAndLevelId(profileId, levelId)) {
            progress.save(new LevelProgress(profileId, levelId));
        }
        return attempt;
    }

    @Transactional(readOnly = true)
    public List<LevelProgress> getCompletedLevels(UUID profileId) {
        getById(profileId);
        return progress.findByProfileIdOrderByCompletedAt(profileId);
    }

    @Transactional(readOnly = true)
    public List<Attempt> getAttempts(UUID profileId, String levelId, int limit) {
        getById(profileId);
        PageRequest page = PageRequest.of(0, limit);
        if (levelId == null || levelId.isBlank()) {
            return attempts.findByProfileIdOrderByCreatedAtDesc(profileId, page);
        }
        return attempts.findByProfileIdAndLevelIdOrderByCreatedAtDesc(profileId, levelId, page);
    }
}
