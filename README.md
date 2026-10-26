# КиберСистемс

Игра для обучения программированию. Игрок собирает программу из блоков (Blockly), а дрон на поле (Phaser) её выполняет. Уровни идут от простых к сложным, на сложных есть подсказки от нейросети.

Проект разделён на несколько сетевых сервисов, которые общаются по HTTP. Данные игроков хранятся в PostgreSQL.

## Из чего состоит

| Сервис | Папка | Порт | Что делает |
|---|---|---|---|
| frontend | `frontend/` | 3000 | страницы игры, вход, окно подсказки, описание API (Node.js, Express) |
| game-service | `backend/` | 8080 | уровни, профиль, прогресс, попытки, подсказки (Java 17, Spring Boot) |
| auth-service | `auth-service/` | 8081 | регистрация, вход, выдача JWT (Java 17, Spring Boot) |
| data-service | `data-service/` | 8082 | единственный, кто работает с PostgreSQL (Java 17, Spring Boot) |
| ai-service | `ai-service/` | 8083 | определяет ошибку в программе игрока и строит подсказку (Python, FastAPI, scikit-learn) |
| db | | 5432 | PostgreSQL 16 |

Как это связано:

- Браузер ходит в auth-service (вход) и в game-service (всё остальное, с токеном игрока).
- game-service сам проверяет подпись токена, а за данными ходит в data-service. Подсказку он берёт у ai-service.
- Остальные сервисы с базой не работают, только data-service. Между собой сервисы общаются с общим служебным токеном (заголовок `X-Internal-Token`).
- Пароли хранятся только в виде BCrypt-хэшей.

В базе четыре таблицы: `users`, `player_profiles`, `level_progress` и `attempts`. Схема создаётся миграцией Flyway при первом запуске data-service.

## Быстрый запуск через Docker

Нужен Docker с Docker Compose.

```
cp .env.example .env
```

Открой `.env` и заполни значения:

- `DB_PASSWORD` — пароль базы данных;
- `JWT_SECRET` — длинная случайная строка, минимум 32 символа;
- `INTERNAL_TOKEN` — любая длинная случайная строка для обращений между сервисами.

Файл `.env` в git не попадает, значения нигде больше хранить не нужно. Потом:

```
docker compose up --build
```

Первая сборка занимает несколько минут. Когда всё поднимется, открой http://localhost:3000. Игра сначала попросит зарегистрироваться. Остановить всё можно командой `docker compose down` (с ключом `-v` ещё и сотрётся база).

## Запуск без Docker

Нужны JDK 17, Maven 3.9+, Node.js 18+, Python 3.11+ и PostgreSQL. Переменные из `.env.example` нужно выставить в окружении (`DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `INTERNAL_TOKEN`). Сервисы запускаются по порядку, каждый в своём терминале:

```
cd data-service && mvn spring-boot:run
cd auth-service && mvn spring-boot:run
cd ai-service && pip install -r requirements.txt && uvicorn app.main:app --port 8083
cd backend && mvn spring-boot:run
cd frontend && npm install && node server.js
```

Подробности по каждому сервису лежат в README в его папке.

## Как играть

1. Открой http://localhost:3000 и зарегистрируйся.
2. Нажми «НАЧАТЬ ИГРУ» и выбери уровень на карте.
3. Перетащи блоки в область программы и нажми «Запустить программу».
4. Если застрял на уровне 1.1, 1.2 или 2.2, нажми «Подсказка»: помощник объяснит, что пошло не так, а после нескольких попыток покажет шаги до финиша.

## Внешний сервис

На главной странице показывается погода (город Уфа, по умолчанию). Игровой сервис берёт её у бесплатного Open-Meteo, ключ не нужен, ответ запоминается на 10 минут (`GET /api/external/weather`). Если внешний сервис не отвечает, блок на странице просто остаётся пустым. Город и адрес можно поменять переменными `WEATHER_URL`, `WEATHER_CITY`, `WEATHER_LATITUDE`, `WEATHER_LONGITUDE`.

## Описание API

Все методы всех сервисов описаны на странице http://localhost:3000/api-docs/ (обычный HTML-файл, лежит в `frontend/api-docs`). Там для каждого метода есть доступ, пример запроса и ответа и возможные ошибки, а для игрового сервиса и авторизации ещё и кнопка «Попробовать», которая вызывает работающий сервис.

## Тесты

В каждом сервисе есть автоматические тесты, они не требуют ни PostgreSQL, ни работающих соседних сервисов:

```
cd data-service && mvn test
cd auth-service && mvn test
cd backend && mvn test
cd ai-service && pip install -r requirements-dev.txt && pytest --cov=app
```

Всего 116 тестов. Покрытие строк: data-service 96 %, auth-service 94 %, game-service 91 %, ai-service 99 %. Для Java отчёт JaCoCo появляется в `target/site/jacoco/index.html` после `mvn test`.

## Если что-то не работает

- **`docker compose` ругается на пустую переменную.** Заполни `DB_PASSWORD`, `JWT_SECRET` и `INTERNAL_TOKEN` в `.env`.
- **Сервис не стартует из-за `JWT_SECRET`.** В нём должно быть минимум 32 символа, и одно и то же значение у auth-service и game-service.
- **Игра просит войти снова.** Токен живёт 12 часов, после этого нужно просто войти заново.
- **Порт занят.** Проверь, что 3000, 8080–8083 и 5432 свободны.
- **Подсказка не приходит.** Проверь, что ai-service запущен; игра при этом продолжает работать и без него.

## Технологии

- **Интерфейс:** HTML, CSS, JavaScript, Blockly, Phaser 3, Express.
- **Сервисы:** Java 17, Spring Boot 3.3, Spring Data JPA, Flyway, JWT, BCrypt.
- **ИИ:** Python, FastAPI, scikit-learn.
- **Данные и запуск:** PostgreSQL 16, Docker Compose.
- **Тесты:** JUnit, MockRestServiceServer, JaCoCo, pytest.
