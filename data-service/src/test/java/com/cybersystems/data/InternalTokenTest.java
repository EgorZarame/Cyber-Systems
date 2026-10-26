package com.cybersystems.data;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "internal.token=test-secret")
@AutoConfigureMockMvc
class InternalTokenTest {

    @Autowired
    MockMvc mvc;

    @Test
    void requestWithoutTokenIsRejected() throws Exception {
        mvc.perform(get("/internal/users/" + UUID.randomUUID()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void requestWithWrongTokenIsRejected() throws Exception {
        mvc.perform(get("/internal/users/" + UUID.randomUUID()).header("X-Internal-Token", "other"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void requestWithRightTokenPassesTheFilter() throws Exception {
        mvc.perform(get("/internal/users/" + UUID.randomUUID()).header("X-Internal-Token", "test-secret"))
                .andExpect(status().isNotFound());
    }
}
