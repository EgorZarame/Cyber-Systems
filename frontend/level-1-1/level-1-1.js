// Конфигурация уровня 1.1
const levelConfig = {
    id: '1.1',
    title: 'Первые шаги',
    gridSizeX: 10,
    gridSizeY: 6,
    start: { x: 1, y: 3 },
    finish: { x: 8, y: 3 },
    path: [
        { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, 
        { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 },
        { x: 7, y: 3 }, { x: 8, y: 3 }
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
            }

            grid.appendChild(cell);
        }
    }

    updateDronePosition();
}

// Drag and Drop
function initializeDragAndDrop() {
    const block = document.querySelector('.code-block[draggable="true"]');
    const codeArea = document.getElementById('codeArea');

    block.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', 'move');
    });

    codeArea.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    codeArea.addEventListener('drop', (e) => {
        e.preventDefault();
        addBlockToProgram('move');
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
    block.textContent = 'ДВИГАТЬСЯ_ВПЕРЕД()';
    block.dataset.action = action;
    
    block.addEventListener('dblclick', () => {
        if (!isExecuting) {
            block.remove();
            programBlocks = programBlocks.filter(b => b.element !== block);
            updateProgramState();
        }
    });

    codeArea.appendChild(block);
    programBlocks.push({ action, element: block });
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
            await completeLevel();
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
    const { element } = blockData;
    
    switch (blockData.action) {
        case 'move':
            await moveForward();
            break;
    }
}

// Движение вперед
async function moveForward() {
    let newX = drone.x + 1;
    let newY = drone.y;

    // Анимация движения
    const droneElement = document.querySelector('.drone');
    if (droneElement) {
        droneElement.classList.add('drone-moving');
    }

    await new Promise(resolve => setTimeout(resolve, 400));

    if (newX < levelConfig.gridSizeX) {
        drone.x = newX;
    }

    updateDronePosition();
    
    if (droneElement) {
        setTimeout(() => {
            droneElement.classList.remove('drone-moving');
        }, 200);
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

// Завершение уровня и сохранение прогресса
async function completeLevel() {
    isExecuting = false;
    
    try {
        await updateProgress('1.1');
        addConsoleMessage('Прогресс сохранен');
    } catch (error) {
        console.error('Ошибка обновления прогресса (1.1):', error);
    }
    syncLocalProfileAfterLevel('1.1');
    
    setTimeout(() => {
        alert('🎉 Уровень пройден!');
        goToLevelMap();
    }, 500);
}

// Навигация
function goBack() {
    window.location.href = '../level-map/index.html';
}

function showHelp() {
    alert('Помощь:\n\nПеретащите блок ДВИГАТЬСЯ_ВПЕРЕД() в область программы\nЗапустите программу чтобы двигать дрона');
}

function goToLevelMap() {
    window.location.href = '../level-map/index.html';
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initializeLevel);