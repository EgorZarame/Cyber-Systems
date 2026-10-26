package com.cybersystems.data;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProfileApiTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    String profileId;

    @BeforeEach
    void createPlayer() throws Exception {
        String login = "p" + UUID.randomUUID().toString().substring(0, 8);
        String user = mvc.perform(post("/internal/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"" + login + "\",\"passwordHash\":\"hash\"}"))
                .andReturn().getResponse().getContentAsString();
        String userId = json.readTree(user).get("id").asText();
        String profile = mvc.perform(get("/internal/profiles/by-user/" + userId))
                .andReturn().getResponse().getContentAsString();
        profileId = json.readTree(profile).get("id").asText();
    }

    private void attempt(String level, boolean success) throws Exception {
        mvc.perform(post("/internal/profiles/" + profileId + "/attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"levelId\":\"" + level + "\",\"program\":\"move\",\"success\":" + success + "}"))
                .andExpect(status().isCreated());
    }

    @Test
    void nicknameCanBeChanged() throws Exception {
        mvc.perform(put("/internal/profiles/" + profileId + "/nickname")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nickname\":\"Дрон-1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("Дрон-1"));
    }

    @Test
    void blankNicknameIsRejected() throws Exception {
        mvc.perform(put("/internal/profiles/" + profileId + "/nickname")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nickname\":\"  \"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void currentLevelCanBeChanged() throws Exception {
        mvc.perform(put("/internal/profiles/" + profileId + "/current-level")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"levelId\":\"2.1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentLevelId").value("2.1"));
        mvc.perform(get("/internal/profiles/" + profileId))
                .andExpect(jsonPath("$.currentLevelId").value("2.1"));
    }

    @Test
    void successfulAttemptMarksLevelCompletedOnlyOnce() throws Exception {
        attempt("1.1", false);
        mvc.perform(get("/internal/profiles/" + profileId + "/completed-levels"))
                .andExpect(jsonPath("$.length()").value(0));

        attempt("1.1", true);
        attempt("1.1", true);
        mvc.perform(get("/internal/profiles/" + profileId + "/completed-levels"))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].levelId").value("1.1"));
    }

    @Test
    void attemptsAreFilteredByLevelAndLimited() throws Exception {
        attempt("1.1", false);
        attempt("1.2", false);
        attempt("1.2", true);

        mvc.perform(get("/internal/profiles/" + profileId + "/attempts"))
                .andExpect(jsonPath("$.length()").value(3));
        mvc.perform(get("/internal/profiles/" + profileId + "/attempts").param("levelId", "1.2"))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].success").value(true));
        mvc.perform(get("/internal/profiles/" + profileId + "/attempts").param("limit", "1"))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void unknownProfileGivesNotFound() throws Exception {
        String missing = UUID.randomUUID().toString();
        mvc.perform(get("/internal/profiles/" + missing)).andExpect(status().isNotFound());
        mvc.perform(get("/internal/profiles/by-user/" + missing)).andExpect(status().isNotFound());
        mvc.perform(get("/internal/profiles/" + missing + "/completed-levels")).andExpect(status().isNotFound());
        mvc.perform(post("/internal/profiles/" + missing + "/attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"levelId\":\"1.1\",\"program\":\"x\",\"success\":true}"))
                .andExpect(status().isNotFound());
    }
}
