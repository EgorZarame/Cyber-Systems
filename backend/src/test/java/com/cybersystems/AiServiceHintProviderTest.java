package com.cybersystems;

import com.cybersystems.service.AiServiceHintProvider;
import com.cybersystems.service.AiServiceUnavailableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class AiServiceHintProviderTest {

    MockRestServiceServer server;
    AiServiceHintProvider provider;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        provider = new AiServiceHintProvider(builder, "http://ai", "tok");
    }

    @Test
    void sendsProgramAndReturnsAnswer() {
        server.expect(requestTo("http://ai/internal/hint"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("X-Internal-Token", "tok"))
                .andExpect(content().json("{\"levelId\":\"1.1\",\"program\":[\"move\"],\"attempts\":2}"))
                .andRespond(withSuccess("{\"verdict\":\"stopped_short\",\"hint\":\"Добавь блоков\"}", MediaType.APPLICATION_JSON));

        Map<String, Object> answer = provider.hint("1.1", List.of("move"), 2);

        assertThat(answer).containsEntry("verdict", "stopped_short");
        server.verify();
    }

    @Test
    void rejectedProgramBecomesBadRequest() {
        server.expect(requestTo("http://ai/internal/hint")).andRespond(withStatus(HttpStatus.UNPROCESSABLE_ENTITY));

        assertThatThrownBy(() -> provider.hint("1.1", List.of("jump"), 1)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void serverErrorBecomesUnavailable() {
        server.expect(requestTo("http://ai/internal/hint")).andRespond(withStatus(HttpStatus.BAD_GATEWAY));

        assertThatThrownBy(() -> provider.hint("1.1", List.of("move"), 1)).isInstanceOf(AiServiceUnavailableException.class);
    }
}
