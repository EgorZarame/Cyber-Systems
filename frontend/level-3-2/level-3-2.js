// Конфигурация уровня 3.2 - Условные циклы
const levelConfig = {
    id: '3.2',
    title: 'Условные циклы',
    gridSizeX: 12,
    gridSizeY: 8,
    start: { x: 1, y: 1 },
    finish: { x: 10, y: 6 },
    obstacles: [
        // Змейка с препятствиями
        { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
        { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 },
        { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 },
        { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 },
        { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 },
        { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }
    ],
    path: [
        { x: 1, y: 1 }, { x: 2, y: 1 }, 
        { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 5 }, { x: 2, y: 6 },
        { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 },
        { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 },
        { x: 7, y: 3 }, { x: 8, y: 3 }, { x: 9, y: 3 }, { x: 10, y: 3 },
        { x: 10, y: 4 }, { x: 10, y: 5 }, { x: 10, y: 6 }
    ],
    trafficLight: {
        state: 'красный', // 'зеленый' или 'красный'
        changeInterval: 3000, // Интервал смены светофора
        lastChange: 0
    }
};

let drone = {
    x: levelConfig.start.x,
    y: levelConfig.start.y,
    direction: 'east',
    isMoving: false
};

let isExecuting = false;
let currentLine = 0;
let trafficLightInterval;

// Инициализация уровня
function initializeLevel() {
    initializeGameGrid();
    setupCodeEditor();
    startTrafficLight();
    addConsoleMessage('🐍 Python интерпретатор инициализирован', 'info');
    addConsoleMessage('🚦 Светофор активирован - следите за цветом!', 'warning');
    addConsoleMessage('💡 Используйте if/else и циклы для управления дроном', 'info');
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
            } else if (levelConfig.path.some(point => point.x === x && point.y === y)) {
                cell.classList.add('path');
            }

            grid.appendChild(cell);
        }
    }

    updateDronePosition();
}

// Запуск светофора
function startTrafficLight() {
    updateTrafficLightDisplay();
    
    trafficLightInterval = setInterval(() => {
        levelConfig.trafficLight.state = levelConfig.trafficLight.state === 'зеленый' ? 'красный' : 'зеленый';
        updateTrafficLightDisplay();
        addConsoleMessage(`🚦 Светофор сменился на: ${levelConfig.trafficLight.state}`, 'warning');
    }, levelConfig.trafficLight.changeInterval);
}

// Обновление отображения светофора
function updateTrafficLightDisplay() {
    const redLight = document.getElementById('redLight');
    const greenLight = document.getElementById('greenLight');
    
    if (levelConfig.trafficLight.state === 'красный') {
        redLight.classList.remove('inactive');
        redLight.classList.add('red', 'light-changing');
        greenLight.classList.add('inactive');
        greenLight.classList.remove('green', 'light-changing');
    } else {
        greenLight.classList.remove('inactive');
        greenLight.classList.add('green', 'light-changing');
        redLight.classList.add('inactive');
        redLight.classList.remove('red', 'light-changing');
    }
    
    // Убираем анимацию после завершения
    setTimeout(() => {
        redLight.classList.remove('light-changing');
        greenLight.classList.remove('light-changing');
    }, 500);
}

// Настройка редактора кода
function setupCodeEditor() {
    const codeEditor = document.getElementById('codeEditor');
    
    // Базовая подсветка синтаксиса при вводе
    codeEditor.addEventListener('input', function() {
        // В реальном проекте нужно использовать более сложную систему подсветки
    });
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

    // Проверяем наличие функции движение
    if (!code.includes('движение')) {
        addConsoleMessage('❌ Ошибка: функция движение() не найдена!', 'error');
        addConsoleMessage('💡 Используйте: def движение():', 'error');
        return;
    }

    isExecuting = true;
    resetDrone();
    addConsoleMessage('⚡ Запуск выполнения кода...', 'info');

    try {
        // Имитация выполнения Python кода
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
        const line = lines[i].trim();
        
        if (line.startsWith('def движение():')) {
            inFunction = true;
            continue;
        }
        
        if (inFunction) {
            if (line === '' || line.startsWith('#')) {
                continue; // Пропускаем пустые строки и комментарии
            }
            
            // Проверяем отступы (должны быть 4 пробела)
            if (line.startsWith('    ') || line === '') {
                const command = line.trim();
                if (command) {
                    functionBody.push(command);
                }
            } else if (line) {
                // Если есть код без отступа, значит вышли из функции
                break;
            }
        }
    }
    
    if (functionBody.length === 0) {
        throw new Error('Тело функции пусто! Добавьте команды с отступами.');
    }
    
    addConsoleMessage(`📝 Найдено ${functionBody.length} команд в функции`, 'info');
    
    // Выполняем команды из тела функции
    let executionComplete = false;
    let iterations = 0;
    const maxIterations = 50; // Защита от бесконечных циклов
    
    while (!executionComplete && iterations < maxIterations && isExecuting) {
        iterations++;
        
        for (let i = 0; i < functionBody.length; i++) {
            if (!isExecuting) break;
            
            const command = functionBody[i];
            currentLine = i + 1;
            
            addConsoleMessage(`📄 Строка ${currentLine}: ${command}`, 'info');
            
            try {
                await executeCommand(command);
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Проверка достижения финиша
                if (drone.x === levelConfig.finish.x && drone.y === levelConfig.finish.y) {
                    addConsoleMessage('🎉 Дрон достиг цели!', 'success');
                    executionComplete = true;
                    await completeLevel();
                    break;
                }
            } catch (error) {
                addConsoleMessage(`❌ Ошибка в строке ${currentLine}: ${error.message}`, 'error');
                executionComplete = true;
                break;
            }
        }
        
        // Если дошли до конца функции, но не достигли финиша, продолжаем выполнение
        if (!executionComplete && iterations >= maxIterations) {
            addConsoleMessage('⚠️ Достигнут лимит итераций. Проверьте логику программы.', 'warning');
        }
    }
    
    if (isExecuting && drone.x !== levelConfig.finish.x && drone.y !== levelConfig.finish.y) {
        addConsoleMessage('🛑 Выполнение завершено, но дрон не достиг цели', 'error');
        addConsoleMessage(`📍 Текущая позиция: (${drone.x}, ${drone.y})`, 'error');
    }
    
    isExecuting = false;
}

// Выполнение отдельной команды
async function executeCommand(command) {
    // Убираем комментарии
    const cleanCommand = command.split('#')[0].trim();
    
    if (!cleanCommand) return;
    
    // Обработка условных операторов
    if (cleanCommand.startsWith('if ')) {
        return await executeCondition(cleanCommand);
    }
    // Обработка циклов for
    else if (cleanCommand.startsWith('for ')) {
        return await executeForLoop(cleanCommand);
    }
    // Обработка else
    else if (cleanCommand === 'else:') {
        return; // Обрабатывается в executeCondition
    }
    // Базовые команды
    else if (cleanCommand === 'двигаться_вперед()') {
        await moveForward();
    } else if (cleanCommand === 'повернуть_налево()') {
        await turnLeft();
    } else if (cleanCommand === 'повернуть_направо()') {
        await turnRight();
    } else if (cleanCommand === 'стой_на_месте()') {
        await waitInPlace();
    } else {
        throw new Error(`Неизвестная команда: ${cleanCommand}`);
    }
}

// Выполнение условного оператора
async function executeCondition(conditionLine) {
    // Простая проверка условий
    if (conditionLine.includes("светофор == 'зеленый'")) {
        return levelConfig.trafficLight.state === 'зеленый';
    } else if (conditionLine.includes("светофор == 'красный'")) {
        return levelConfig.trafficLight.state === 'красный';
    }
    
    throw new Error(`Неизвестное условие: ${conditionLine}`);
}

// Выполнение цикла for
async function executeForLoop(loopLine) {
    // Простой парсинг range()
    const rangeMatch = loopLine.match(/range\((\d+)\)/);
    if (rangeMatch) {
        const iterations = parseInt(rangeMatch[1]);
        addConsoleMessage(`🔄 Запуск цикла for на ${iterations} итераций`, 'info');
        
        for (let i = 0; i < iterations; i++) {
            if (!isExecuting) break;
            addConsoleMessage(`⟳ Итерация ${i + 1}/${iterations}`, 'info');
            // В реальной реализации здесь нужно выполнять тело цикла
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        addConsoleMessage('✅ Цикл for завершен', 'info');
        return;
    }
    
    throw new Error(`Неизвестный цикл: ${loopLine}`);
}

// Движение вперед
async function moveForward() {
    if (levelConfig.trafficLight.state === 'красный') {
        addConsoleMessage('🚫 Движение запрещено: красный свет!', 'warning');
        await waitInPlace();
        return;
    }

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
        addConsoleMessage(`✅ Движение вперед на (${newX}, ${newY})`, 'success');
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

// Ожидание на месте
async function waitInPlace() {
    const droneElement = document.querySelector('.drone');
    if (droneElement) {
        droneElement.classList.add('waiting');
    }
    
    addConsoleMessage('⏳ Ожидание на месте...', 'warning');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (droneElement) {
        droneElement.classList.remove('waiting');
    }
}

// Поворот налево
async function turnLeft() {
    const directions = ['north', 'west', 'south', 'east'];
    const currentIndex = directions.indexOf(drone.direction);
    drone.direction = directions[(currentIndex + 1) % 4];
    
    addConsoleMessage(`↩️ Поворот налево. Направление: ${drone.direction}`, 'info');
    updateDronePosition();
    
    await new Promise(resolve => setTimeout(resolve, 400));
}

// Поворот направо
async function turnRight() {
    const directions = ['north', 'east', 'south', 'west'];
    const currentIndex = directions.indexOf(drone.direction);
    drone.direction = directions[(currentIndex + 1) % 4];
    
    addConsoleMessage(`↪️ Поворот направо. Направление: ${drone.direction}`, 'info');
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
        addConsoleMessage('⚠️ Выполнение прервано', 'warning');
    }
    
    resetDrone();
    addConsoleMessage('🔄 Программа сброшена', 'info');
}

// Сброс дрона
function resetDrone() {
    drone.x = levelConfig.start.x;
    drone.y = levelConfig.start.y;
    drone.direction = 'east';
    drone.isMoving = false;
    updateDronePosition();
    
    // Сбрасываем светофор
    levelConfig.trafficLight.state = 'красный';
    updateTrafficLightDisplay();
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
    
    // Останавливаем светофор
    if (trafficLightInterval) {
        clearInterval(trafficLightInterval);
    }
    
    // Сохраняем прогресс в localStorage
    localStorage.setItem('cyberSystemsProgress', JSON.stringify({
        currentLevel: '3.2',
        lastCompleted: '3.2'
    }));
    
    setTimeout(() => {
        alert('🎊 Уровень пройден!\n\nВы освоили условные операторы и циклы в Python!\nДрон успешно прошел лабиринт со светофором!');
        goToLevelMap();
    }, 1000);
}

// Навигация
function goBack() {
    if (trafficLightInterval) {
        clearInterval(trafficLightInterval);
    }
    window.location.href = '../level-map/index.html';
}

function showHelp() {
    alert('Помощь по уровню 3.2:\n\n' +
          '1. Напишите функцию движение() с условиями и циклами\n' +
          '2. Проверяйте состояние светофора: светофор == "зеленый/красный"\n' +
          '3. Используйте циклы for для повторяющихся действий\n' +
          '4. Двигайтесь только на зеленый свет\n' +
          '5. Используйте стой_на_месте() для ожидания\n\n' +
          'Пример решения:\n' +
          'def движение():\n' +
          '    if светофор == "зеленый":\n' +
          '        for i in range(2):\n' +
          '            двигаться_вперед()\n' +
          '        повернуть_направо()\n' +
          '    else:\n' +
          '        стой_на_месте()');
}

function goToLevelMap() {
    if (trafficLightInterval) {
        clearInterval(trafficLightInterval);
    }
    window.location.href = '../level-map/index.html';
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initializeLevel);