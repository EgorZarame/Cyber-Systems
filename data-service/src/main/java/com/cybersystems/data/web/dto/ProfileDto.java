package com.cybersystems.data.web.dto;

import com.cybersystems.data.domain.PlayerProfile;

import java.util.UUID;

public record ProfileDto(UUID id, UUID userId, String nickname, String currentLevelId) {

    public static ProfileDto from(PlayerProfile p) {
        return new ProfileDto(p.getId(), p.getUserId(), p.getNickname(), p.getCurrentLevelId());
    }
}
