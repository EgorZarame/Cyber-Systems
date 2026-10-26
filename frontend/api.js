// Токен и логин игрока хранятся в localStorage, после входа через страницу /auth
class Session {
    static TOKEN_KEY = 'cyberToken';
    static LOGIN_KEY = 'cyberLogin';
    static AUTH_PAGE = '../auth/index.html';

    static get token() {
        try {
            return localStorage.getItem(this.TOKEN_KEY);
        } catch (error) {
            return null;
        }
    }

    static get login() {
        try {
            return localStorage.getItem(this.LOGIN_KEY);
        } catch (error) {
            return null;
        }
    }

    static save(token, login) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.LOGIN_KEY, login);
    }

    static clear() {
        try {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.LOGIN_KEY);
            localStorage.removeItem(LocalStorageService.PROFILE_KEY);
        } catch (error) {
            console.error('Не удалось очистить сессию:', error);
        }
    }

    static isLoggedIn() {
        return !!this.token;
    }

    // Если игрок не вошёл, отправляем на страницу входа
    static requireLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = this.AUTH_PAGE;
            return false;
        }
        return true;
    }

    static logout() {
        this.clear();
        window.location.href = this.AUTH_PAGE;
    }
}

class AuthService {
    static URL = 'http://localhost:8081/api/auth';

    static async send(path, login, password) {
        let response;
        try {
            response = await fetch(`${this.URL}${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password })
            });
        } catch (error) {
            throw new Error('Сервис входа недоступен');
        }

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || `Ошибка ${response.status}`);
        }
        Session.save(data.token, data.login);
        return data;
    }

    static login(login, password) {
        return this.send('/login', login, password);
    }

    static register(login, password) {
        return this.send('/register', login, password);
    }
}

class APIClient {
    static BASE_URL = 'http://localhost:8080/api';
    static isAvailable = null;
    static checkPromise = null;

    static async checkAvailability() {
        if (this.isAvailable !== null) return this.isAvailable;
        if (this.checkPromise) return this.checkPromise;

        this.checkPromise = (async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 500);

                const response = await fetch(`${this.BASE_URL}/levels`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                this.isAvailable = response.ok;
                return this.isAvailable;
            } catch (error) {
                this.isAvailable = false;
                return false;
            }
        })();

        return this.checkPromise;
    }

    static async request(endpoint, options = {}) {
        const isAvailable = await this.checkAvailability();
        
        if (!isAvailable) {
            throw new Error('Backend недоступен');
        }

        const headers = { 'Content-Type': 'application/json' };
        if (Session.token) {
            headers['Authorization'] = `Bearer ${Session.token}`;
        }

        const response = await fetch(`${this.BASE_URL}${endpoint}`, {
            signal: this.createTimeoutSignal(options.timeout || 2000),
            ...options,
            headers
        });

        if (response.status === 401) {
            // токен просрочен или подделан, нужно войти заново
            Session.logout();
            throw new Error('Нужно войти заново');
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    static createTimeoutSignal(timeoutMs) {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeoutMs);
        return controller.signal;
    }
}

class LevelService {
    static FALLBACK_LEVELS = [
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

    static async getAll() {
        try {
            return await APIClient.request('/levels', { method: 'GET' });
        } catch (error) {
            console.info('ℹ️ Используем локальные данные для уровней');
            return this.FALLBACK_LEVELS;
        }
    }
}

class ProfileService {
    static async get() {
        try {
            return await APIClient.request('/profile', { method: 'GET' });
        } catch (error) {
            console.info('ℹ️ Используем локальный профиль');
            return { id: 'local-profile', nickname: 'Стажер', currentLevelId: '1.1' };
        }
    }

    static async updateProgress(levelId) {
        try {
            return await APIClient.request('/profile/progress', {
                method: 'POST',
                body: JSON.stringify({ levelId })
            });
        } catch (error) {
            console.info('ℹ️ Прогресс сохранен локально');
            return { id: 'local-profile', nickname: 'Стажер', currentLevelId: levelId };
        }
    }

    static async updateNickname(nickname) {
        try {
            return await APIClient.request('/profile/nickname', {
                method: 'POST',
                body: JSON.stringify({ nickname })
            });
        } catch (error) {
            console.info('ℹ️ Никнейм сохранен локально');
            return { id: 'local-profile', nickname, currentLevelId: '1.1' };
        }
    }
}

class AttemptService {
    // Результат запуска программы. Ответа не ждём, на игру это не влияет
    static record(levelId, program, success) {
        if (!Session.isLoggedIn()) return;
        fetch(`${APIClient.BASE_URL}/attempts`, {
            method: 'POST',
            keepalive: true,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Session.token}`
            },
            body: JSON.stringify({ levelId, program: JSON.stringify(program), success })
        }).catch(() => console.info('ℹ️ Попытка не сохранена'));
    }
}

class HintService {
    static get(levelId, program) {
        return APIClient.request('/hint', {
            method: 'POST',
            timeout: 8000,
            body: JSON.stringify({ levelId, program })
        });
    }
}

class LocalStorageService {
    static PROFILE_KEY = 'cyberSystemsProfile';

    static syncAfterLevel(levelId) {
        try {
            let profile = this.load();
            
            if (!profile) {
                profile = {
                    currentLevelId: levelId,
                    lastCompleted: levelId,
                    juniorUnlocked: false,
                    seniorUnlocked: false,
                    completedLevels: []
                };
            } else {
                profile.currentLevelId = levelId;
                profile.lastCompleted = levelId;
                
                if (!profile.completedLevels) {
                    profile.completedLevels = [];
                }
                
                if (!profile.completedLevels.includes(levelId)) {
                    profile.completedLevels.push(levelId);
                }
            }

            // Обновляем статусы карьеры
            if (levelId === '1.boss') {
                profile.juniorUnlocked = true;
            }
            if (levelId === '3.boss') {
                profile.seniorUnlocked = true;
            }

            this.save(profile);
            console.log('✅ Локальный профиль синхронизирован:', profile);
            
        } catch (error) {
            console.error('❌ Ошибка синхронизации локального профиля:', error);
        }
    }

    // После входа собираем локальный профиль из того, что хранит сервер
    static async syncFromServer() {
        try {
            const levels = await APIClient.request('/levels', { method: 'GET' });
            const completed = await APIClient.request('/profile/completed-levels', { method: 'GET' });
            const profile = await APIClient.request('/profile', { method: 'GET' });

            const order = levels.slice().sort((a, b) => a.orderIndex - b.orderIndex).map(l => l.id);
            const done = order.filter(id => completed.includes(id));

            this.save({
                currentLevelId: profile.currentLevelId,
                lastCompleted: done.length ? done[done.length - 1] : null,
                juniorUnlocked: done.includes('1.boss'),
                seniorUnlocked: done.includes('3.boss'),
                completedLevels: done
            });
        } catch (error) {
            console.info('ℹ️ Не удалось подтянуть профиль с сервера');
        }
    }

    static load() {
        try {
            const profile = localStorage.getItem(this.PROFILE_KEY);
            return profile ? JSON.parse(profile) : null;
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            return null;
        }
    }

    static save(profile) {
        try {
            localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения профиля:', error);
            return false;
        }
    }
}

// Экспорт глобальных функций для обратной совместимости
if (typeof window !== 'undefined') {
    window.fetchLevels = LevelService.getAll.bind(LevelService);
    window.fetchProfile = ProfileService.get.bind(ProfileService);
    window.updateProgress = ProfileService.updateProgress.bind(ProfileService);
    window.updateNickname = ProfileService.updateNickname.bind(ProfileService);
    window.Session = Session;
    window.AuthService = AuthService;
    window.AttemptService = AttemptService;
    window.LocalStorageService = LocalStorageService;
    window.HintService = HintService;
    window.syncLocalProfileAfterLevel = LocalStorageService.syncAfterLevel.bind(LocalStorageService);
}