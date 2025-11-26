package com.cybersystems.api.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateNicknameRequest {

    @NotBlank
    private String nickname;

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }
}


