package com.cybersystems.auth;

import com.cybersystems.auth.user.DataServiceUnavailableException;
import com.cybersystems.auth.user.HttpUserDirectory;
import com.cybersystems.auth.user.LoginTakenException;
import com.cybersystems.auth.user.UserRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class HttpUserDirectoryTest {

    static final String ID = "4ddb43ad-dc69-40e7-8a94-c606bcc2cad8";

    MockRestServiceServer server;
    HttpUserDirectory directory;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        directory = new HttpUserDirectory(builder, "http://data", "tok");
    }

    @Test
    void findsExistingUserAndSendsToken() {
        server.expect(requestTo("http://data/internal/users/by-login/egor"))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header("X-Internal-Token", "tok"))
                .andRespond(withSuccess("{\"id\":\"" + ID + "\",\"login\":\"egor\",\"passwordHash\":\"h\"}", MediaType.APPLICATION_JSON));

        Optional<UserRecord> user = directory.findByLogin("egor");

        assertThat(user).isPresent();
        assertThat(user.get().login()).isEqualTo("egor");
        server.verify();
    }

    @Test
    void missingUserGivesEmpty() {
        server.expect(requestTo("http://data/internal/users/by-login/nobody"))
                .andRespond(withStatus(HttpStatus.NOT_FOUND).contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"not_found\",\"message\":\"нет\"}"));

        assertThat(directory.findByLogin("nobody")).isEmpty();
    }

    @Test
    void createReturnsUser() {
        server.expect(requestTo("http://data/internal/users"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.CREATED).contentType(MediaType.APPLICATION_JSON)
                        .body("{\"id\":\"" + ID + "\",\"login\":\"egor\",\"passwordHash\":\"h\"}"));

        assertThat(directory.create("egor", "h").login()).isEqualTo("egor");
    }

    @Test
    void conflictBecomesLoginTaken() {
        server.expect(requestTo("http://data/internal/users"))
                .andRespond(withStatus(HttpStatus.CONFLICT).contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"conflict\",\"message\":\"занят\"}"));

        assertThatThrownBy(() -> directory.create("egor", "h")).isInstanceOf(LoginTakenException.class);
    }

    @Test
    void serverErrorBecomesUnavailable() {
        server.expect(requestTo("http://data/internal/users/by-login/egor"))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        assertThatThrownBy(() -> directory.findByLogin("egor")).isInstanceOf(DataServiceUnavailableException.class);
    }
}
