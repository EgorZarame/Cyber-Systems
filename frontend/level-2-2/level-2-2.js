// Конфигурация уровня 2.2 - Лабиринт с повторяющимися паттернами
const levelConfig = {
    id: '2.2',
    title: 'Циклы',
    gridSizeX: 12,
    gridSizeY: 8,
    start: { x: 1, y: 1 },
    finish: { x: 10, y: 6 },
    obstacles: [
        // Паттерн 1 - вертикальные препятствия
        { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
        { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 },
        { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 },
        
        // Паттерн 2 - горизонтальные препятствия
        { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 },
        { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 },
        
        // Паттерн 3 - угловые препятствия
        { x: 1, y: 6 }, { x: 2, y: 6 },
        { x: 10, y: 4 }, { x: 10, y: 5 }
    ],
    patterns: [
        { x: 2, y: 1, width: 1, height: 3, repeat: 3, stepX: 3 },
        { x: 3, y: 4, width: 3, height: 1, repeat: 2, stepY: 1 }
    ]
};

let drone = {
    x: levelConfig.start.x,
    y: levelConfig.start.y,
    direction: 'east'
};

let programBlocks = [];
let isExecuting = false;
let currentLoop = {
    active: false,
    count: 0,
    total: 0,
    blocks: [],
    index: 0
};

// Инициализация уровня
function initializeLevel() {
    initializeGameGrid();
    initializeDragAndDrop();
    updateLoopCounter();
    addConsoleMessage('Дрон готов');
    addConsoleMessage('Используйте циклы для повторяющихся паттернов');
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
            } else if (isPatternCell(x, y)) {
                cell.classList.add('pattern');
            }

            grid.appendChild(cell);
        }
    }

    updateDronePosition();
}

// Проверка, является ли клетка частью паттерна
function isPatternCell(x, y) {
    return levelConfig.patterns.some(pattern => {
        for (let i = 0; i < pattern.repeat; i++) {
            const patternX = pattern.x + (i * (pattern.stepX || 0));
            const patternY = pattern.y + (i * (pattern.stepY || 0));
            
            if (x >= patternX && x < patternX + pattern.width &&
                y >= patternY && y < patternY + pattern.height) {
                return true;
            }
        }
        return false;
    });
}

// Drag and Drop
function initializeDragAndDrop() {
    const blocks = document.querySelectorAll('.code-block[draggable="true"]');
    const codeArea = document.getElementById('codeArea');

    blocks.forEach(block => {
        block.addEventListener('dragstart', (e) => {
            const action = block.dataset.action;
            let data = { action };
            
            if (action === 'loop') {
                const input = block.querySelector('.loop-input');
                data.count = parseInt(input.value) || 3;
            }
            
            e.dataTransfer.setData('application/json', JSON.stringify(data));
        });
    });

    codeArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = 'rgba(255, 152, 0, 0.1)';
    });

    codeArea.addEventListener('dragleave', (e) => {
        e.currentTarget.style.backgroundColor = '';
    });

    codeArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = '';
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        addBlockToProgram(data.action, data.count);
    });
}

// Добавление блока в программу
function addBlockToProgram(action, loopCount = 3) {
    const codeArea = document.getElementById('codeArea');
    const placeholder = codeArea.querySelector('.code-placeholder');
    
    if (placeholder) {
        placeholder.remove();
    }

    const block = document.createElement('div');
    block.className = 'code-block';
    block.dataset.action = action;
    
    if (action === 'loop') {
        block.classList.add('loop');
        block.dataset.count = loopCount;
        
        const content = document.createElement('div');
        content.className = 'loop-content';
        content.innerHTML = `
            повторить(
            <input type="number" class="loop-input" value="${loopCount}" min="1" max="10" onchange="updateLoopCount(this)">
            )
        `;
        block.appendChild(content);
        
        const loopBody = document.createElement('div');
        loopBody.className = 'loop-body';
        loopBody.dataset.loopBody = 'true';
        loopBody.dataset.loopActive = 'true'; // Цикл активен для добавления блоков
        block.appendChild(loopBody);
        
        // Кнопка для завершения тела цикла
        const endLoopBtn = document.createElement('button');
        endLoopBtn.textContent = 'Завершить тело цикла';
        endLoopBtn.className = 'end-loop-btn';
        endLoopBtn.style.cssText = `
            display: block;
            margin-top: 5px;
            margin-left: 20px;
            background: #9C27B0;
            color: white;
            border: none;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 10px;
            cursor: pointer;
        `;
        endLoopBtn.onclick = function() {
            loopBody.dataset.loopActive = 'false';
            this.remove();
            console.log('Тело цикла завершено. Новые блоки будут добавляться после цикла.');
        };
        block.appendChild(endLoopBtn);
        
    } else {
        if (action === 'move') {
            block.classList.add('movement');
        } else {
            block.classList.add('rotation');
        }
        block.textContent = getBlockText(action);
    }
    
    block.addEventListener('dblclick', () => {
        if (!isExecuting) {
            block.remove();
            programBlocks = programBlocks.filter(b => b.element !== block);
            updateProgramState();
        }
    });

    // ЛОГИКА ДОБАВЛЕНИЯ БЛОКА
    const activeLoopBody = codeArea.querySelector('.loop-body[data-loop-active="true"]');
    
    if (activeLoopBody && action !== 'loop') {
        // Добавляем в активное тело цикла
        activeLoopBody.appendChild(block);
    } else {
        // Добавляем в основную область (вне циклов или это новый цикл)
        codeArea.appendChild(block);
    }
    
    programBlocks.push({ action, count: loopCount, element: block });
    addConsoleMessage(`+ Блок: ${getBlockText(action, loopCount)}`);
}

// Обновление счетчика цикла
function updateLoopCount(input) {
    const block = input.closest('.code-block');
    const count = parseInt(input.value) || 3;
    block.dataset.count = count;
    
    // Обновляем в программе
    const blockIndex = programBlocks.findIndex(b => b.element === block);
    if (blockIndex !== -1) {
        programBlocks[blockIndex].count = count;
    }
}

function getBlockText(action, count = 0) {
    switch (action) {
        case 'move': return 'ДВИГАТЬСЯ_ВПЕРЕД()';
        case 'left': return 'ПОВЕРНУТЬ_НАЛЕВО()';
        case 'right': return 'ПОВЕРНУТЬ_НАПРАВО()';
        case 'loop': return `повторить(${count})`;
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
    addConsoleMessage('Запуск программы...');

    await executeBlocks(programBlocks);
    
    if (isExecuting) {
        if (drone.x === levelConfig.finish.x && drone.y === levelConfig.finish.y) {
            addConsoleMessage('Дрон достиг цели!');
            setTimeout(() => {
                completeLevel();
            }, 1000);
        } else {
            addConsoleMessage('Программа завершена');
            addConsoleMessage(`Дрон на (${drone.x}, ${drone.y})`);
        }
        isExecuting = false;
    }
}

// Выполнение блоков (рекурсивно для циклов)
async function executeBlocks(blocks) {
    for (let i = 0; i < blocks.length; i++) {
        if (!isExecuting) break;
        
        const block = blocks[i];
        
        if (block.action === 'loop') {
            await executeLoop(block);
        } else {
            await executeAction(block);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Проверка достижения финиша
        if (drone.x === levelConfig.finish.x && drone.y === levelConfig.finish.y) {
            break;
        }
    }
}

// Выполнение цикла
async function executeLoop(loopBlock) {
    const loopCount = loopBlock.count || 3;
    const loopBody = loopBlock.element.querySelector('.loop-body');
    const bodyBlocks = getBlocksInLoopBody(loopBody);
    
    addConsoleMessage(`Цикл: ${loopCount} повторений`);
    
    for (let i = 0; i < loopCount; i++) {
        if (!isExecuting) break;
        
        currentLoop.active = true;
        currentLoop.count = i + 1;
        currentLoop.total = loopCount;
        updateLoopCounter();
        
        addConsoleMessage(`Итерация ${i + 1}/${loopCount}`);
        
        // Подсветка блока цикла
        loopBlock.element.classList.add('loop-executing');
        
        await executeBlocks(bodyBlocks);
        
        loopBlock.element.classList.remove('loop-executing');
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (drone.x === levelConfig.finish.x && drone.y === levelConfig.finish.y) {
            break;
        }
    }
    
    currentLoop.active = false;
    updateLoopCounter();
    addConsoleMessage('Цикл завершен');
}

// Получение блоков в теле цикла
function getBlocksInLoopBody(loopBody) {
    const blocks = [];
    
    // Берем только непосредственные дочерние блоки (не вложенные)
    const childBlocks = loopBody.querySelectorAll(':scope > .code-block');
    
    childBlocks.forEach(child => {
        const blockIndex = programBlocks.findIndex(b => b.element === child);
        if (blockIndex !== -1) {
            blocks.push(programBlocks[blockIndex]);
        }
    });
    
    return blocks;
}

// Выполнение действия
async function executeAction(block) {
    const { action, element } = block;
    
    // Подсветка выполняемого блока
    element.classList.add('executing');
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

    // Снятие подсветки
    setTimeout(() => {
        element.classList.remove('executing');
    }, 200);
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

    await new Promise(resolve => setTimeout(resolve, 300));

    // Проверка препятствий и границ
    const hasObstacle = levelConfig.obstacles.some(obs => obs.x === newX && obs.y === newY);
    
    if (newX >= 0 && newX < levelConfig.gridSizeX && 
        newY >= 0 && newY < levelConfig.gridSizeY &&
        !hasObstacle) {
        drone.x = newX;
        drone.y = newY;
        addConsoleMessage(`Перемещение на (${newX}, ${newY})`);
    } else {
        addConsoleMessage('Препятствие или граница поля');
    }

    updateDronePosition();
    
    if (droneElement) {
        setTimeout(() => {
            droneElement.classList.remove('drone-moving');
        }, 150);
    }
}

// Поворот налево
async function turnLeft() {
    const directions = ['north', 'west', 'south', 'east'];
    const currentIndex = directions.indexOf(drone.direction);
    drone.direction = directions[(currentIndex + 1) % 4];
    
    addConsoleMessage(`Поворот налево. Направление: ${drone.direction}`);
    updateDronePosition();
    
    await new Promise(resolve => setTimeout(resolve, 300));
}

// Поворот направо
async function turnRight() {
    const directions = ['north', 'east', 'south', 'west'];
    const currentIndex = directions.indexOf(drone.direction);
    drone.direction = directions[(currentIndex + 1) % 4];
    
    addConsoleMessage(`Поворот направо. Направление: ${drone.direction}`);
    updateDronePosition();
    
    await new Promise(resolve => setTimeout(resolve, 300));
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

// Обновление счетчика циклов
function updateLoopCounter() {
    const counter = document.getElementById('loopCounter');
    const currentSpan = document.getElementById('currentLoop');
    const totalSpan = document.getElementById('totalLoops');
    
    if (currentLoop.active) {
        currentSpan.textContent = currentLoop.count;
        totalSpan.textContent = currentLoop.total;
        counter.style.display = 'block';
    } else {
        counter.style.display = 'none';
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
    currentLoop.active = false;
    updateLoopCounter();
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

// Добавление сообщения в консоль - ОПТИМИЗИРОВАНО
function addConsoleMessage(message) {
    const consoleOutput = document.getElementById('consoleOutput');
    const messageElement = document.createElement('div');
    messageElement.className = 'console-line';
    
    // Сокращаем длинные сообщения
    let shortMessage = message;
    if (message.length > 50) {
        shortMessage = message.substring(0, 47) + '...';
    }
    
    // Заменяем длинные тексты на короткие
    shortMessage = shortMessage
        .replace('Дрон готов к программированию', 'Дрон готов')
        .replace('Используйте циклы для повторяющихся паттернов движения', 'Используйте циклы')
        .replace('Добавлен блок:', '+ Блок:')
        .replace('Запуск программы...', 'Запуск...')
        .replace('Выполняется:', '→')
        .replace('Перемещение на', '→')
        .replace('Поворот налево', '↰')
        .replace('Поворот направо', '↱')
        .replace('Цикл: повторений', 'Цикл:')
        .replace('Итерация', 'Ит.')
        .replace('Цикл завершен', 'Цикл ок')
        .replace('Препятствие или граница поля', 'Столкновение')
        .replace('Программа завершена', 'Завершено')
        .replace('Дрон на позиции', 'Позиция')
        .replace('Дрон достиг цели!', 'Цель достигнута!')
        .replace('Программа прервана', 'Прервано')
        .replace('Программа сброшена', 'Сброшено');
    
    messageElement.textContent = shortMessage;
    
    consoleOutput.appendChild(messageElement);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Завершение уровня
function completeLevel() {
    // Сохраняем прогресс в localStorage
    localStorage.setItem('cyberSystemsProgress', JSON.stringify({
        currentLevel: '2.2',
        lastCompleted: '2.2'
    }));
    
    alert('🎊 Уровень пройден!\n\nВы освоили циклы!\nЭффективное программирование с повторениями!');
    goToLevelMap();
}

// Навигация
function goBack() {
    window.location.href = '../level-map/index.html';
}

function showHelp() {
    alert('Помощь по уровню 2.2:\n\n' +
          '1. Используйте блок "повторить(n)" для циклов\n' +
          '2. Перетащите блоки в тело цикла для повторения\n' +
          '3. Настройте количество повторений (1-10)\n' +
          '4. Используйте циклы для повторяющихся паттернов движения\n\n' +
          'Пример решения:\n' +
          'повторить(3)\n' +
          '  ДВИГАТЬСЯ_ВПЕРЕД()\n' +
          '  ПОВЕРНУТЬ_НАПРАВО()\n' +
          '  ДВИГАТЬСЯ_ВПЕРЕД()\n' +
          '  ПОВЕРНУТЬ_НАЛЕВО()');
}

function goToLevelMap() {
    window.location.href = '../level-map/index.html';
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initializeLevel);