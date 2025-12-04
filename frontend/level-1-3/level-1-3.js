// Конфигурация уровня 1.3 - Босс
const levelConfig = {
    id: '1.3',
    title: 'Босс - Сбойный дрон',
    gridSizeX: 10,
    gridSizeY: 6,
    start: { x: 1, y: 3 },
    finish: { x: 8, y: 3 },
    bossPosition: { x: 8, y: 3 },
    bossHealth: 100,
    obstacles: [
        { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 },
        { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }
    ]
};

let drone = {
    x: levelConfig.start.x,
    y: levelConfig.start.y,
    direction: 'east',
    hasAttacked: false
};

let boss = {
    health: levelConfig.bossHealth,
    position: levelConfig.bossPosition,
    isActive: true
};

let programBlocks = [];
let isExecuting = false;

// Инициализация уровня
function initializeLevel() {
    initializeGameGrid();
    initializeDragAndDrop();
    updateBossHealth();
    addConsoleMessage('🟢 Дрон готов к бою', 'player');
    addConsoleMessage('🎯 Доберитесь до босса и атакуйте его!', 'player');
}

// Инициализация игрового поля
function initializeGameGrid() {
    const grid = document.getElementById('gameGrid');
    grid.innerHTML = '';

    for (let y = 0; y < levelConfig.gridSizeY; y++) {
        for (let x = 0; x < levelConfig.gridSizeX; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;

            if (x === levelConfig.start.x && y === levelConfig.start.y) {
                cell.classList.add('start');
            } else if (x === levelConfig.bossPosition.x && y === levelConfig.bossPosition.y) {
                cell.classList.add('finish', 'boss-area');
            } else if (levelConfig.obstacles.some(obs => obs.x === x && obs.y === y)) {
                cell.classList.add('obstacle');
            }

            grid.appendChild(cell);
        }
    }

    // Добавляем босса
    addBossDrone();
    updateDronePosition();
}

// Добавление босса на поле
function addBossDrone() {
    const bossCell = document.querySelector(`[data-x="${boss.position.x}"][data-y="${boss.position.y}"]`);
    if (bossCell) {
        const bossElement = document.createElement('div');
        bossElement.className = 'boss-drone';
        bossElement.id = 'bossDrone';
        bossCell.appendChild(bossElement);
    }
}

// Drag and Drop
function initializeDragAndDrop() {
    const blocks = document.querySelectorAll('.code-block[draggable="true"]');
    const codeArea = document.getElementById('codeArea');

    blocks.forEach(block => {
        block.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', block.dataset.action);
        });
    });

    codeArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
    });

    codeArea.addEventListener('dragleave', (e) => {
        e.currentTarget.style.backgroundColor = '';
    });

    codeArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = '';
        const action = e.dataTransfer.getData('text/plain');
        addBlockToProgram(action);
    });
}

// Добавление блока в программу
function addBlockToProgram(action) {
    const codeArea = document.getElementById('codeArea');
    const placeholder = codeArea.querySelector('.code-placeholder');
    
    if (placeholder) {
        placeholder.remove();
    }

    const block = document.createElement('div');
    block.className = 'code-block';
    block.textContent = getBlockText(action);
    block.dataset.action = action;
    
    // Добавляем класс для стилизации
    if (action === 'move') {
        block.classList.add('movement');
    } else if (action === 'attack') {
        block.classList.add('attack');
    } else {
        block.classList.add('rotation');
    }
    
    block.addEventListener('dblclick', () => {
        if (!isExecuting) {
            block.remove();
            programBlocks = programBlocks.filter(b => b.element !== block);
            updateProgramState();
        }
    });

    codeArea.appendChild(block);
    programBlocks.push({ action, element: block });
    
    addConsoleMessage(`Добавлен блок: ${getBlockText(action)}`, 'player');
}

function getBlockText(action) {
    switch (action) {
        case 'move': return 'ДВИГАТЬСЯ_ВПЕРЕД()';
        case 'left': return 'ПОВЕРНУТЬ_НАЛЕВО()';
        case 'right': return 'ПОВЕРНУТЬ_НАПРАВО()';
        case 'attack': return 'АТАКОВАТЬ_БОССА()';
        default: return 'НЕИЗВЕСТНАЯ_КОМАНДА';
    }
}

// Запуск программы
async function runProgram() {
    if (isExecuting) return;
    
    if (programBlocks.length === 0) {
        addConsoleMessage('❌ Ошибка: программа пуста!', 'player');
        return;
    }

    isExecuting = true;
    resetDrone();
    addConsoleMessage('⚡ Запуск боевой программы...', 'player');

    for (const block of programBlocks) {
        if (!isExecuting || !boss.isActive) break;
        
        await executeAction(block);
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Случайная атака босса
        if (boss.isActive && Math.random() < 0.3) {
            await bossAttack();
        }
    }
    
    if (isExecuting) {
        addConsoleMessage('🛑 Программа завершена', 'player');
        isExecuting = false;
    }
}

// Выполнение действия
async function executeAction(blockData) {
    const { action, element } = blockData;
    
    addConsoleMessage(`Выполняется: ${getBlockText(action)}`, 'player');

    switch (action) {
        case 'move':
            await moveForward();
            break;
        case 'left':
            await turnLeft();
            break;
        case 'right':
            await turnRight();
            break;
        case 'attack':
            await attackBoss();
            break;
    }
}

// Движение вперед
async function moveForward() {
    let newX = drone.x;
    let newY = drone.y;

    switch (drone.direction) {
        case 'north': newY--; break;
        case 'east': newX++; break;
        case 'south': newY++; break;
        case 'west': newX--; break;
    }

    // Анимация движения
    const droneElement = document.querySelector('.drone');
    if (droneElement) {
        droneElement.classList.add('drone-moving');
        droneElement.style.setProperty('--rotation', 
            drone.direction === 'north' ? '0deg' :
            drone.direction === 'east' ? '90deg' :
            drone.direction === 'south' ? '180deg' : '270deg');
    }

    await new Promise(resolve => setTimeout(resolve, 400));

    // Проверка препятствий и границ
    const hasObstacle = levelConfig.obstacles.some(obs => obs.x === newX && obs.y === newY);
    
    if (newX >= 0 && newX < levelConfig.gridSizeX && 
        newY >= 0 && newY < levelConfig.gridSizeY &&
        !hasObstacle) {
        drone.x = newX;
        drone.y = newY;
        addConsoleMessage(`✅ Перемещение на (${newX}, ${newY})`, 'player');
    } else {
        addConsoleMessage('❌ Препятствие или граница поля', 'player');
    }

    updateDronePosition();
    
    if (droneElement) {
        setTimeout(() => {
            droneElement.classList.remove('drone-moving');
        }, 200);
    }
}

// Поворот налево
async function turnLeft() {
    const directions = ['north', 'west', 'south', 'east'];
    const currentIndex = directions.indexOf(drone.direction);
    drone.direction = directions[(currentIndex + 1) % 4];
    
    addConsoleMessage(`↩️ Поворот налево. Направление: ${drone.direction}`, 'player');
    updateDronePosition();
    
    await new Promise(resolve => setTimeout(resolve, 400));
}

// Поворот направо
async function turnRight() {
    const directions = ['north', 'east', 'south', 'west'];
    const currentIndex = directions.indexOf(drone.direction);
    drone.direction = directions[(currentIndex + 1) % 4];
    
    addConsoleMessage(`↪️ Поворот направо. Направление: ${drone.direction}`, 'player');
    updateDronePosition();
    
    await new Promise(resolve => setTimeout(resolve, 400));
}

// Атака босса
async function attackBoss() {
    // Проверяем, находится ли дрон рядом с боссом
    const distance = Math.abs(drone.x - boss.position.x) + Math.abs(drone.y - boss.position.y);
    
    if (distance <= 1) {
        const damage = 25 + Math.floor(Math.random() * 10); // 25-35 урона
        boss.health = Math.max(0, boss.health - damage);
        drone.hasAttacked = true;
        
        updateBossHealth();
        addConsoleMessage(`💥 Атака по боссу! Нанесено ${damage} урона!`, 'player');
        
        // Анимация атаки
        const bossElement = document.getElementById('bossDrone');
        if (bossElement) {
            bossElement.style.animation = 'none';
            setTimeout(() => {
                bossElement.style.animation = 'bossFloat 3s infinite ease-in-out';
            }, 100);
        }
        
        if (boss.health <= 0) {
            await defeatBoss();
        }
    } else {
        addConsoleMessage('❌ Босс слишком далеко для атаки!', 'player');
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
}

// Атака босса
async function bossAttack() {
    if (!boss.isActive) return;
    
    const attacks = [
        '🔄 Босс создает помехи!',
        '⚡ Сбойный дрон активирует защиту!',
        '💢 Атака босса! Дрон замедлен!',
        '🔴 Босс вызывает подкрепление!'
    ];
    
    const attackText = attacks[Math.floor(Math.random() * attacks.length)];
    addConsoleMessage(attackText, 'boss');
    
    // Визуальный эффект атаки босса
    const gameGrid = document.getElementById('gameGrid');
    gameGrid.style.borderColor = '#ff0000';
    setTimeout(() => {
        if (boss.isActive) {
            gameGrid.style.borderColor = '#ff4444';
        }
    }, 500);
    
    await new Promise(resolve => setTimeout(resolve, 600));
}

// Победа над боссом
async function defeatBoss() {
    boss.isActive = false;
    boss.health = 0;
    updateBossHealth();
    
    addConsoleMessage('🎉 БОСС ПОБЕЖДЁН! СИСТЕМА ВОССТАНОВЛЕНА!', 'success');
    
    // Анимация победы
    const bossElement = document.getElementById('bossDrone');
    if (bossElement) {
        bossElement.style.animation = 'none';
        bossElement.style.background = '#4CAF50';
        bossElement.style.boxShadow = '0 0 20px #4CAF50';
        bossElement.innerHTML = '✅';
    }
    
    isExecuting = false;
    
    // Сохраняем прогресс
    setTimeout(() => {
        completeLevel();
    }, 1500);
}

// Обновление здоровья босса
function updateBossHealth() {
    const healthBar = document.getElementById('bossHealth');
    const healthText = document.getElementById('healthText');
    const healthPercent = Math.max(0, boss.health);
    
    if (healthBar) {
        healthBar.style.width = `${healthPercent}%`;
    }
    
    if (healthText) {
        healthText.textContent = `${healthPercent}%`;
        
        if (healthPercent <= 25) {
            healthText.style.color = '#ff0000';
        } else if (healthPercent <= 50) {
            healthText.style.color = '#ff8800';
        } else {
            healthText.style.color = '#ffffff';
        }
    }
}

// Обновление позиции дрона
function updateDronePosition() {
    const oldDrone = document.querySelector('.drone');
    if (oldDrone) oldDrone.remove();

    const cell = document.querySelector(`[data-x="${drone.x}"][data-y="${drone.y}"]`);
    if (cell) {
        const droneElement = document.createElement('div');
        droneElement.className = `drone ${drone.direction}`;
        cell.appendChild(droneElement);
    }
}

// Сброс программы
function resetProgram() {
    if (isExecuting) {
        isExecuting = false;
        addConsoleMessage('⚠️ Программа прервана', 'player');
    }
    
    const codeArea = document.getElementById('codeArea');
    codeArea.innerHTML = '';
    programBlocks = [];
    updateProgramState();
    resetDrone();
    resetBoss();
    addConsoleMessage('🔄 Программа сброшена', 'player');
}

// Сброс дрона
function resetDrone() {
    drone.x = levelConfig.start.x;
    drone.y = levelConfig.start.y;
    drone.direction = 'east';
    drone.hasAttacked = false;
    updateDronePosition();
}

// Сброс босса
function resetBoss() {
    boss.health = levelConfig.bossHealth;
    boss.isActive = true;
    updateBossHealth();
    
    const bossElement = document.getElementById('bossDrone');
    if (bossElement) {
        bossElement.style.background = '#ff4444';
        bossElement.style.boxShadow = '0 0 15px #ff0000';
        bossElement.style.animation = 'bossFloat 3s infinite ease-in-out';
        bossElement.innerHTML = '☠️';
    }
}

// Обновление состояния программы
function updateProgramState() {
    const codeArea = document.getElementById('codeArea');
    if (programBlocks.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'code-placeholder';
        placeholder.textContent = 'Перетащите блоки сюда';
        codeArea.appendChild(placeholder);
    }
}

// Добавление сообщения в консоль
function addConsoleMessage(message, type = 'player') {
    const consoleOutput = document.getElementById('consoleOutput');
    const messageElement = document.createElement('div');
    messageElement.className = `console-line log-${type}`;
    messageElement.textContent = message;
    
    consoleOutput.appendChild(messageElement);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Завершение уровня
function completeLevel() {
    // Сохраняем прогресс в localStorage
    localStorage.setItem('cyberSystemsProgress', JSON.stringify({
        currentLevel: '1.boss',
        lastCompleted: '1.boss'
    }));
    
    alert('🎊 ПОБЕДА!\n\nВы победили сбойного дрона!\nСистема восстановлена!\n\nПовышение до Junior-программиста!');
    goToLevelMap();
}

// Навигация
function goBack() {
    window.location.href = '../level-map/index.html';
}

function showHelp() {
    alert('Помощь по уровню Босс:\n\n' +
          '1. Доберитесь до босса (красная клетка)\n' +
          '2. Используйте АТАКОВАТЬ_БОССА() когда рядом\n' +
          '3. Уничтожьте босса (100 HP)\n' +
          '4. Избегайте красных препятствий\n\n' +
          'Пример решения:\n' +
          'ДВИГАТЬСЯ_ВПЕРЕД() (x5)\n' +
          'ПОВЕРНУТЬ_НАПРАВО()\n' +
          'ДВИГАТЬСЯ_ВПЕРЕД() (x3)\n' +
          'АТАКОВАТЬ_БОССА() (x4)');
}

function goToLevelMap() {
    window.location.href = '../level-map/index.html';
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initializeLevel);