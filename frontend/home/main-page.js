class ProfileManager {
    constructor() {
        this.PROFILE_KEY = 'cyberSystemsProfile';
    }

    load() {
        try {
            const profile = localStorage.getItem(this.PROFILE_KEY);
            return profile ? JSON.parse(profile) : null;
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            return null;
        }
    }

    save(profile) {
        try {
            localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
            console.log('✅ Профиль сохранен:', profile);
            return true;
        } catch (error) {
            console.error('Ошибка сохранения профиля:', error);
            return false;
        }
    }

    createNew() {
        return {
            currentLevelId: '1.1',
            lastCompleted: null,
            juniorUnlocked: false,
            seniorUnlocked: false,
            completedLevels: []
        };
    }
}

class CareerProgress {
    constructor(stages) {
        this.stages = stages;
    }

    update(profile) {
        const levelId = profile?.lastCompleted || profile?.currentLevelId;
        let stageIndex = 0;

        if (!levelId) {
            stageIndex = 0;
        } else if (levelId === '3.boss') {
            stageIndex = 3;
        } else if (levelId === '2.boss' || (levelId.startsWith('3.') && levelId !== '3.boss')) {
            stageIndex = 2;
        } else if (levelId === '1.boss' || levelId.startsWith('2.')) {
            stageIndex = 1;
        }

        this.stages.forEach((stage, index) => {
            stage.classList.toggle('active', index === stageIndex);
        });
    }
}

class CharacterDisplay {
    constructor(avatarElement, nameElement, placeholderElement) {
        this.avatar = avatarElement;
        this.name = nameElement;
        this.placeholder = placeholderElement;
        this.basePath = window.location.protocol === 'file:' ? '../' : '/';
        this.avatarBasePath = this.basePath + 'assets/images/avatars/';
    }

    update(profile) {
        const levelId = profile?.lastCompleted || profile?.currentLevelId;
        
        let avatarFile = 'intern.png';
        let characterTitle = 'Стажер';
        
        if (levelId) {
            if (levelId === '3.boss') {
                avatarFile = 'senior.png';
                characterTitle = 'Senior Developer';
            } else if (levelId === '2.boss' || (levelId.startsWith('3.') && levelId !== '3.boss')) {
                avatarFile = 'developer.png';
                characterTitle = 'Developer';
            } else if (levelId === '1.boss' || levelId.startsWith('2.')) {
                avatarFile = 'junior.png';
                characterTitle = 'Junior Developer';
            }
        }
        
        const avatarPath = this.avatarBasePath + avatarFile;
        this.name.textContent = characterTitle;
        
        this.avatar.onerror = () => {
            this.avatar.style.display = 'none';
            if (this.placeholder) {
                this.placeholder.style.display = 'block';
            }
        };
        
        this.avatar.onload = () => {
            this.avatar.style.display = 'block';
            if (this.placeholder) {
                this.placeholder.style.display = 'none';
            }
        };
        
        this.avatar.src = avatarPath;
    }
}

class DialogManager {
    constructor(dialogElement) {
        this.dialog = dialogElement;
    }

    open() {
        if (this.dialog) {
            this.dialog.style.display = 'flex';
        }
    }

    close() {
        if (this.dialog) {
            this.dialog.style.display = 'none';
        }
    }
}

class GameStarter {
    constructor(profileManager) {
        this.profileManager = profileManager;
    }

    startNewGame() {
        const newProfile = this.profileManager.createNew();
        const saved = this.profileManager.save(newProfile);
        
        if (saved) {
            console.log('✅ Новая игра создана:', newProfile);
            this.navigateToMap();
        } else {
            alert('Ошибка при создании новой игры');
        }
    }

    continueGame() {
        const profile = this.profileManager.load();
        
        if (profile?.currentLevelId) {
            console.log('🎮 Загружен профиль:', profile);
            this.navigateToMap();
        } else {
            this.startNewGame();
        }
    }

    navigateToMap() {
        setTimeout(() => {
            window.location.href = '../level-map/index.html';
        }, 300);
    }
}

class BackgroundManager {
    constructor(body) {
        this.body = body;
        this.possiblePaths = [
            '../assets/images/backgrounds/office_bg.png',
            'assets/images/backgrounds/office_bg.png',
            '../assets/backgrounds/office-bg.png',
            'assets/backgrounds/office-bg.png',
        ];
    }

    setup() {
        this.tryBackground(0);
    }

    tryBackground(pathIndex) {
        if (pathIndex >= this.possiblePaths.length) {
            this.setCSSBackground();
            return;
        }

        const bgPath = this.possiblePaths[pathIndex];
        console.log(`🔄 Пробуем путь ${pathIndex + 1}:`, bgPath);
        
        const bgImg = new Image();
        bgImg.onload = () => {
            console.log('✅ Фон загружен успешно:', bgPath);
            this.body.style.backgroundImage = `url('${bgPath}')`;
            this.body.style.backgroundSize = 'cover';
            this.body.style.backgroundPosition = 'center';
            this.body.style.backgroundRepeat = 'no-repeat';
            this.body.style.backgroundAttachment = 'fixed';
        };
        bgImg.onerror = () => {
            console.warn('❌ Не удалось загрузить:', bgPath);
            this.tryBackground(pathIndex + 1);
        };
        bgImg.src = bgPath;
    }

    setCSSBackground() {
        this.body.style.background = `
            radial-gradient(circle at 20% 30%, rgba(0, 255, 136, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 0, 136, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 215, 0, 0.05) 0%, transparent 50%),
            linear-gradient(135deg, #0a0a1a 0%, #151530 50%, #1a1a2e 100%)
        `;
        this.body.style.backgroundSize = 'cover';
        this.body.style.backgroundPosition = 'center';
        this.body.style.backgroundRepeat = 'no-repeat';
        this.body.style.backgroundAttachment = 'fixed';
        console.log('✅ Установлен CSS фон');
    }
}

class MainPage {
    static instance = null;

    constructor() {
        if (MainPage.instance) {
            return MainPage.instance;
        }
        
        this.profileManager = new ProfileManager();
        this.careerProgress = null;
        this.characterDisplay = null;
        this.startDialog = null;
        this.helpModal = null;
        this.gameStarter = null;
        this.backgroundManager = null;
        
        MainPage.instance = this;
    }

    static init() {
        const instance = new MainPage();
        instance._init();
    }

    static showHelp() {
        const instance = MainPage.instance;
        instance.helpModal?.open();
    }

    static closeHelp() {
        const instance = MainPage.instance;
        instance.helpModal?.close();
    }

    _init() {
        console.log('🏠 Главное меню загружено');
        
        this.setupBackground();
        this.setupComponents();
        this.bindEvents();
        this.loadProfile();
    }

    setupBackground() {
        this.backgroundManager = new BackgroundManager(document.body);
        this.backgroundManager.setup();
    }

    setupComponents() {
        // Инициализация компонентов
        const careerStages = document.querySelectorAll('.career-stage');
        this.careerProgress = new CareerProgress(careerStages);
        
        const avatar = document.getElementById('character-avatar');
        const name = document.getElementById('character-name');
        const placeholder = document.querySelector('.character-placeholder');
        this.characterDisplay = new CharacterDisplay(avatar, name, placeholder);
        
        this.startDialog = new DialogManager(document.getElementById('startDialog'));
        this.helpModal = new DialogManager(document.getElementById('helpModal'));
        
        this.gameStarter = new GameStarter(this.profileManager);
    }

    bindEvents() {
        // Обработчики для кнопок
        document.getElementById('start-game-btn')?.addEventListener('click', () => {
            this.startDialog.open();
        });
        
        document.getElementById('continue-game-btn')?.addEventListener('click', () => {
            this.gameStarter.continueGame();
        });
        
        document.getElementById('help-btn')?.addEventListener('click', () => {
            this.helpModal.open();
        });
        
        document.getElementById('confirm-start-btn')?.addEventListener('click', () => {
            this.gameStarter.startNewGame();
        });
        
        document.getElementById('close-start-dialog')?.addEventListener('click', () => {
            this.startDialog.close();
        });
        
        document.getElementById('cancel-start-btn')?.addEventListener('click', () => {
            this.startDialog.close();
        });
        
        document.getElementById('close-help-btn')?.addEventListener('click', () => {
            this.helpModal.close();
        });
        
        // Закрытие по клику на оверлей
        document.addEventListener('click', (event) => {
            if (event.target.id === 'startDialog') {
                this.startDialog.close();
            }
            if (event.target.id === 'helpModal') {
                this.helpModal.close();
            }
        });
        
        // ESC для закрытия модалок
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.startDialog.close();
                this.helpModal.close();
            }
        });
    }

    loadProfile() {
        const profile = this.profileManager.load();
        
        if (profile) {
            console.log('Профиль загружен:', profile);
            this.characterDisplay.update(profile);
            this.careerProgress.update(profile);
        } else {
            console.log('Профиль не найден');
            this.characterDisplay.update({ currentLevelId: '1.1' });
            this.careerProgress.update({});
        }
    }
}