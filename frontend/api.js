// API клиент для работы с бэкендом
const API_BASE_URL = 'http://localhost:8080/api';

// Кэш состояния доступности бэкенда
let backendAvailable = null;
let backendCheckPromise = null;

/**
 * Проверяет доступность бэкенда (один раз при загрузке)
 */
async function checkBackendAvailability() {
    // Если уже проверили, возвращаем кэшированный результат
    if (backendAvailable !== null) {
        return backendAvailable;
    }
    
    // Если проверка уже идет, ждем её
    if (backendCheckPromise) {
        return backendCheckPromise;
    }
    
    // Запускаем проверку
    backendCheckPromise = (async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 500);
            
            // Используем простой GET запрос с минимальным таймаутом
            const response = await fetch(`${API_BASE_URL}/levels`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            backendAvailable = response.ok;
            return backendAvailable;
        } catch (error) {
            // Подавляем ошибку - это нормально, если бэкенд недоступен
            backendAvailable = false;
            return false;
        }
    })();
    
    return backendCheckPromise;
}

// Fallback данные для работы без бэкенда
const FALLBACK_LEVELS = [
    { id: '1.1', type: 'DRONES', difficulty: 'EASY', orderIndex: 1, title: 'Первые шаги' },
    { id: '1.2', type: 'DRONES', difficulty: 'EASY', orderIndex: 2, title: 'Повороты' },

    { id: '1.boss', type: 'DRONES', difficulty: 'BOSS', orderIndex: 4, title: 'Босс отдела дронов' },
    { id: '2.1', type: 'SECURITY', difficulty: 'EASY', orderIndex: 5, title: 'Взлом системы' },
    { id: '2.2', type: 'SECURITY', difficulty: 'MEDIUM', orderIndex: 6, title: 'Обход защиты' },
    { id: '2.boss', type: 'SECURITY', difficulty: 'BOSS', orderIndex: 8, title: 'Босс безопасности' },
    { id: '3.1', type: 'CORE', difficulty: 'MEDIUM', orderIndex: 9, title: 'Ядро системы' },
    { id: '3.2', type: 'CORE', difficulty: 'HARD', orderIndex: 10, title: 'Критическая ошибка' },
    { id: '3.boss', type: 'CORE', difficulty: 'BOSS', orderIndex: 12, title: 'Финальный босс' }
];

/**
 * Создает AbortController с таймаутом для совместимости
 */
function createTimeoutSignal(timeoutMs) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeoutMs);
    return controller.signal;
}

/**
 * Загружает список всех уровней с бэкенда
 */
async function fetchLevels() {
    // Проверяем доступность бэкенда
    const isAvailable = await checkBackendAvailability();
    
    if (!isAvailable) {
        // Бэкенд недоступен, сразу возвращаем fallback данные без попыток запроса
        if (backendAvailable === false) {
            // Показываем предупреждение только один раз
            console.info('ℹ️ Работаем в режиме без бэкенда (используются локальные данные)');
        }
        return FALLBACK_LEVELS;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/levels`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: createTimeoutSignal(2000)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const levels = await response.json();
        console.log('✅ Уровни загружены с бэкенда:', levels.length);
        return levels;
    } catch (error) {
        // Если бэкенд стал недоступен после проверки, обновляем статус
        backendAvailable = false;
        return FALLBACK_LEVELS;
    }
}

/**
 * Загружает профиль игрока с бэкенда
 */
async function fetchProfile() {
    // Проверяем доступность бэкенда
    const isAvailable = await checkBackendAvailability();
    
    if (!isAvailable) {
        // Бэкенд недоступен, возвращаем fallback профиль
        return {
            id: 'local-profile',
            nickname: 'Стажер',
            currentLevelId: '1.1'
        };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: createTimeoutSignal(2000)
        });
        if (!response.ok) {
            if (response.status === 404) {
                return null; // Профиль не найден
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const profile = await response.json();
        console.log('✅ Профиль загружен с бэкенда');
        return profile;
    } catch (error) {
        // Если бэкенд стал недоступен после проверки, обновляем статус
        backendAvailable = false;
        return {
            id: 'local-profile',
            nickname: 'Стажер',
            currentLevelId: '1.1'
        };
    }
}

/**
 * Обновляет прогресс игрока (текущий уровень)
 */
async function updateProgress(levelId) {
    // Проверяем доступность бэкенда
    const isAvailable = await checkBackendAvailability();
    
    if (!isAvailable) {
        // Бэкенд недоступен, возвращаем локальный профиль
        return {
            id: 'local-profile',
            nickname: 'Стажер',
            currentLevelId: levelId
        };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/profile/progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ levelId: levelId }),
            signal: createTimeoutSignal(2000)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const profile = await response.json();
        console.log('✅ Прогресс обновлен на бэкенде');
        return profile;
    } catch (error) {
        // Если бэкенд стал недоступен после проверки, обновляем статус
        backendAvailable = false;
        return {
            id: 'local-profile',
            nickname: 'Стажер',
            currentLevelId: levelId
        };
    }
}

/**
 * Обновляет никнейм игрока
 */
async function updateNickname(nickname) {
    // Проверяем доступность бэкенда
    const isAvailable = await checkBackendAvailability();
    
    if (!isAvailable) {
        // Бэкенд недоступен, возвращаем локальный профиль
        return {
            id: 'local-profile',
            nickname: nickname,
            currentLevelId: '1.1'
        };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/profile/nickname`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nickname: nickname }),
            signal: createTimeoutSignal(2000)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const profile = await response.json();
        console.log('✅ Никнейм обновлен на бэкенде');
        return profile;
    } catch (error) {
        // Если бэкенд стал недоступен после проверки, обновляем статус
        backendAvailable = false;
        return {
            id: 'local-profile',
            nickname: nickname,
            currentLevelId: '1.1'
        };
    }
}
