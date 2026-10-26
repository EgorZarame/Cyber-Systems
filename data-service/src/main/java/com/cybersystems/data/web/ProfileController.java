package com.cybersystems.data.web;

import com.cybersystems.data.service.ProfileService;
import com.cybersystems.data.web.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/internal/profiles")
public class ProfileController {

    private static final int MAX_ATTEMPTS = 50;

    private final ProfileService profiles;

    public ProfileController(ProfileService profiles) {
        this.profiles = profiles;
    }

    @GetMapping("/{id}")
    public ProfileDto get(@PathVariable UUID id) {
        return ProfileDto.from(profiles.getById(id));
    }

    @GetMapping("/by-user/{userId}")
    public ProfileDto byUser(@PathVariable UUID userId) {
        return ProfileDto.from(profiles.getByUserId(userId));
    }

    @PutMapping("/{id}/nickname")
    public ProfileDto nickname(@PathVariable UUID id, @Valid @RequestBody NicknameRequest request) {
        return ProfileDto.from(profiles.updateNickname(id, request.nickname()));
    }

    @PutMapping("/{id}/current-level")
    public ProfileDto currentLevel(@PathVariable UUID id, @Valid @RequestBody LevelRequest request) {
        return ProfileDto.from(profiles.updateCurrentLevel(id, request.levelId()));
    }

    @PostMapping("/{id}/attempts")
    @ResponseStatus(HttpStatus.CREATED)
    public AttemptDto addAttempt(@PathVariable UUID id, @Valid @RequestBody AttemptRequest request) {
        return AttemptDto.from(profiles.addAttempt(id, request.levelId(), request.program(), request.success()));
    }

    @GetMapping("/{id}/attempts")
    public List<AttemptDto> attempts(@PathVariable UUID id,
                                     @RequestParam(required = false) String levelId,
                                     @RequestParam(defaultValue = "10") int limit) {
        int safeLimit = Math.max(1, Math.min(limit, MAX_ATTEMPTS));
        return profiles.getAttempts(id, levelId, safeLimit).stream().map(AttemptDto::from).toList();
    }

    @GetMapping("/{id}/completed-levels")
    public List<CompletedLevelDto> completed(@PathVariable UUID id) {
        return profiles.getCompletedLevels(id).stream().map(CompletedLevelDto::from).toList();
    }
}
