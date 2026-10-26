package com.cybersystems.service;

/** Текущая погода из внешнего сервиса. */
public interface WeatherProvider {

    Weather current();
}
