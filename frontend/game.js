// ===== ИНИЦИАЛИЗАЦИЯ УРОВНЯ =====
document.addEventListener('DOMContentLoaded', function() {
    const levelId = localStorage.getItem('currentLevel') || '1.1';
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

function createCustomBlocks() {
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
    
    // Добавь другие блоки по мере необходимости
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
    // Загрузка ресурсов для уровня
    this.load.image('drone', 'data:image/png;base64,...'); // временный спрайт
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
    
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    console.log('Выполняемый код:', code);
    
    if (code.includes('moveForward')) {
        updateConsole('> Выполняю: двигаться вперед');
        // Логика движения дрона
        moveDroneToFinish();
    } else {
        updateConsole('> Ошибка: нет команд для выполнения');
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

function completeLevel() {
    // Логика завершения уровня
    setTimeout(() => {
        alert('🎉 Уровень пройден! Возвращаемся на карту...');
        window.location.href = 'level-map.html';
    }, 1000);
}

function showHelp() {
    alert('ПОМОЩЬ:\n\nПеретащи блок "двигаться вперед" в рабочую область и нажми "ЗАПУСТИТЬ ПРОГРАММУ"');
}

function updateConsole(message) {
    const consoleOutput = document.getElementById('console-output');
    consoleOutput.innerHTML += `<div>> ${message}</div>`;
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}