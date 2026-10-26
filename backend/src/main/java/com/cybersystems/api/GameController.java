package com.cybersystems.api;

import com.cybersystems.api.dto.PlayerProfileDto;
import com.cybersystems.api.dto.AttemptRequest;
import com.cybersystems.api.dto.HintRequest;
import com.cybersystems.api.dto.UpdateNicknameRequest;
import com.cybersystems.api.dto.UpdateProgressRequest;
import com.cybersystems.domain.LevelInfo;
import com.cybersystems.domain.PlayerProfile;
import com.cybersystems.security.AuthFilter;
import com.cybersystems.service.HintProvider;
import com.cybersystems.service.LevelCatalogService;
import com.cybersystems.service.PlayerProfileServiceContract;
import com.cybersystems.service.ProgressionStrategy;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class GameController {

    private final LevelCatalogService levelCatalog;
    private final PlayerProfileServiceContract playerProfileService;
    private final ProgressionStrategy progressionStrategy;
    private final HintProvider hintProvider;

    public GameController(LevelCatalogService levelCatalog,
                          PlayerProfileServiceContract playerProfileService,
                          ProgressionStrategy progressionStrategy,
                          HintProvider hintProvider) {
        this.levelCatalog = levelCatalog;
        this.playerProfileService = playerProfileService;
        this.progressionStrategy = progressionStrategy;
        this.hintProvider = hintProvider;
    }

    @GetMapping("/levels")
    public List<LevelInfo> getLevels() {
        return levelCatalog.getAllLevels();
    }

    @GetMapping("/profile")
    public PlayerProfileDto getProfile(@RequestAttribute(AuthFilter.USER_ID) String userId) {
        return PlayerProfileDto.fromDomain(playerProfileService.getProfile(userId));
    }

    @PostMapping("/profile/progress")
    public PlayerProfileDto updateProgress(@RequestAttribute(AuthFilter.USER_ID) String userId,
                                           @Valid @RequestBody UpdateProgressRequest request) {
        PlayerProfile updated = playerProfileService.updateProgress(userId, request.getLevelId());
        return PlayerProfileDto.fromDomain(updated);
    }

    @PostMapping("/profile/nickname")
    public PlayerProfileDto updateNickname(@RequestAttribute(AuthFilter.USER_ID) String userId,
                                           @Valid @RequestBody UpdateNicknameRequest request) {
        PlayerProfile updated = playerProfileService.updateNickname(userId, request.getNickname());
        return PlayerProfileDto.fromDomain(updated);
    }

    @GetMapping("/profile/next-level")
    public ResponseEntity<LevelInfo> getNextLevel(@RequestAttribute(AuthFilter.USER_ID) String userId) {
        PlayerProfile profile = playerProfileService.getProfile(userId);
        LevelInfo next = progressionStrategy.getNextLevel(profile, levelCatalog);
        if (next == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(next);
    }

    @GetMapping("/profile/completed-levels")
    public List<String> getCompletedLevels(@RequestAttribute(AuthFilter.USER_ID) String userId) {
        return playerProfileService.getCompletedLevelIds(userId);
    }

    @PostMapping("/attempts")
    @ResponseStatus(HttpStatus.CREATED)
    public void saveAttempt(@RequestAttribute(AuthFilter.USER_ID) String userId,
                            @Valid @RequestBody AttemptRequest request) {
        playerProfileService.recordAttempt(userId, request.getLevelId(), request.getProgram(), request.isSuccess());
    }

    @PostMapping("/hint")
    public Map<String, Object> hint(@RequestAttribute(AuthFilter.USER_ID) String userId,
                                    @Valid @RequestBody HintRequest request) {
        if (!levelCatalog.exists(request.getLevelId())) {
            throw new IllegalArgumentException("Уровень с id=" + request.getLevelId() + " не найден");
        }
        // подсказка становится подробнее, когда игрок пробует уровень не в первый раз
        int attempt = Math.max(1, playerProfileService.countAttempts(userId, request.getLevelId()));
        return hintProvider.hint(request.getLevelId(), request.getProgram(), attempt);
    }
}
