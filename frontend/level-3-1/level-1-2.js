// Конфигурация уровня 1.2
const levelConfig = {
    id: '1.2',
    title: 'Повороты',
    gridSize: 8,
    start: { x: 1, y: 1 },
    finish: { x: 6, y: 6 },
    obstacles: [
        { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 },
        { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 },
        { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }
    ],
    description: 'Построй L-образный маршрут для дрона, используя повороты'
};

let drone = {
    x: levelConfig.start.x,
    y: levelConfig.start.y,
    direction: 'east'
};

let programBlocks = [];

// Инициализация уровня
function initializeLevel() {
    initializeGameGrid();
    initializeDragAndDrop();
    showInstruction();
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
            } else if (x === levelConfig.finish.x && y === levelConfig.finish.y) {
                cell.classList.add('finish');
            } else if (levelConfig.obstacles.some(obs => obs.x === x && obs.y === y)) {
                cell.classList.add('obstacle');
            }

            grid.appendChild(cell);
        }
    }

    updateDronePosition();
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
        default: return 'НЕИЗВЕСТНЫЙ_БЛОК';
    }
}

// Выполнение программы
async function runProgram() {
    resetDrone();
    
    for (const block of programBlocks) {
        await executeAction(block.action);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (drone.x === levelConfig.finish.x && drone.y === levelConfig.finish.y) {
            await completeLevel();
            break;
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
    }
}

function turnLeft() {
    const directions = ['north', 'west', 'south', 'east'];
    const currentIndex = directions.indexOf(drone.direction);
    drone.direction = directions[(currentIndex + 1) % 4];
}

function turnRight() {
    const directions = ['north', 'east', 'south', 'west'];
    const currentIndex = directions.indexOf(drone.direction);
    drone.direction = directions[(currentIndex + 1) % 4];
}

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

function resetProgram() {
    const codeArea = document.getElementById('codeBlocks');
    codeArea.innerHTML = '';
    programBlocks = [];
    updateProgramState();
    resetDrone();
}

function resetDrone() {
    drone.x = levelConfig.start.x;
    drone.y = levelConfig.start.y;
    drone.direction = 'east';
    updateDronePosition();
}

function updateProgramState() {
    const codeArea = document.getElementById('codeBlocks');
    if (programBlocks.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'block placeholder';
        placeholder.textContent = 'Перетащите блоки сюда';
        codeArea.appendChild(placeholder);
    }
}

function showInstruction() {
    // Можно добавить всплывающую подсказку
    console.log('Используйте блоки ПОВОРОТОВ чтобы обойти препятствия!');
}

async function completeLevel() {
    // Сохраняем прогресс
    await updateProgress('1.2');
    
    // Показываем сообщение об успехе
    alert('🎉 Уровень пройден! Дрон достиг цели! 🎉');
    
    // Возвращаем на карту через 2 секунды
    setTimeout(() => {
        goToLevelMap();
    }, 2000);
}

function goToLevelMap() {
    window.location.href = '../level-map/index.html';
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initializeLevel);