package com.cybersystems.data;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UserApiTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    private String uniqueLogin() {
        return "user" + UUID.randomUUID().toString().substring(0, 8);
    }

    private JsonNode register(String login) throws Exception {
        String body = mvc.perform(post("/internal/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"" + login + "\",\"passwordHash\":\"hash\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body);
    }

    @Test
    void registerCreatesUserAndDefaultProfile() throws Exception {
        String login = uniqueLogin();
        JsonNode user = register(login);

        mvc.perform(get("/internal/profiles/by-user/" + user.get("id").asText()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value(login))
                .andExpect(jsonPath("$.currentLevelId").value("1.1"));
    }

    @Test
    void duplicateLoginGivesConflict() throws Exception {
        String login = uniqueLogin();
        register(login);

        mvc.perform(post("/internal/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"" + login + "\",\"passwordHash\":\"hash\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("conflict"));
    }

    @Test
    void shortLoginIsRejected() throws Exception {
        mvc.perform(post("/internal/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"ab\",\"passwordHash\":\"hash\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("bad_request"));
    }

    @Test
    void userCanBeFoundByLoginAndById() throws Exception {
        String login = uniqueLogin();
        JsonNode user = register(login);

        mvc.perform(get("/internal/users/by-login/" + login))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.get("id").asText()))
                .andExpect(jsonPath("$.passwordHash").value("hash"));
        mvc.perform(get("/internal/users/" + user.get("id").asText()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.login").value(login));
    }

    @Test
    void unknownUserGivesNotFound() throws Exception {
        mvc.perform(get("/internal/users/by-login/" + uniqueLogin()))
                .andExpect(status().isNotFound());
        mvc.perform(get("/internal/users/" + UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }
}
