package com.cybersystems;

import com.cybersystems.domain.PlayerProfile;
import com.cybersystems.service.DataServiceProfileRepository;
import com.cybersystems.service.DataServiceUnavailableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class DataServiceProfileRepositoryTest {

    static final String PROFILE = "{\"id\":\"p-1\",\"userId\":\"u-1\",\"nickname\":\"egor\",\"currentLevelId\":\"1.1\"}";

    MockRestServiceServer server;
    DataServiceProfileRepository repository;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        repository = new DataServiceProfileRepository(builder, "http://data", "tok");
    }

    @Test
    void findsProfileAndSendsToken() {
        server.expect(requestTo("http://data/internal/profiles/by-user/u-1"))
                .andExpect(header("X-Internal-Token", "tok"))
                .andRespond(withSuccess(PROFILE, MediaType.APPLICATION_JSON));

        Optional<PlayerProfile> profile = repository.findByUserId("u-1");

        assertThat(profile).isPresent();
        assertThat(profile.get().getId()).isEqualTo("p-1");
        assertThat(profile.get().getNickname()).isEqualTo("egor");
    }

    @Test
    void missingProfileGivesEmpty() {
        server.expect(requestTo("http://data/internal/profiles/by-user/u-2"))
                .andRespond(withStatus(HttpStatus.NOT_FOUND).contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"not_found\",\"message\":\"нет\"}"));

        assertThat(repository.findByUserId("u-2")).isEmpty();
    }

    @Test
    void nicknameAndLevelAreSentWithPut() {
        server.expect(requestTo("http://data/internal/profiles/p-1/nickname"))
                .andExpect(method(HttpMethod.PUT))
                .andExpect(content().json("{\"nickname\":\"Дрон\"}"))
                .andRespond(withSuccess(PROFILE.replace("egor", "Дрон"), MediaType.APPLICATION_JSON));
        server.expect(requestTo("http://data/internal/profiles/p-1/current-level"))
                .andExpect(method(HttpMethod.PUT))
                .andExpect(content().json("{\"levelId\":\"2.1\"}"))
                .andRespond(withSuccess(PROFILE.replace("1.1", "2.1"), MediaType.APPLICATION_JSON));

        assertThat(repository.updateNickname("p-1", "Дрон").getNickname()).isEqualTo("Дрон");
        assertThat(repository.updateCurrentLevel("p-1", "2.1").getCurrentLevelId()).isEqualTo("2.1");
        server.verify();
    }

    @Test
    void attemptIsPosted() {
        server.expect(requestTo("http://data/internal/profiles/p-1/attempts"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().json("{\"levelId\":\"1.1\",\"program\":\"move\",\"success\":true}"))
                .andRespond(withStatus(HttpStatus.CREATED));

        repository.saveAttempt("p-1", "1.1", "move", true);

        server.verify();
    }

    @Test
    void completedLevelsAreMappedToIds() {
        server.expect(requestTo("http://data/internal/profiles/p-1/completed-levels"))
                .andRespond(withSuccess("[{\"levelId\":\"1.1\",\"completedAt\":\"2026-10-26T10:00:00\"},{\"levelId\":\"1.2\",\"completedAt\":\"2026-10-26T10:05:00\"}]",
                        MediaType.APPLICATION_JSON));

        assertThat(repository.findCompletedLevelIds("p-1")).isEqualTo(List.of("1.1", "1.2"));
    }

    @Test
    void attemptsAreCounted() {
        server.expect(requestTo("http://data/internal/profiles/p-1/attempts?levelId=1.1&limit=50"))
                .andRespond(withSuccess("[{\"levelId\":\"1.1\"},{\"levelId\":\"1.1\"},{\"levelId\":\"1.1\"}]",
                        MediaType.APPLICATION_JSON));

        assertThat(repository.countAttempts("p-1", "1.1")).isEqualTo(3);
    }

    @Test
    void serverErrorBecomesUnavailable() {
        server.expect(requestTo("http://data/internal/profiles/by-user/u-1"))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        assertThatThrownBy(() -> repository.findByUserId("u-1")).isInstanceOf(DataServiceUnavailableException.class);
    }
}
