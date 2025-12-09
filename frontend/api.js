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

        const defaultOptions = {
            headers: { 'Content-Type': 'application/json' },
            signal: this.createTimeoutSignal(2000)
        };

        const response = await fetch(`${this.BASE_URL}${endpoint}`, {
            ...defaultOptions,
            ...options
        });

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
    window.syncLocalProfileAfterLevel = LocalStorageService.syncAfterLevel.bind(LocalStorageService);
}