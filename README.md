# КиберСистемс - Курсовой проект по объектно-ориентированному программированию

Игровая платформа для обучения программированию с использованием визуального блочного редактора (Blockly) и игрового движка Phaser.

## 📋 Требования

### Для фронтенда:
- **Node.js** версии 18+ ([скачать](https://nodejs.org/))
- **npm** (устанавливается вместе с Node.js)

### Для бэкенда:
- **JDK 17** ([скачать Eclipse Temurin](https://adoptium.net/) или [Microsoft Build](https://aka.ms/download-jdk/microsoft-jdk-17-windows-x64.msi))
- **Maven 3.9+** ([скачать](https://maven.apache.org/download.cgi))

## 🚀 Быстрый старт

### 1. Установка зависимостей

#### Windows (PowerShell):
```powershell
# Если npm не работает, установи политику выполнения:
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

# Перейди в папку frontend
cd frontend
npm install
```

### 2. Запуск фронтенда

```powershell
cd frontend
node server.js
```

Фронтенд будет доступен по адресу: **http://localhost:3000**

### 3. Запуск бэкенда

**Важно:** Бэкенд и фронтенд должны работать одновременно!

Открой **новое окно терминала** и выполни:

```powershell
cd backend
mvn spring-boot:run
```

Бэкенд будет доступен по адресу: **http://localhost:8080**

**Первый запуск может занять 1-2 минуты** (Maven скачает зависимости).

## 📁 Структура проекта

```
Cyber-Systems/
├── backend/                    # Java бэкенд (Spring Boot)
│   ├── pom.xml                 # Maven конфигурация
│   └── src/main/java/com/cybersystems/
│       ├── CyberSystemsApplication.java  # Точка входа
│       ├── domain/             # ООП-модель (уровни, профиль)
│       ├── service/            # Бизнес-логика (каталог, профиль)
│       └── api/                # REST API контроллеры и DTO
│
└── frontend/                    # Клиентская часть
    ├── server.js               # Express сервер для разработки
    ├── api.js                  # Клиент для работы с бэкендом
    ├── game.js                 # Логика игры и Blockly
    ├── style.css               # Стили интерфейса
    ├── home/                   # Главная страница
    │   └── index.html
    ├── level-map/              # Карта уровней
    │   └── index.html
    └── level-1-1/              # Страница уровня 1.1
        └── index.html
```

## 🎮 Как играть

1. Открой **http://localhost:3000** в браузере
2. Нажми **"НАЧАТЬ ИГРУ"** на главной странице
3. Выбери уровень на карте (например, **1.1**)
4. Перетащи блок **"двигаться вперед"** из панели слева в рабочую область справа
5. Нажми **"ЗАПУСТИТЬ ПРОГРАММУ"**
6. Дрон должен добраться до финиша (красный квадрат)

## 🔧 API эндпоинты бэкенда

- `GET /api/levels` — получить список всех уровней
- `GET /api/profile` — получить текущий профиль игрока
- `POST /api/profile/progress` — обновить прогресс
  ```json
  { "levelId": "1.1" }
  ```
- `POST /api/profile/nickname` — обновить никнейм
  ```json
  { "nickname": "Имя игрока" }
  ```

## Сервисы (новая архитектура)

Приложение разделено на независимые сервисы, они общаются по HTTP:

| Сервис | Папка | Порт | Что делает |
|---|---|---|---|
| frontend | `frontend/` | 3000 | раздаёт страницы игры |
| auth-service | `auth-service/` | 8081 | регистрация, вход, выдача JWT |
| game-service | `backend/` | 8080 | уровни, прогресс, попытки (нужен токен) |
| data-service | `data-service/` | 8082 | единственный, кто работает с PostgreSQL |
| ai-service | `ai-service/` | 8083 | подсказки по программе игрока (Python) |

Секреты и пароли задаются переменными окружения (шаблон в `.env.example`), в репозиторий их класть нельзя.
Сервисам нужны одинаковые `JWT_SECRET` (auth и game) и `INTERNAL_TOKEN` (все три бэкенда).

Запуск всего сразу через Docker: `cp .env.example .env`, заполнить значения (пароль базы, `JWT_SECRET`,
`INTERNAL_TOKEN`) и `docker compose up --build`. Игра откроется на http://localhost:3000, первым делом
попросит зарегистрироваться. На уровнях 1.1, 1.2 и 2.2 есть кнопка «Подсказка».

Порядок запуска вручную: data-service, auth-service, game-service (`mvn spring-boot:run` в каждой папке).
Подробнее про каждый сервис в README внутри папки.

Описание всех методов API открывается на http://localhost:3000/api-docs/ (обычная HTML-страница, лежит в `frontend/api-docs`).

Покрытие тестами считает JaCoCo: `mvn test` в папке сервиса, отчёт в `target/site/jacoco/index.html`.

Новые методы игрового сервиса: `POST /api/attempts`, `GET /api/profile/completed-levels`.
Все методы `/api`, кроме `GET /api/levels`, требуют заголовок `Authorization: Bearer <токен>`.

## 🛠️ Решение проблем

### npm не работает в PowerShell
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
Или используй обычный терминал Windows (cmd) вместо PowerShell.

### Maven не найден
1. Убедись, что Maven установлен и добавлен в PATH
2. Проверь: `mvn -v` должен показать версию
3. Если не работает, перезапусти терминал после установки

### Бэкенд не компилируется
- Убедись, что используется JDK 17
- Проверь: `java -version` должен показать версию 17.x
- Очисти и пересобери: `mvn clean spring-boot:run`

### Фронтенд не подключается к бэкенду
- Убедись, что оба сервера запущены (фронт на 3000, бэк на 8080)
- Проверь консоль браузера (F12) на ошибки CORS
- Убедись, что в `frontend/api.js` указан правильный URL: `http://localhost:8080`

## 🎯 Особенности проекта

- **ООП архитектура:** Наследование, интерфейсы, фабрики, стратегии
- **REST API:** Spring Boot бэкенд с CORS поддержкой
- **Визуальное программирование:** Blockly для создания программ
- **Игровой движок:** Phaser 3 для визуализации
- **Сохранение прогресса:** Прогресс хранится на бэкенде

## 📝 Технологии

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Blockly (визуальное программирование)
- Phaser 3 (игровой движок)
- Express.js (локальный сервер)

**Backend:**
- Java 17
- Spring Boot 3.3.2
- Maven
- REST API

---

**Приятной игры! 🎮**
