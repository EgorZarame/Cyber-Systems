package com.cybersystems.api;

import com.cybersystems.api.dto.PlayerProfileDto;
import com.cybersystems.api.dto.UpdateNicknameRequest;
import com.cybersystems.api.dto.UpdateProgressRequest;
import com.cybersystems.domain.LevelInfo;
import com.cybersystems.domain.PlayerProfile;
import com.cybersystems.service.LevelCatalogService;
import com.cybersystems.service.PlayerProfileServiceContract;
import com.cybersystems.service.ProgressionStrategy;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class GameController {

    private final LevelCatalogService levelCatalog;
    private final PlayerProfileServiceContract playerProfileService;
    private final ProgressionStrategy progressionStrategy;

    public GameController(LevelCatalogService levelCatalog,
                          PlayerProfileServiceContract playerProfileService,
                          ProgressionStrategy progressionStrategy) {
        this.levelCatalog = levelCatalog;
        this.playerProfileService = playerProfileService;
        this.progressionStrategy = progressionStrategy;
    }

    @GetMapping("/levels")
    public List<LevelInfo> getLevels() {
        return levelCatalog.getAllLevels();
    }

    @GetMapping("/profile")
    public ResponseEntity<PlayerProfileDto> getProfile() {
        PlayerProfile profile = playerProfileService.getSingleProfile();
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(PlayerProfileDto.fromDomain(profile));
    }

    @PostMapping("/profile/progress")
    public PlayerProfileDto updateProgress(@Valid @RequestBody UpdateProgressRequest request) {
        PlayerProfile updated = playerProfileService.updateProgress(request.getLevelId());
        return PlayerProfileDto.fromDomain(updated);
    }

    @PostMapping("/profile/nickname")
    public PlayerProfileDto updateNickname(@Valid @RequestBody UpdateNicknameRequest request) {
        PlayerProfile updated = playerProfileService.updateNickname(request.getNickname());
        return PlayerProfileDto.fromDomain(updated);
    }

    @GetMapping("/profile/next-level")
    public ResponseEntity<LevelInfo> getNextLevel() {
        PlayerProfile profile = playerProfileService.getSingleProfile();
        LevelInfo next = progressionStrategy.getNextLevel(profile, levelCatalog);
        if (next == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(next);
    }
}


