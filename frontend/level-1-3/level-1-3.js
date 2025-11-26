// Конфигурация уровня босса
const levelConfig = {
    id: '1.3',
    title: 'Босс - Сбойный дрон',
    gridSize: 10,
    start: { x: 1, y: 1 },
    finish: { x: 8, y: 8 },
    bossPosition: { x: 8, y: 8 },
    bossHealth: 100,
    obstacles: [
        { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 },
        { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 },
        { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
        { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 },
        { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }
    ],
    enemyDrones: [
        { x: 5, y: 2, active: true },
        { x: 2, y: 5, active: true },
        { x: 7, y: 6, active: true }
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
let combatLog = [];

// Инициализация уровня
function initializeLevel() {
    console.log('🎮 Инициализация уровня босса 1.3');
    initializeGameGrid();
    initializeDragAndDrop();
    updateBossHealth();
    addCombatLog('⚡ Босс-дрон активирован! Уничтожьте его!', 'boss');
}

// Инициализация игрового поля
function initializeGameGrid() {
    const grid = document.getElementById('gameGrid');
    grid.innerHTML = '';

    for (let y = 0; y < levelConfig.gridSize; y++) {
        for (let x = 0; x < levelConfig.gridSize; x++) {
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

    // Добавляем босса и вражеских дронов
    addBossDrone();
    addEnemyDrones();
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

// Добавление вражеских дронов
function addEnemyDrones() {
    levelConfig.enemyDrones.forEach((enemy, index) => {
        if (enemy.active) {
            const enemyCell = document.querySelector(`[data-x="${enemy.x}"][data-y="${enemy.y}"]`);
            if (enemyCell) {
                const enemyElement = document.createElement('div');
                enemyElement.className = 'enemy-drone';
                enemyElement.id = `enemy-${index}`;
                enemyCell.appendChild(enemyElement);
            }
        }
    });
}

// Drag and Drop
function initializeDragAndDrop() {
    const blocks = document.querySelectorAll('.block[draggable="true"]');
    const codeArea = document.getElementById('codeBlocks');

    blocks.forEach(block => {
        block.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', block.dataset.action);
        });
    });

    codeArea.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    codeArea.addEventListener('drop', (e) => {
        e.preventDefault();
        const action = e.dataTransfer.getData('text/plain');
        addBlockToProgram(action);
    });
}

// Добавление блока в программу
function addBlockToProgram(action) {
    const codeArea = document.getElementById('codeBlocks');
    const placeholder = codeArea.querySelector('.placeholder');
    
    if (placeholder) {
        placeholder.remove();
    }

    const block = document.createElement('div');
    block.className = 'block';
    block.textContent = getBlockText(action);
    block.dataset.action = action;
    
    block.addEventListener('dblclick', () => {
        block.remove();
        programBlocks = programBlocks.filter(b => b.element !== block);
        updateProgramState();
    });

    codeArea.appendChild(block);
    programBlocks.push({ action, element: block });
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

// Выполнение программы
async function runProgram() {
    resetDrone();
    drone.hasAttacked = false;
    
    for (const block of programBlocks) {
        if (!boss.isActive) break; // Босс побежден
        
        await executeAction(block.action);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Проверка достижения босса
        if (drone.x === boss.position.x && drone.y === boss.position.y && drone.hasAttacked) {
            await defeatBoss();
            break;
        }
        
        // Случайная атака босса
        if (Math.random() < 0.3) {
            await bossAttack();
        }
    }
}

async function executeAction(action) {
    const block = programBlocks.find(b => b.action === action)?.element;
    if (block) {
        block.classList.add('pulse');
    }

    switch (action) {
        case 'move':
            moveForward();
            break;
        case 'left':
            turnLeft();
            break;
        case 'right':
            turnRight();
            break;
        case 'attack':
            await attackBoss();
            break;
    }

    updateDronePosition();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (block) {
        block.classList.remove('pulse');
    }
}

function moveForward() {
    let newX = drone.x;
    let newY = drone.y;

    switch (drone.direction) {
        case 'north': newY--; break;
        case 'east': newX++; break;
        case 'south': newY++; break;
        case 'west': newX--; break;
    }

    if (newX >= 0 && newX < levelConfig.gridSize && 
        newY >= 0 && newY < levelConfig.gridSize &&
        !levelConfig.obstacles.some(obs => obs.x === newX && obs.y === newY)) {
        drone.x = newX;
        drone.y = newY;
        addCombatLog(`➡️ Дрон переместился на (${newX}, ${newY})`, 'player');
    } else {
        addCombatLog('❌ Невозможно переместиться! Препятствие!', 'player');
    }
}

function turnLeft() {
    const directions = ['north', 'west', 'south', 'east'];
    const currentIndex = directions.indexOf(drone.direction);
    drone.direction = directions[(currentIndex + 1) % 4];
    addCombatLog('↩️ Дрон повернул налево', 'player');
}

function turnRight() {
    const directions = ['north', 'east', 'south', 'west'];
    const currentIndex = directions.indexOf(drone.direction);
    drone.direction = directions[(currentIndex + 1) % 4];
    addCombatLog('↪️ Дрон повернул направо', 'player');
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
        addCombatLog(`💥 Атака по боссу! Нанесено ${damage} урона!`, 'player');
        
        // Анимация атаки
        const bossElement = document.getElementById('bossDrone');
        if (bossElement) {
            bossElement.style.animation = 'none';
            bossElement.offsetHeight; // Trigger reflow
            bossElement.style.animation = 'bossFloat 3s infinite ease-in-out';
        }
        
        if (boss.health <= 0) {
            await defeatBoss();
        }
    } else {
        addCombatLog('❌ Босс слишком далеко для атаки!', 'player');
    }
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
    addCombatLog(attackText, 'boss');
    
    // Визуальный эффект атаки босса
    const gameGrid = document.getElementById('gameGrid');
    gameGrid.style.borderColor = '#ff0000';
    setTimeout(() => {
        if (boss.isActive) {
            gameGrid.style.borderColor = '#ff4444';
        }
    }, 500);
}

// Победа над боссом
async function defeatBoss() {
    boss.isActive = false;
    boss.health = 0;
    updateBossHealth();
    
    addCombatLog('🎉 БОСС ПОБЕЖДЁН! СИСТЕМА ВОССТАНОВЛЕНА!', 'player');
    
    // Анимация победы
    const bossElement = document.getElementById('bossDrone');
    if (bossElement) {
        bossElement.style.animation = 'none';
        bossElement.style.background = '#4CAF50';
        bossElement.style.boxShadow = '0 0 20px #4CAF50';
        bossElement.innerHTML = '✅';
    }
    
    // Сохраняем прогресс
    setTimeout(async () => {
        try {
            await updateProgress('1.boss');
            alert(`🎊 ПОБЕДА!\n\nВы победили сбойного дрона и восстановили контроль над системой!\n\nПовышение до Junior-программиста!`);
            goToLevelMap();
        } catch (error) {
            console.error('Ошибка сохранения прогресса:', error);
            alert('🎊 ПОБЕДА! Но произошла ошибка сохранения прогресса.');
        }
    }, 2000);
}

function updateBossHealth() {
    const healthBar = document.getElementById('bossHealth');
    const healthText = document.getElementById('healthText');
    const healthPercent = Math.max(0, boss.health);
    
    if (healthBar) {
        healthBar.style.width = `${healthPercent}%`;
    }
    
    if (healthText) {
        healthText.textContent = `Здоровье босса: ${healthPercent}%`;
        
        if (healthPercent <= 25) {
            healthText.style.color = '#ff0000';
        } else if (healthPercent <= 50) {
            healthText.style.color = '#ff8800';
        } else {
            healthText.style.color = '#ffffff';
        }
    }
}

function updateDronePosition() {
    const oldDrone = document.querySelector('.drone:not(.boss-drone):not(.enemy-drone)');
    if (oldDrone) oldDrone.remove();

    const cell = document.querySelector(`[data-x="${drone.x}"][data-y="${drone.y}"]`);
    if (cell) {
        const droneElement = document.createElement('div');
        droneElement.className = `drone ${drone.direction}`;
        cell.appendChild(droneElement);
    }
}

function addCombatLog(message, type) {
    const combatLog = document.getElementById('combatLog');
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    logEntry.textContent = message;
    
    combatLog.appendChild(logEntry);
    combatLog.scrollTop = combatLog.scrollHeight;
    
    // Ограничиваем количество записей в логе
    const entries = combatLog.querySelectorAll('.log-entry');
    if (entries.length > 10) {
        entries[0].remove();
    }
}

function resetProgram() {
    const codeArea = document.getElementById('codeBlocks');
    codeArea.innerHTML = '';
    programBlocks = [];
    updateProgramState();
    resetDrone();
    
    // Очищаем лог боя
    const combatLog = document.getElementById('combatLog');
    combatLog.innerHTML = '<div class="log-entry log-boss">⚠️ Сбойный дрон активирован!</div>';
}

function resetDrone() {
    drone.x = levelConfig.start.x;
    drone.y = levelConfig.start.y;
    drone.direction = 'east';
    drone.hasAttacked = false;
    updateDronePosition();
}

function updateProgramState() {
    const codeArea = document.getElementById('codeBlocks');
    if (programBlocks.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'block placeholder';
        placeholder.textContent = 'Перетащите команды сюда';
        codeArea.appendChild(placeholder);
    }
}

function goToLevelMap() {
    window.location.href = '../level-map/index.html';
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initializeLevel);