package com.cybersystems;

import com.cybersystems.service.OpenMeteoWeatherProvider;
import com.cybersystems.service.Weather;
import com.cybersystems.service.WeatherUnavailableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class OpenMeteoWeatherProviderTest {

    static final String URL = "http://weather/v1/forecast?latitude=54.74&longitude=55.97"
            + "&current=temperature_2m,wind_speed_10m,weather_code";

    MockRestServiceServer server;
    OpenMeteoWeatherProvider provider;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        provider = new OpenMeteoWeatherProvider(builder, "http://weather", "Уфа", 54.74, 55.97);
    }

    @Test
    void readsCurrentWeather() {
        server.expect(requestTo(URL)).andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("{\"current\":{\"temperature_2m\":-3.5,\"wind_speed_10m\":12.0,\"weather_code\":71}}",
                        MediaType.APPLICATION_JSON));

        Weather weather = provider.current();

        assertThat(weather.city()).isEqualTo("Уфа");
        assertThat(weather.temperatureC()).isEqualTo(-3.5);
        assertThat(weather.windKmh()).isEqualTo(12.0);
        assertThat(weather.description()).isEqualTo("снег");
        server.verify();
    }

    @Test
    void secondCallUsesCache() {
        server.expect(once(), requestTo(URL))
                .andRespond(withSuccess("{\"current\":{\"temperature_2m\":1,\"wind_speed_10m\":2,\"weather_code\":0}}",
                        MediaType.APPLICATION_JSON));

        Weather first = provider.current();
        Weather second = provider.current();

        assertThat(second).isSameAs(first);
        server.verify();
    }

    @Test
    void describesWeatherCodes() {
        server.expect(requestTo(URL))
                .andRespond(withSuccess("{\"current\":{\"temperature_2m\":20,\"wind_speed_10m\":0,\"weather_code\":95}}",
                        MediaType.APPLICATION_JSON));

        assertThat(provider.current().description()).isEqualTo("гроза");
    }

    @Test
    void outageBecomesUnavailable() {
        server.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));

        assertThatThrownBy(provider::current).isInstanceOf(WeatherUnavailableException.class);
    }

    @Test
    void strangeAnswerBecomesUnavailable() {
        server.expect(requestTo(URL)).andRespond(withSuccess("{\"oops\":1}", MediaType.APPLICATION_JSON));

        assertThatThrownBy(provider::current).isInstanceOf(WeatherUnavailableException.class);
    }
}
