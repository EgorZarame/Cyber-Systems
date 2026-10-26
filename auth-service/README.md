# auth-service

Регистрация и вход. Пароли хешируются BCrypt и хранятся в data-service, сам сервис базу не трогает.
После входа выдаёт JWT, с которым фронтенд ходит в game-service.

Переменные: `JWT_SECRET` (минимум 32 символа, такой же как у game-service), `DATA_SERVICE_URL`,
`INTERNAL_TOKEN`, `CORS_ORIGIN`, `JWT_TTL_HOURS` (по умолчанию 12). Порт 8081.

| Метод | Путь | Что делает |
|---|---|---|
| POST | /api/auth/register | `{login, password}`: создаёт пользователя, возвращает токен |
| POST | /api/auth/login | `{login, password}`: возвращает токен |
| GET | /api/auth/me | по токену в `Authorization: Bearer` отдаёт id и логин |

Тесты: `mvn test`.
