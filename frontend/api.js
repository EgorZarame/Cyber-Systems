// API клиент для работы с бэкендом
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Загружает список всех уровней с бэкенда
 */
async function fetchLevels() {
    try {
        const response = await fetch(`${API_BASE_URL}/levels`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки уровней:', error);
        return [];
    }
}

/**
 * Загружает профиль игрока с бэкенда
 */
async function fetchProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/profile`);
        if (!response.ok) {
            if (response.status === 404) {
                return null; // Профиль не найден
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        return null;
    }
}

/**
 * Обновляет прогресс игрока (текущий уровень)
 */
async function updateProgress(levelId) {
    try {
        const response = await fetch(`${API_BASE_URL}/profile/progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ levelId: levelId })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка обновления прогресса:', error);
        return null;
    }
}

/**
 * Обновляет никнейм игрока
 */
async function updateNickname(nickname) {
    try {
        const response = await fetch(`${API_BASE_URL}/profile/nickname`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nickname: nickname })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка обновления никнейма:', error);
        return null;
    }
}

