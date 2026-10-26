package com.cybersystems;

import com.cybersystems.domain.PlayerProfile;
import com.cybersystems.service.AiServiceUnavailableException;
import com.cybersystems.service.DataServiceUnavailableException;
import com.cybersystems.service.HintProvider;
import com.cybersystems.service.PlayerProfileRepository;
import com.cybersystems.service.Weather;
import com.cybersystems.service.WeatherProvider;
import com.cybersystems.service.WeatherUnavailableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class GameApiTest {

    static final String USER = "user-1";

    @Autowired
    MockMvc mvc;

    @MockBean
    PlayerProfileRepository profiles;

    @MockBean
    HintProvider hints;

    @MockBean
    WeatherProvider weather;

    String auth;

    @BeforeEach
    void setUp() {
        auth = "Bearer " + TestTokens.forUser(USER);
        when(profiles.findByUserId(USER)).thenReturn(Optional.of(new PlayerProfile("p-1", "egor", "1.1")));
    }

    @Test
    void levelsArePublic() throws Exception {
        mvc.perform(get("/api/levels"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(12));
    }

    @Test
    void profileNeedsToken() throws Exception {
        mvc.perform(get("/api/profile")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/profile").header("Authorization", "Bearer bad")).andExpect(status().isUnauthorized());
    }

    @Test
    void preflightIsNotBlocked() throws Exception {
        mvc.perform(options("/api/profile")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "authorization"))
                .andExpect(status().isOk());
    }

    @Test
    void profileOfCurrentUserIsReturned() throws Exception {
        mvc.perform(get("/api/profile").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("egor"))
                .andExpect(jsonPath("$.currentLevelId").value("1.1"));
    }

    @Test
    void missingProfileGivesNotFound() throws Exception {
        when(profiles.findByUserId(USER)).thenReturn(Optional.empty());

        mvc.perform(get("/api/profile").header("Authorization", auth)).andExpect(status().isNotFound());
    }

    @Test
    void progressIsSavedForKnownLevel() throws Exception {
        when(profiles.updateCurrentLevel("p-1", "1.2")).thenReturn(new PlayerProfile("p-1", "egor", "1.2"));

        mvc.perform(post("/api/profile/progress").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"levelId\":\"1.2\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentLevelId").value("1.2"));
    }

    @Test
    void progressForUnknownLevelIsRejected() throws Exception {
        mvc.perform(post("/api/profile/progress").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"levelId\":\"9.9\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void nicknameIsSaved() throws Exception {
        when(profiles.updateNickname("p-1", "Дрон")).thenReturn(new PlayerProfile("p-1", "Дрон", "1.1"));

        mvc.perform(post("/api/profile/nickname").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"nickname\":\"Дрон\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("Дрон"));
    }

    @Test
    void blankNicknameIsRejected() throws Exception {
        mvc.perform(post("/api/profile/nickname").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"nickname\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void nextLevelFollowsCurrentOne() throws Exception {
        mvc.perform(get("/api/profile/next-level").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("1.2"));
    }

    @Test
    void nextLevelIsEmptyAfterTheLastOne() throws Exception {
        when(profiles.findByUserId(USER)).thenReturn(Optional.of(new PlayerProfile("p-1", "egor", "3.boss")));

        mvc.perform(get("/api/profile/next-level").header("Authorization", auth)).andExpect(status().isNoContent());
    }

    @Test
    void attemptIsPassedToDataService() throws Exception {
        mvc.perform(post("/api/attempts").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"levelId\":\"1.1\",\"program\":\"move\",\"success\":true}"))
                .andExpect(status().isCreated());

        verify(profiles).saveAttempt("p-1", "1.1", "move", true);
    }

    @Test
    void attemptForUnknownLevelIsRejected() throws Exception {
        mvc.perform(post("/api/attempts").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"levelId\":\"9.9\",\"program\":\"move\",\"success\":true}"))
                .andExpect(status().isBadRequest());
        org.mockito.Mockito.verify(profiles, org.mockito.Mockito.never()).saveAttempt(any(), any(), any(), anyBoolean());
    }

    @Test
    void completedLevelsAreListed() throws Exception {
        when(profiles.findCompletedLevelIds("p-1")).thenReturn(List.of("1.1", "1.2"));

        mvc.perform(get("/api/profile/completed-levels").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0]").value("1.1"));
    }

    @Test
    void dataServiceOutageGivesBadGateway() throws Exception {
        when(profiles.findByUserId(eq(USER))).thenThrow(new DataServiceUnavailableException("down", new RuntimeException()));

        mvc.perform(get("/api/profile").header("Authorization", auth)).andExpect(status().isBadGateway());
    }

    @Test
    void hintGetsAttemptNumberFromHistory() throws Exception {
        when(profiles.countAttempts("p-1", "1.2")).thenReturn(4);
        when(hints.hint(eq("1.2"), any(), eq(4))).thenReturn(Map.of("verdict", "blocked", "hint", "Поверни раньше"));

        mvc.perform(post("/api/hint").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"levelId\":\"1.2\",\"program\":[\"move\",{\"type\":\"loop\",\"count\":2,\"body\":[\"move\"]}]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verdict").value("blocked"));
    }

    @Test
    void firstHintStartsFromAttemptOne() throws Exception {
        when(profiles.countAttempts("p-1", "1.1")).thenReturn(0);
        when(hints.hint(eq("1.1"), any(), eq(1))).thenReturn(Map.of("verdict", "empty"));

        mvc.perform(post("/api/hint").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"levelId\":\"1.1\",\"program\":[]}"))
                .andExpect(status().isOk());
    }

    @Test
    void hintForUnknownLevelIsRejected() throws Exception {
        mvc.perform(post("/api/hint").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"levelId\":\"9.9\",\"program\":[]}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void hintNeedsToken() throws Exception {
        mvc.perform(post("/api/hint").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"levelId\":\"1.1\",\"program\":[]}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void aiOutageGivesBadGateway() throws Exception {
        when(hints.hint(any(), any(), org.mockito.ArgumentMatchers.anyInt()))
                .thenThrow(new AiServiceUnavailableException("down", new RuntimeException()));

        mvc.perform(post("/api/hint").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"levelId\":\"1.1\",\"program\":[\"move\"]}"))
                .andExpect(status().isBadGateway());
    }

    @Test
    void weatherComesFromExternalService() throws Exception {
        when(weather.current()).thenReturn(new Weather("Уфа", -3.5, 12.0, "снег"));

        mvc.perform(get("/api/external/weather").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.city").value("Уфа"))
                .andExpect(jsonPath("$.temperatureC").value(-3.5))
                .andExpect(jsonPath("$.description").value("снег"));
    }

    @Test
    void weatherNeedsToken() throws Exception {
        mvc.perform(get("/api/external/weather")).andExpect(status().isUnauthorized());
    }

    @Test
    void weatherOutageGivesBadGateway() throws Exception {
        when(weather.current()).thenThrow(new WeatherUnavailableException("down", new RuntimeException()));

        mvc.perform(get("/api/external/weather").header("Authorization", auth)).andExpect(status().isBadGateway());
    }
}
