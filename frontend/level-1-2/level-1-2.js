// Конфигурация уровня 1.2 - L-образный маршрут
const levelConfig = {
    id: '1.2',
    title: 'Повороты',
    gridSizeX: 10,
    gridSizeY: 6,
    start: { x: 1, y: 1 },
    finish: { x: 8, y: 4 },
    obstacles: [
        { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 },
        { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 8, y: 3 }
    ]
};

let drone = {
    x: levelConfig.start.x,
    y: levelConfig.start.y,
    direction: 'east'
};

let programBlocks = [];
let isExecuting = false;

// Инициализация уровня
function initializeLevel() {
    initializeGameGrid();
    initializeDragAndDrop();
    addConsoleMessage('Дрон готов');
    addConsoleMessage('Используйте повороты для обхода препятствий');
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
    const blocks = document.querySelectorAll('.code-block[draggable="true"]');
    const codeArea = document.getElementById('codeArea');

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
    
    addConsoleMessage(`Добавлен блок: ${getBlockText(action)}`);
}

function getBlockText(action) {
    switch (action) {
        case 'move': return 'ДВИГАТЬСЯ_ВПЕРЕД()';
        case 'left': return 'ПОВЕРНУТЬ_НАЛЕВО()';
        case 'right': return 'ПОВЕРНУТЬ_НАПРАВО()';
        default: return 'НЕИЗВЕСТНАЯ_КОМАНДА';
    }
}

// Запуск программы
async function runProgram() {
    if (isExecuting) return;
    
    if (programBlocks.length === 0) {
        addConsoleMessage('Ошибка: программа пуста!');
        return;
    }

    isExecuting = true;
    resetDrone();
    addConsoleMessage('Программа запущена');

    for (const block of programBlocks) {
        if (!isExecuting) break;
        
        await executeAction(block);
        await new Promise(resolve => setTimeout(resolve, 600));
        
        if (drone.x === levelConfig.finish.x && drone.y === levelConfig.finish.y) {
            addConsoleMessage('Дрон достиг цели!');
            setTimeout(() => {
                completeLevel();
            }, 1000);
            break;
        }
    }
    
    if (isExecuting) {
        addConsoleMessage('Программа завершена');
        isExecuting = false;
    }
}

// Выполнение действия
async function executeAction(blockData) {
    const { action, element } = blockData;
    
    addConsoleMessage(`Выполняется: ${getBlockText(action)}`);

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
    }

    await new Promise(resolve => setTimeout(resolve, 400));

    // Проверка препятствий и границ
    const hasObstacle = levelConfig.obstacles.some(obs => obs.x === newX && obs.y === newY);
    
    if (newX >= 0 && newX < levelConfig.gridSizeX && 
        newY >= 0 && newY < levelConfig.gridSizeY &&
        !hasObstacle) {
        drone.x = newX;
        drone.y = newY;
        addConsoleMessage(`Успех: перемещение на (${newX}, ${newY})`);
    } else {
        addConsoleMessage('Ошибка: препятствие или граница поля');
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
    
    addConsoleMessage(`Поворот налево. Направление: ${drone.direction}`);
    updateDronePosition();
    
    await new Promise(resolve => setTimeout(resolve, 400));
}

// Поворот направо
async function turnRight() {
    const directions = ['north', 'east', 'south', 'west'];
    const currentIndex = directions.indexOf(drone.direction);
    drone.direction = directions[(currentIndex + 1) % 4];
    
    addConsoleMessage(`Поворот направо. Направление: ${drone.direction}`);
    updateDronePosition();
    
    await new Promise(resolve => setTimeout(resolve, 400));
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
        addConsoleMessage('Программа прервана');
    }
    
    const codeArea = document.getElementById('codeArea');
    codeArea.innerHTML = '';
    programBlocks = [];
    updateProgramState();
    resetDrone();
    addConsoleMessage('Программа сброшена');
}

// Сброс дрона
function resetDrone() {
    drone.x = levelConfig.start.x;
    drone.y = levelConfig.start.y;
    drone.direction = 'east';
    updateDronePosition();
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
function addConsoleMessage(message) {
    const consoleOutput = document.getElementById('consoleOutput');
    const messageElement = document.createElement('div');
    messageElement.className = 'console-line';
    messageElement.textContent = message;
    
    consoleOutput.appendChild(messageElement);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Завершение уровня
async function completeLevel() {
    isExecuting = false;
    
    try {
        await updateProgress('1.2');
        addConsoleMessage('Прогресс сохранен');
    } catch (error) {
        console.error('Ошибка обновления прогресса (1.2):', error);
    }
    syncLocalProfileAfterLevel('1.2');
    
    setTimeout(() => {
        alert('🎉 Уровень пройден!\n\nВы освоили повороты дрона!');
        goToLevelMap();
    }, 500);
}

// Навигация
function goBack() {
    window.location.href = '../level-map/index.html';
}

function showHelp() {
    alert('Помощь по уровню 1.2:\n\n' +
          '1. Используйте ДВИГАТЬСЯ_ВПЕРЕД() для движения\n' +
          '2. Используйте ПОВЕРНУТЬ_НАЛЕВО() и ПОВЕРНУТЬ_НАПРАВО() для смены направления\n' +
          '3. Обойдите красные препятствия\n' +
          '4. Достигните оранжевой клетки');
}

function goToLevelMap() {
    window.location.href = '../level-map/index.html';
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initializeLevel);