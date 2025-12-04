// ===== ИНИЦИАЛИЗАЦИЯ УРОВНЯ =====
document.addEventListener('DOMContentLoaded', function() {
    // Получаем levelId из URL параметров
    const urlParams = new URLSearchParams(window.location.search);
    const levelId = urlParams.get('level') || '1.1';
    initializeLevel(levelId);
});

function initializeLevel(levelId) {
    console.log(`🎮 Загрузка уровня: ${levelId}`);
    
    // Инициализация Blockly
    initBlockly(levelId);
    
    // Инициализация игры Phaser
    initGame(levelId);
    
    // Настройка обработчиков
    setupEventHandlers();
    
    updateConsole(`Уровень ${levelId} загружен`);
    updateConsole('Используй блок "двигаться вперед" чтобы провести дрона к финишу');
}

// ===== BLOCKLY НАСТРОЙКА =====
function initBlockly(levelId) {
    // Регистрируем генератор ДО создания workspace
    registerCodeGenerators();
    
    const toolbox = getToolboxForLevel(levelId);
    
    workspace = Blockly.inject('blockly-area', {
        toolbox: toolbox,
        collapse: false,
        comments: false,
        disable: false,
        trashcan: true,
        horizontalLayout: false,
        toolboxPosition: 'start',
        css: true,
        media: 'https://unpkg.com/blockly/media/',
        rtl: false,
        scrollbars: true,
        sounds: true,
        oneBasedIndex: true
    });

    // Создаем кастомные блоки
    createCustomBlocks();
    
    // Регистрируем генератор ПОСЛЕ создания workspace (на всякий случай)
    registerCodeGenerators();
    
    console.log('✅ Blockly workspace инициализирован');
    console.log('Проверка генератора:', typeof Blockly.JavaScript !== 'undefined' ? 
        (Blockly.JavaScript['move_forward'] ? '✅ Найден' : '❌ Не найден') : 'Blockly.JavaScript не доступен');
}

function getToolboxForLevel(levelId) {
    const toolboxes = {
        '1.1': {
            kind: 'categoryToolbox',
            contents: [
                {
                    kind: 'category',
                    name: '🚀 ДВИЖЕНИЕ',
                    colour: '#5CA699',
                    contents: [
                        { kind: 'block', type: 'move_forward' }
                    ]
                }
            ]
        },
        '1.2': {
            kind: 'categoryToolbox',
            contents: [
                {
                    kind: 'category',
                    name: '🚀 ДВИЖЕНИЕ',
                    colour: '#5CA699',
                    contents: [
                        { kind: 'block', type: 'move_forward' },
                        { kind: 'block', type: 'turn_left' },
                        { kind: 'block', type: 'turn_right' }
                    ]
                }
            ]
        }
    };
    
    return toolboxes[levelId] || toolboxes['1.1'];
}

// Глобальные переменные
let workspace;
let game;
let player;

// ===== РЕГИСТРАЦИЯ БЛОКОВ И ГЕНЕРАТОРОВ =====

// Определение блока "двигаться вперед"
Blockly.Blocks['move_forward'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("двигаться вперед");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("Двигает дрона вперед");
    }
};

// Функция для регистрации генератора (вызывается после загрузки Blockly)
function registerCodeGenerators() {
    // Проверяем разные варианты API Blockly
    if (typeof Blockly === 'undefined') {
        console.warn('⚠️ Blockly не загружен');
        return;
    }
    
    if (!Blockly.JavaScript) {
        console.warn('⚠️ Blockly.JavaScript не доступен');
        return;
    }
    
    // Функция генератора
    const generatorFunction = function(block) {
        return 'moveForward();\n';
    };
    
    // Способ 1: Прямая регистрация (старый API)
    Blockly.JavaScript['move_forward'] = generatorFunction;
    
    // Способ 2: Через forBlock (новый API Blockly v9+)
    if (!Blockly.JavaScript.forBlock) {
        Blockly.JavaScript.forBlock = {};
    }
    Blockly.JavaScript.forBlock['move_forward'] = generatorFunction;
    
    // Способ 3: Через метод addReservedWords (если есть)
    if (Blockly.JavaScript.addReservedWords) {
        // Не нужно, но на всякий случай
    }
    
    console.log('✅ Генератор move_forward зарегистрирован (все способы)');
    console.log('Проверка:', {
        direct: typeof Blockly.JavaScript['move_forward'] === 'function',
        forBlock: typeof Blockly.JavaScript.forBlock?.['move_forward'] === 'function'
    });
}

function createCustomBlocks() {
    // Блоки уже определены выше, эта функция оставлена для совместимости
    // Здесь можно добавить дополнительные блоки в будущем
}

// ===== PHASER ИНИЦИАЛИЗАЦИЯ =====
function initGame(levelId) {
    const config = {
        type: Phaser.AUTO,
        width: 600,
        height: 400,
        parent: 'game-canvas',
        pixelArt: true,
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    game = new Phaser.Game(config);
}

function preload() {
    // Пока не загружаем изображения, используем простые фигуры
    // this.load.image('drone', 'data:image/png;base64,...'); // временный спрайт
}

function create() {
    // Создание игровых объектов для уровня 1.1
    this.add.rectangle(100, 200, 400, 4, 0x00ff88); // дорога
    this.add.rectangle(100, 200, 30, 30, 0x00ff88); // старт
    this.add.rectangle(500, 200, 30, 30, 0xff4444); // финиш
    
    // Дрон (пока зеленый квадрат)
    player = this.add.rectangle(100, 200, 25, 25, 0x00ff88);
    
    updateConsole('Дрон готов к работе');
}

function update() {
    // Игровая логика
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
function setupEventHandlers() {
    document.getElementById('run-button').addEventListener('click', runCode);
    document.getElementById('reset-button').addEventListener('click', resetLevel);
    document.querySelector('.help-button').addEventListener('click', showHelp);
}

function runCode() {
    updateConsole('> Запуск программы...');
    
    try {
        // Убеждаемся, что генератор зарегистрирован
        registerCodeGenerators();
        
        // Проверяем, что генератор действительно зарегистрирован
        const hasDirect = typeof Blockly.JavaScript['move_forward'] === 'function';
        const hasForBlock = Blockly.JavaScript.forBlock && typeof Blockly.JavaScript.forBlock['move_forward'] === 'function';
        
        console.log('Проверка генератора:', { hasDirect, hasForBlock });
        
        if (!hasDirect && !hasForBlock) {
            // Последняя попытка - регистрируем напрямую
            Blockly.JavaScript['move_forward'] = function(block) {
                return 'moveForward();\n';
            };
            if (!Blockly.JavaScript.forBlock) {
                Blockly.JavaScript.forBlock = {};
            }
            Blockly.JavaScript.forBlock['move_forward'] = function(block) {
                return 'moveForward();\n';
            };
            console.log('✅ Генератор зарегистрирован в runCode (экстренная регистрация)');
        }
        
        // Генерируем код
        const code = Blockly.JavaScript.workspaceToCode(workspace);
        console.log('Выполняемый код:', code);
        
        if (!code || code.trim() === '') {
            updateConsole('> Ошибка: нет команд для выполнения');
            updateConsole('> Перетащи блок "двигаться вперед" в рабочую область');
            return;
        }
        
        // Определяем функцию moveForward для выполнения
        window.moveForward = function() {
            updateConsole('> Выполняю: двигаться вперед');
            moveDroneToFinish();
        };
        
        // Выполняем сгенерированный код
        eval(code);
        
    } catch (error) {
        console.error('Ошибка выполнения кода:', error);
        updateConsole('> Ошибка выполнения: ' + error.message);
        
        // Если ошибка связана с генератором, показываем детали
        if (error.message.includes('generator does not know')) {
            console.error('Генератор не найден. Проверяем структуру Blockly.JavaScript:');
            console.log('Blockly.JavaScript:', Blockly.JavaScript);
            console.log('forBlock:', Blockly.JavaScript.forBlock);
            console.log('Прямой доступ:', Blockly.JavaScript['move_forward']);
            updateConsole('> КРИТИЧЕСКАЯ ОШИБКА: генератор кода не зарегистрирован');
        }
    }
}

function moveDroneToFinish() {
    // Анимация движения дрона к финишу
    game.scene.scenes[0].tweens.add({
        targets: player,
        x: 500,
        duration: 3000,
        ease: 'Power2',
        onComplete: function() {
            updateConsole('> Дрон достиг финиша!');
            updateConsole('> Уровень пройден!');
            completeLevel();
        }
    });
}

function resetLevel() {
    player.x = 100;
    updateConsole('> Сброс системы...');
    updateConsole('> Дрон возвращен на старт');
}

async function completeLevel() {
    // Получаем текущий levelId из URL
    const urlParams = new URLSearchParams(window.location.search);
    const levelId = urlParams.get('level') || '1.1';
    
    updateConsole('> Сохранение прогресса...');
    
    // Обновляем прогресс через API
    const updatedProfile = await updateProgress(levelId);
    
    if (updatedProfile) {
        // Синхронизируем локальный профиль с backend-прогрессом
        try {
            const profileStr = localStorage.getItem('cyberSystemsProfile');
            let localProfile = profileStr ? JSON.parse(profileStr) : null;
            
            const levelsOrder = [
                '1.1', '1.2', '1.boss',
                '2.1', '2.2', '2.boss',
                '3.1', '3.2', '3.boss'
            ];
            
            if (!localProfile) {
                localProfile = {
                    currentLevelId: levelId,
                    lastCompleted: levelId,
                    juniorUnlocked: false,
                    seniorUnlocked: false
                };
            } else {
                // Обновляем только факт последнего завершённого уровня
                // (карта сама решает, какие уровни открыть дальше)
                localProfile.currentLevelId = levelId;
                localProfile.lastCompleted = levelId;
            }
            
            // Обновляем флаги карьерных ступеней (примерная логика)
            localProfile.juniorUnlocked = localProfile.juniorUnlocked || levelId.startsWith('2.');
            localProfile.seniorUnlocked = localProfile.seniorUnlocked || levelId.includes('boss');
            
            localStorage.setItem('cyberSystemsProfile', JSON.stringify(localProfile));
            console.log('✅ Локальный профиль обновлён после уровня:', localProfile);
        } catch (e) {
            console.error('Ошибка синхронизации локального профиля:', e);
        }

        updateConsole('> Прогресс сохранен!');
        setTimeout(() => {
            alert('🎉 Уровень пройден! Возвращаемся на карту...');
            window.location.href = '../level-map/index.html';
        }, 1000);
    } else {
        updateConsole('> Ошибка сохранения прогресса, но уровень пройден!');
        setTimeout(() => {
            alert('🎉 Уровень пройден! (Прогресс не сохранен из-за ошибки)');
            window.location.href = '../level-map/index.html';
        }, 1000);
    }
}

function showHelp() {
    alert('ПОМОЩЬ:\n\nПеретащи блок "двигаться вперед" в рабочую область и нажми "ЗАПУСТИТЬ ПРОГРАММУ"');
}

function updateConsole(message) {
    const consoleOutput = document.getElementById('console-output');
    consoleOutput.innerHTML += `<div>> ${message}</div>`;
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}