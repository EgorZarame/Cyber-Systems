# data-service

Сервис данных. Единственный, кто ходит в PostgreSQL: хранит пользователей, профили игроков,
пройденные уровни и попытки. Остальные сервисы работают с ним по REST (адреса `/internal/...`).

Запуск (нужны Java 17+, Maven и PostgreSQL):

```
export DB_PASSWORD=...        # пароль пользователя БД
export INTERNAL_TOKEN=...     # необязательно локально, но в docker-compose задаём
mvn spring-boot:run
```

Порт 8082. Схема БД создаётся сама через Flyway (`src/main/resources/db/migration`).

## Методы

| Метод | Путь | Что делает |
|---|---|---|
| POST | /internal/users | создать пользователя и профиль |
| GET | /internal/users/by-login/{login} | найти пользователя по логину |
| GET | /internal/users/{id} | найти пользователя по id |
| GET | /internal/profiles/{id} | профиль по id |
| GET | /internal/profiles/by-user/{userId} | профиль пользователя |
| PUT | /internal/profiles/{id}/nickname | сменить ник |
| PUT | /internal/profiles/{id}/current-level | задать текущий уровень |
| POST | /internal/profiles/{id}/attempts | записать попытку (успешная отмечает уровень пройденным) |
| GET | /internal/profiles/{id}/attempts | последние попытки (`levelId`, `limit`) |
| GET | /internal/profiles/{id}/completed-levels | пройденные уровни |

Если задан `INTERNAL_TOKEN`, нужен заголовок `X-Internal-Token` с тем же значением.

Тесты: `mvn test` (на H2, PostgreSQL для них не нужен).
