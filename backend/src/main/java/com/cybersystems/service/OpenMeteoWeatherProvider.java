package com.cybersystems.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.util.Map;

/**
 * Берёт погоду у бесплатного сервиса Open-Meteo (ключ не нужен).
 * Ответ запоминаем на несколько минут, чтобы не дёргать чужой сервис на каждое открытие страницы.
 */
@Component
public class OpenMeteoWeatherProvider implements WeatherProvider {

    private static final Duration CACHE_TTL = Duration.ofMinutes(10);

    private final RestClient client;
    private final String city;
    private final double latitude;
    private final double longitude;

    private Weather cached;
    private long cachedAtMillis;

    public OpenMeteoWeatherProvider(RestClient.Builder builder,
                                    @Value("${weather.url:https://api.open-meteo.com}") String baseUrl,
                                    @Value("${weather.city:Уфа}") String city,
                                    @Value("${weather.latitude:54.74}") double latitude,
                                    @Value("${weather.longitude:55.97}") double longitude) {
        this.client = builder.baseUrl(baseUrl).build();
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    @Override
    public synchronized Weather current() {
        long now = System.currentTimeMillis();
        if (cached != null && now - cachedAtMillis < CACHE_TTL.toMillis()) {
            return cached;
        }
        Weather fresh = load();
        cached = fresh;
        cachedAtMillis = now;
        return fresh;
    }

    @SuppressWarnings("unchecked")
    private Weather load() {
        try {
            Map<String, Object> body = client.get()
                    .uri("/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,wind_speed_10m,weather_code",
                            latitude, longitude)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() { });
            Map<String, Object> current = (Map<String, Object>) body.get("current");
            double temperature = ((Number) current.get("temperature_2m")).doubleValue();
            double wind = ((Number) current.get("wind_speed_10m")).doubleValue();
            int code = ((Number) current.get("weather_code")).intValue();
            return new Weather(city, temperature, wind, describe(code));
        } catch (RestClientException | NullPointerException | ClassCastException e) {
            throw new WeatherUnavailableException("Не удалось получить погоду", e);
        }
    }

    static String describe(int code) {
        if (code == 0) return "ясно";
        if (code <= 3) return "облачно";
        if (code == 45 || code == 48) return "туман";
        if (code >= 51 && code <= 57) return "морось";
        if (code >= 61 && code <= 67) return "дождь";
        if (code >= 71 && code <= 77) return "снег";
        if (code >= 80 && code <= 82) return "ливень";
        if (code >= 85 && code <= 86) return "снегопад";
        if (code >= 95) return "гроза";
        return "переменная погода";
    }
}
