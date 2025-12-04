// Конфигурация уровня 3.1 - Функция движения
const levelConfig = {
    id: '3.1',
    title: 'Функция движения',
    gridSizeX: 10,
    gridSizeY: 8,
    start: { x: 1, y: 4 },
    finish: { x: 8, y: 4 },
    obstacles: [
        { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 },
        { x: 4, y: 2 }, { x: 4, y: 6 },
        { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 },
        { x: 6, y: 2 }, { x: 6, y: 6 },
        { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }
    ],
    description: 'Напишите функцию на Python для движения дрона по лабиринту'
};

let drone = {
    x: levelConfig.start.x,
    y: levelConfig.start.y,
    direction: 'east'
};

let isExecuting = false;
let currentLine = 0;

// Инициализация уровня
function initializeLevel() {
    initializeGameGrid();
    setupCodeEditor();
    addConsoleMessage('🐍 Python интерпретатор инициализирован');
    addConsoleMessage('💡 Напишите функцию пройти_лабиринт() для движения дрона');
    
    const consoleOutput = document.getElementById('consoleOutput');
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
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

// Настройка редактора кода
function setupCodeEditor() {
    const codeEditor = document.getElementById('codeEditor');
    codeEditor.value = `def пройти_лабиринт():
    # Ваш код здесь
    двигаться_вперед()
    двигаться_вперед()
    повернуть_направо()
    двигаться_вперед()
    двигаться_вперед()
    повернуть_налево()
    двигаться_вперед()`;
}

// Выполнение Python кода
async function runPythonCode() {
    if (isExecuting) {
        addConsoleMessage('⚠️ Код уже выполняется', 'error');
        return;
    }

    const codeEditor = document.getElementById('codeEditor');
    const code = codeEditor.value.trim();
    
    if (!code) {
        addConsoleMessage('❌ Ошибка: код пуст!', 'error');
        return;
    }

    // Проверяем наличие функции пройти_лабиринт
    if (!code.includes('пройти_лабиринт')) {
        addConsoleMessage('❌ Ошибка: функция пройти_лабиринт() не найдена!', 'error');
        addConsoleMessage('💡 Используйте: def пройти_лабиринт():', 'error');
        return;
    }

    isExecuting = true;
    resetDrone();
    addConsoleMessage('⚡ Запуск выполнения кода...');

    try {
        await executePythonCode(code);
    } catch (error) {
        addConsoleMessage(`❌ Ошибка выполнения: ${error.message}`, 'error');
        isExecuting = false;
    }
}

// Выполнение имитированного Python кода
async function executePythonCode(code) {
    const lines = code.split('\n');
    let inFunction = false;
    let functionBody = [];
    
    // Парсим код для извлечения тела функции
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('def пройти_лабиринт():')) {
            inFunction = true;
            continue;
        }
        
        if (inFunction) {
            // Если находимся в функции и строка не пустая
            if (trimmedLine === '' || trimmedLine.startsWith('#')) {
                // Пустые строки и комментарии пропускаем, но остаемся в функции
                continue;
            }
            
            // Проверяем, что строка имеет отступ или содержит команду
            if (line.length > 0 && (line[0] === ' ' || line[0] === '\t' || 
                trimmedLine.includes('двигаться') || trimmedLine.includes('повернуть'))) {
                const command = trimmedLine;
                if (command && !command.startsWith('def ')) {
                    functionBody.push(command);
                }
            } else if (trimmedLine !== '' && !trimmedLine.startsWith('#')) {
                // Если нашли непустую строку без отступа и это не комментарий, выходим из функции
                break;
            }
        }
    }
    
    if (functionBody.length === 0) {
        // Проверяем простейший случай - функция в одну строку
        const simpleMatch = code.match(/def пройти_лабиринт\(\):\s*(.+)/);
        if (simpleMatch && simpleMatch[1]) {
            functionBody.push(simpleMatch[1].trim());
        } else {
            throw new Error('Тело функции пусто! Добавьте команды с отступами.');
        }
    }
    
    addConsoleMessage(`📝 Найдено ${functionBody.length} команд в функции`);
    addConsoleMessage('🔍 Начинаю выполнение...');
    
    // Выполняем команды из тела функции
    for (let i = 0; i < functionBody.length; i++) {
        if (!isExecuting) break;
        
        const command = functionBody[i];
        currentLine = i + 1;
        
        addConsoleMessage(`📄 Строка ${currentLine}: ${command}`);
        
        try {
            await executeCommand(command);
            await new Promise(resolve => setTimeout(resolve, 600));
            
            // Проверка достижения финиша
            if (drone.x === levelConfig.finish.x && drone.y === levelConfig.finish.y) {
                addConsoleMessage('🎉 Дрон достиг цели!', 'success');
                await completeLevel();
                break;
            }
        } catch (error) {
            addConsoleMessage(`❌ Ошибка в строке ${currentLine}: ${error.message}`, 'error');
            break;
        }
    }
    
    if (isExecuting && drone.x !== levelConfig.finish.x && drone.y !== levelConfig.finish.y) {
        addConsoleMessage('🛑 Выполнение завершено, но дрон не достиг цели', 'error');
        addConsoleMessage(`📍 Текущая позиция: (${drone.x}, ${drone.y})`, 'error');
        addConsoleMessage('💡 Проверьте свой маршрут и попробуйте снова');
    }
    
    isExecuting = false;
}

// Выполнение отдельной команды
async function executeCommand(command) {
    // Убираем комментарии
    const cleanCommand = command.split('#')[0].trim();
    
    if (!cleanCommand) return;
    
    if (cleanCommand === 'двигаться_вперед()') {
        await moveForward();
    } else if (cleanCommand === 'повернуть_налево()') {
        await turnLeft();
    } else if (cleanCommand === 'повернуть_направо()') {
        await turnRight();
    } else if (cleanCommand.startsWith('#')) {
        // Это комментарий, пропускаем
        return;
    } else {
        throw new Error(`Неизвестная команда: ${cleanCommand}`);
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
        addConsoleMessage(`✅ Движение вперед на (${newX}, ${newY})`);
    } else {
        throw new Error('Невозможно двигаться вперед: препятствие или граница поля');
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
    
    addConsoleMessage(`↩️ Поворот налево. Направление: ${drone.direction}`);
    updateDronePosition();
    
    await new Promise(resolve => setTimeout(resolve, 400));
}

// Поворот направо
async function turnRight() {
    const directions = ['north', 'east', 'south', 'west'];
    const currentIndex = directions.indexOf(drone.direction);
    drone.direction = directions[(currentIndex + 1) % 4];
    
    addConsoleMessage(`↪️ Поворот направо. Направление: ${drone.direction}`);
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
        addConsoleMessage('⚠️ Выполнение прервано');
    }
    
    resetDrone();
    addConsoleMessage('🔄 Программа сброшена');
}

// Сброс дрона
function resetDrone() {
    drone.x = levelConfig.start.x;
    drone.y = levelConfig.start.y;
    drone.direction = 'east';
    updateDronePosition();
}

// Добавление сообщения в консоль
function addConsoleMessage(message, type = '') {
    const consoleOutput = document.getElementById('consoleOutput');
    const messageElement = document.createElement('div');
    messageElement.className = `console-line ${type ? 'log-' + type : ''}`;
    messageElement.textContent = message;
    
    consoleOutput.appendChild(messageElement);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Завершение уровня
function completeLevel() {
    isExecuting = false;
    
    localStorage.setItem('cyberSystemsProgress', JSON.stringify({
        currentLevel: '3.1',
        lastCompleted: '3.1'
    }));
    
    setTimeout(() => {
        alert('🎊 Уровень пройден!\n\nВы успешно написали свою первую функцию на Python!\nДрон достиг цели!');
        goToLevelMap();
    }, 1000);
}

// Навигация
function goBack() {
    window.location.href = '../level-map/index.html';
}

function showHelp() {
    alert('Помощь по уровню 3.1:\n\n' +
          '1. Напишите функцию пройти_лабиринт() на Python\n' +
          '2. Используйте команды движения внутри функции\n' +
          '3. Не забудьте про отступы (4 пробела или табуляция)\n' +
          '4. Проведите дрона от зеленой к оранжевой клетке\n\n' +
          'Пример решения:\n' +
          'def пройти_лабиринт():\n' +
          '    двигаться_вперед()\n' +
          '    двигаться_вперед()\n' +
          '    повернуть_направо()\n' +
          '    двигаться_вперед()\n' +
          '    двигаться_вперед()\n' +
          '    повернуть_налево()\n' +
          '    двигаться_вперед()\n\n' +
          'Внимание: Все команды должны быть с отступами!');
}

function goToLevelMap() {
    window.location.href = '../level-map/index.html';
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initializeLevel);