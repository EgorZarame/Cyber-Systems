class Level {
    static LEVEL_PATHS = {
        '1.1': '../level-1-1/index.html',
        '1.2': '../level-1-2/index.html',
        '1.boss': '../level-1-3/index.html',
        '2.1': '../level-2-1/index.html',
        '2.2': '../level-2-2/index.html',
        '2.boss': '../level-2-3/index.html',
        '3.1': '../level-3-1/index.html',
        '3.2': '../level-3-2/index.html',
        '3.boss': '../level-3-3/index.html'
    };

    static LEVEL_ORDER = [
        '1.1', '1.2', '1.boss',
        '2.1', '2.2', '2.boss',
        '3.1', '3.2', '3.boss'
    ];

    static LEVEL_STYLES = {
        1: {
            levelBorder: '#ffd700',
            levelBg: '#151530',
            hoverBg: '#ffd700',
            hoverText: '#0a0a1a',
            hoverShadow: '#ffd700',
            bossBorder: '#ff0088',
            bossText: '#ff0088',
            bossHoverBg: '#ff0088',
            bossHoverText: '#ffffff',
            bossHoverShadow: '#ff0088'
        },
        2: {
            levelBorder: '#00e0ff',
            levelBg: '#102033',
            hoverBg: '#00e0ff',
            hoverText: '#0a0a1a',
            hoverShadow: '#00e0ff',
            bossBorder: '#ff6b00',
            bossText: '#ff6b00',
            bossHoverBg: '#ff6b00',
            bossHoverText: '#ffffff',
            bossHoverShadow: '#ff6b00'
        },
        3: {
            levelBorder: '#9b59ff',
            levelBg: '#1b1033',
            hoverBg: '#9b59ff',
            hoverText: '#0a0a1a',
            hoverShadow: '#9b59ff',
            bossBorder: '#00ff88',
            bossText: '#00ff88',
            bossHoverBg: '#00ff88',
            bossHoverText: '#0a0a1a',
            bossHoverShadow: '#00ff88'
        }
    };

    constructor(id, element) {
        this.id = id;
        this.element = element;
        this.department = parseInt(id.split('.')[0]);
        this.isBoss = id.includes('boss');
        this.isLocked = true;
        this.isCompleted = false;
        this.bindEvents();
        this.applyStyle();
    }

    applyStyle() {
        const style = Level.LEVEL_STYLES[this.department];
        if (!style) return;

        if (this.isBoss) {
            this.element.style.setProperty('--level-border', style.bossBorder);
            this.element.style.setProperty('--level-bg', style.levelBg);
            this.element.style.setProperty('--level-hover-bg', style.bossHoverBg);
            this.element.style.setProperty('--level-hover-text', style.bossHoverText);
            this.element.style.setProperty('--level-hover-shadow', style.bossHoverShadow);
        } else {
            this.element.style.setProperty('--level-border', style.levelBorder);
            this.element.style.setProperty('--level-bg', style.levelBg);
            this.element.style.setProperty('--level-hover-bg', style.hoverBg);
            this.element.style.setProperty('--level-hover-text', style.hoverText);
            this.element.style.setProperty('--level-hover-shadow', style.hoverShadow);
        }
    }

    bindEvents() {
        this.element.addEventListener('click', () => this.start());
    }

    unlock() {
        this.isLocked = false;
        this.element.classList.remove('locked');
        this.element.classList.add('unlocked');
    }

    lock() {
        this.isLocked = true;
        this.element.classList.remove('unlocked');
        this.element.classList.add('locked');
    }

    markCompleted() {
        this.isCompleted = true;
        this.element.classList.add('completed');
    }

    removeCompleted() {
        this.isCompleted = false;
        this.element.classList.remove('completed');
    }

    start() {
        if (this.isLocked) {
            alert('Этот уровень ещё заблокирован. Сначала пройди предыдущие уровни!');
            return;
        }

        const path = Level.LEVEL_PATHS[this.id];
        if (path) {
            window.location.href = `${path}?level=${this.id}`;
        }
    }

    static getOrderIndex(levelId) {
        return Level.LEVEL_ORDER.indexOf(levelId);
    }
}

class Department {
    constructor(id, element) {
        this.id = id;
        this.element = element;
        this.isLocked = true;
    }

    unlock() {
        this.isLocked = false;
        this.element.classList.remove('locked');
    }

    lock() {
        this.isLocked = true;
        this.element.classList.add('locked');
    }
}

class ProgressManager {
    static PROFILE_KEY = 'cyberSystemsProfile';

    static load() {
        try {
            const profile = localStorage.getItem(this.PROFILE_KEY);
            return profile ? JSON.parse(profile) : this.createDefault();
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            return this.createDefault();
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

    static createDefault() {
        return {
            currentLevelId: '1.1',
            lastCompleted: null,
            juniorUnlocked: false,
            seniorUnlocked: false,
            completedLevels: []
        };
    }

    static isSenior() {
        const profile = this.load();
        return profile.seniorUnlocked === true;
    }

    static isLevelCompleted(levelId) {
        const profile = this.load();
        return profile.completedLevels && profile.completedLevels.includes(levelId);
    }

    static getLastCompletedIndex() {
        const profile = this.load();
        if (!profile.lastCompleted) return -1;
        return Level.LEVEL_ORDER.indexOf(profile.lastCompleted);
    }

    static getCompletedLevels() {
        const profile = this.load();
        return profile.completedLevels || [];
    }

    static unlockAllLevels() {
        const profile = this.load();
        profile.seniorUnlocked = true;
        profile.juniorUnlocked = true;
        profile.completedLevels = [...Level.LEVEL_ORDER];
        profile.lastCompleted = '3.boss';
        this.save(profile);
        return profile;
    }
}

class BackgroundManager {
    static setup() {
        const body = document.body;
        const possiblePaths = [
            '../assets/images/backgrounds/office_bg.png',
            'assets/images/backgrounds/office_bg.png',
            '../assets/backgrounds/office-bg.png',
            'assets/backgrounds/office-bg.png',
        ];

        function tryBackground(pathIndex) {
            if (pathIndex >= possiblePaths.length) {
                setCSSBackground();
                return;
            }

            const bgPath = possiblePaths[pathIndex];
            const bgImg = new Image();
            bgImg.onload = () => {
                body.style.backgroundImage = `url('${bgPath}')`;
                body.style.backgroundSize = 'cover';
                body.style.backgroundPosition = 'center';
                body.style.backgroundRepeat = 'no-repeat';
                body.style.backgroundAttachment = 'fixed';
            };
            bgImg.onerror = () => {
                tryBackground(pathIndex + 1);
            };
            bgImg.src = bgPath;
        }

        function setCSSBackground() {
            body.style.background = `
                radial-gradient(circle at 20% 30%, rgba(0, 255, 136, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(255, 0, 136, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(255, 215, 0, 0.05) 0%, transparent 50%),
                linear-gradient(135deg, #0a0a1a 0%, #151530 50%, #1a1a2e 100%)
            `;
        }

        tryBackground(0);
    }
}

class LevelMap {
    static instance = null;
    static levels = new Map();
    static departments = new Map();

    static init() {
        if (this.instance) return;
        
        this.instance = new LevelMap();
        this.instance._init();
    }

    static startLevel(levelId) {
        const level = this.levels.get(levelId);
        if (level) level.start();
    }

    static showHelp() {
        document.getElementById('helpModal').style.display = 'flex';
    }

    static closeHelp() {
        document.getElementById('helpModal').style.display = 'none';
    }

    static restartGame() {
        if (confirm('Вы уверены, что хотите начать игру заново? Весь прогресс будет сброшен.')) {
            localStorage.clear();
            window.location.reload();
        }
    }

    static unlockAllLevels() {
        const profile = ProgressManager.unlockAllLevels();
        setTimeout(() => window.location.reload(), 500);
    }

    _init() {
        console.log('🗺️ Карта уровней загружена');
        
        BackgroundManager.setup();
        this.buildLevels();
        this.buildDepartments();
        this.bindEvents();
        this.updateDisplay();
        this.setupDeveloperTools();
    }

    buildLevels() {
        document.querySelectorAll('[data-level]').forEach(element => {
            const levelId = element.dataset.level;
            const level = new Level(levelId, element);
            LevelMap.levels.set(levelId, level);
        });
    }

    buildDepartments() {
        const departments = [
            { id: 'security-department', unlockAfterIndex: 2 }, // После 1.boss
            { id: 'core-department', unlockAfterIndex: 5 }      // После 2.boss
        ];

        departments.forEach(dept => {
            const element = document.getElementById(dept.id);
            if (element) {
                LevelMap.departments.set(dept.id, new Department(dept.id, element));
            }
        });
    }

    updateDisplay() {
        if (ProgressManager.isSenior()) {
            this.showSeniorMode();
        } else {
            this.updateRegularMode();
        }
    }

    updateRegularMode() {
        const lastCompletedIndex = ProgressManager.getLastCompletedIndex();
        const completedLevels = ProgressManager.getCompletedLevels();
        
        // Обновляем уровни
        LevelMap.levels.forEach((level, levelId) => {
            const levelIndex = Level.getOrderIndex(levelId);
            
            if (levelIndex <= lastCompletedIndex + 1) {
                level.unlock();
            } else {
                level.lock();
            }
            
            if (completedLevels.includes(levelId)) {
                level.markCompleted();
            } else {
                level.removeCompleted();
            }
        });
        
        // Обновляем отделы
        this.updateDepartments(lastCompletedIndex);
    }

    showSeniorMode() {
        console.log('🎖️ SENIOR режим активирован');
        
        // Разблокируем все
        LevelMap.levels.forEach(level => level.unlock());
        LevelMap.departments.forEach(dept => dept.unlock());
        
        // Показываем бейджи
        document.getElementById('seniorBadge').style.display = 'inline-flex';
        document.getElementById('seniorIndicator').style.display = 'block';
        document.getElementById('completionMessage').style.display = 'block';
        
        // Отмечаем пройденные уровни
        const completedLevels = ProgressManager.getCompletedLevels();
        LevelMap.levels.forEach((level, levelId) => {
            if (completedLevels.includes(levelId)) {
                level.markCompleted();
            }
        });
    }

    updateDepartments(lastCompletedIndex) {
        const securityDept = LevelMap.departments.get('security-department');
        const coreDept = LevelMap.departments.get('core-department');
        
        if (securityDept) {
            if (lastCompletedIndex >= 2) {
                securityDept.unlock();
            } else {
                securityDept.lock();
            }
        }
        
        if (coreDept) {
            if (lastCompletedIndex >= 5) {
                coreDept.unlock();
            } else {
                coreDept.lock();
            }
        }
    }

    bindEvents() {
        // Кнопка справки
        document.getElementById('help-btn')?.addEventListener('click', () => {
            LevelMap.showHelp();
        });
        
        // Кнопка закрытия справки
        document.getElementById('close-help-btn')?.addEventListener('click', () => {
            LevelMap.closeHelp();
        });
        
        // Кнопка перезапуска
        document.getElementById('restart-btn')?.addEventListener('click', () => {
            LevelMap.restartGame();
        });
        
        // ESC для закрытия справки
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                LevelMap.closeHelp();
            }
        });
        
        // Клик вне модального окна для закрытия
        document.getElementById('helpModal')?.addEventListener('click', (event) => {
            if (event.target.id === 'helpModal') {
                LevelMap.closeHelp();
            }
        });
    }

    setupDeveloperTools() {
        window.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'S') {
                event.preventDefault();
                if (confirm('Разблокировать все уровни и стать SENIOR?')) {
                    LevelMap.unlockAllLevels();
                }
            }
        });
        
        console.log('Для разблокировки всех уровней нажмите Ctrl+Shift+S');
    }
}