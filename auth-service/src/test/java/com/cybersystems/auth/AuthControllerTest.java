package com.cybersystems.auth;

import com.cybersystems.auth.user.DataServiceUnavailableException;
import com.cybersystems.auth.user.LoginTakenException;
import com.cybersystems.auth.user.UserDirectory;
import com.cybersystems.auth.user.UserRecord;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    @Autowired
    PasswordEncoder encoder;

    @MockBean
    UserDirectory users;

    private String creds(String login, String password) {
        return "{\"login\":\"" + login + "\",\"password\":\"" + password + "\"}";
    }

    @Test
    void registerReturnsTokenAndCreatedStatus() throws Exception {
        UUID id = UUID.randomUUID();
        when(users.create(eq("egor"), any())).thenReturn(new UserRecord(id, "egor", "hash"));

        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(creds("egor", "secret123")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.userId").value(id.toString()))
                .andExpect(jsonPath("$.login").value("egor"));
    }

    @Test
    void takenLoginGivesConflict() throws Exception {
        when(users.create(eq("egor"), any())).thenThrow(new LoginTakenException("egor"));

        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(creds("egor", "secret123")))
                .andExpect(status().isConflict());
    }

    @Test
    void weakInputIsRejected() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(creds("eg", "123")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("bad_request"));
    }

    @Test
    void loginAndMeWork() throws Exception {
        UUID id = UUID.randomUUID();
        when(users.findByLogin("egor")).thenReturn(Optional.of(new UserRecord(id, "egor", encoder.encode("secret123"))));

        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(creds("egor", "secret123")))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String token = json.readTree(body).get("token").asText();

        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(id.toString()))
                .andExpect(jsonPath("$.login").value("egor"));
    }

    @Test
    void wrongPasswordGivesUnauthorized() throws Exception {
        when(users.findByLogin("egor")).thenReturn(Optional.of(new UserRecord(UUID.randomUUID(), "egor", encoder.encode("secret123"))));

        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(creds("egor", "wrong-pass")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meWithoutOrWithBadTokenGivesUnauthorized() throws Exception {
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer nonsense")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").header("Authorization", "Basic abc")).andExpect(status().isUnauthorized());
    }

    @Test
    void dataServiceOutageGivesBadGateway() throws Exception {
        when(users.findByLogin("egor")).thenThrow(new DataServiceUnavailableException("down", new RuntimeException()));

        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(creds("egor", "secret123")))
                .andExpect(status().isBadGateway());
    }
}
