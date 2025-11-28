// Конфигурация уровня 3.3 - Финальный босс - Ядро вируса
const levelConfig = {
    id: '3.3',
    title: 'Финальный босс - Ядро вируса',
    gridSizeX: 15,
    gridSizeY: 10,
    start: { x: 1, y: 1 },
    finish: { x: 13, y: 8 },
    virusCore: { x: 13, y: 8 },
    obstacles: [
        // Лабиринт к ядру вируса
        { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
        { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 },
        { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 },
        { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 },
        { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 },
        { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 },
        { x: 10, y: 6 }, { x: 10, y: 5 }, { x: 10, y: 4 },
        { x: 11, y: 4 }, { x: 12, y: 4 }, { x: 13, y: 4 },
        { x: 13, y: 5 }, { x: 13, y: 6 }, { x: 13, y: 7 }
    ],
    conveyors: [
        { x: 1, y: 8, section: 1 },
        { x: 2, y: 8, section: 1 },
        { x: 3, y: 8, section: 1 },
        { x: 4, y: 8, section: 2 },
        { x: 5, y: 8, section: 2 },
        { x: 6, y: 8, section: 2 },
        { x: 7, y: 8, section: 3 },
        { x: 8, y: 8, section: 3 },
        { x: 9, y: 8, section: 3 }
    ],
    dispensers: [
        { x: 1, y: 9, color: 'red' },
        { x: 5, y: 9, color: 'blue' },
        { x: 9, y: 9, color: 'green' }
    ],
    items: [
        { x: 1, y: 8, color: 'red' },
        { x: 5, y: 8, color: 'blue' },
        { x: 9, y: 8, color: 'green' }
    ],
    path: [
        { x: 1, y: 1 }, { x: 2, y: 1 }, 
        { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 5 }, { x: 2, y: 6 },
        { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 },
        { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 },
        { x: 7, y: 3 }, { x: 8, y: 3 }, { x: 9, y: 3 }, { x: 10, y: 3 },
        { x: 10, y: 4 }, { x: 10, y: 5 }, { x: 10, y: 6 },
        { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 },
        { x: 13, y: 7 }, { x: 13, y: 8 }
    ],
    trafficLight: {
        state: 'красный', // 'зеленый' или 'красный'
        changeInterval: 3000, // Интервал смены светофора
        lastChange: 0
    },
    conveyorsFilled: false,
    virusCoreActivated: false
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
    addConsoleMessage('🚨 ОБНАРУЖЕНО ЯДРО ВИРУСА!', 'error');
    addConsoleMessage('💡 Используйте if/else, циклы и функции для восстановления системы', 'info');
    addConsoleMessage('📦 Переложите предметы с раздатчиков на конвейеры', 'warning');
    addConsoleMessage('🚦 Светофор активирован - следите за цветом!', 'warning');
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
            } else if (x === levelConfig.virusCore.x && y === levelConfig.virusCore.y) {
                cell.classList.add('virus-core');
            } else if (levelConfig.obstacles.some(obs => obs.x === x && obs.y === y)) {
                cell.classList.add('obstacle');
            } else if (levelConfig.conveyors.some(conv => conv.x === x && conv.y === y)) {
                cell.classList.add('conveyor');
            } else if (levelConfig.dispensers.some(disp => disp.x === x && disp.y === y)) {
                cell.classList.add('dispenser');
            } else if (levelConfig.path.some(point => point.x === x && point.y === y)) {
                cell.classList.add('path');
            }

            // Добавляем предметы на конвейеры
            const item = levelConfig.items.find(it => it.x === x && it.y === y);
            if (item) {
                cell.classList.add(`item-${item.color}`);
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

    // Проверяем наличие функции восстановить_систему
    if (!code.includes('восстановить_систему')) {
        addConsoleMessage('❌ Ошибка: функция восстановить_систему() не найдена!', 'error');
        addConsoleMessage('💡 Используйте: def восстановить_систему():', 'error');
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
        
        if (line.startsWith('def восстановить_систему():')) {
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
    const maxIterations = 100; // Защита от бесконечных циклов
    
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
                
                // Проверка достижения ядра вируса
                if (drone.x === levelConfig.virusCore.x && drone.y === levelConfig.virusCore.y && levelConfig.conveyorsFilled) {
                    addConsoleMessage('🎯 Дрон достиг ядра вируса!', 'success');
                    await activateVirusCore();
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
        
        // Если дошли до конца функции, но не достигли цели, продолжаем выполнение
        if (!executionComplete && iterations >= maxIterations) {
            addConsoleMessage('⚠️ Достигнут лимит итераций. Проверьте логику программы.', 'warning');
        }
    }
    
    if (isExecuting && !(drone.x === levelConfig.virusCore.x && drone.y === levelConfig.virusCore.y && levelConfig.conveyorsFilled)) {
        addConsoleMessage('🛑 Выполнение завершено, но система не восстановлена', 'error');
        addConsoleMessage(`📍 Текущая позиция: (${drone.x}, ${drone.y})`, 'error');
        addConsoleMessage(`📦 Конвейеры заполнены: ${levelConfig.conveyorsFilled}`, 'error');
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
    } else if (cleanCommand === 'переложить_предметы()') {
        await moveItems();
    } else if (cleanCommand === 'активировать_ядро()') {
        await activateVirusCore();
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
    } else if (conditionLine.includes('конвейеры_заполнены')) {
        return levelConfig.conveyorsFilled;
    } else if (conditionLine.includes('ядро_активировано')) {
        return levelConfig.virusCoreActivated;
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

// Перемещение предметов
async function moveItems() {
    // Проверяем, находится ли дрон рядом с раздатчиком
    const nearDispenser = levelConfig.dispensers.some(disp => 
        Math.abs(drone.x - disp.x) <= 1 && Math.abs(drone.y - disp.y) <= 1
    );
    
    if (!nearDispenser) {
        throw new Error('Дрон должен находиться рядом с раздатчиком для перемещения предметов');
    }
    
    addConsoleMessage('📦 Перемещение предметов с раздатчиков на конвейеры...', 'info');
    
    // Имитация процесса перемещения
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Помечаем конвейеры как заполненные
    levelConfig.conveyorsFilled = true;
    addConsoleMessage('✅ Конвейеры заполнены! Теперь можно активировать ядро вируса', 'success');
}

// Активация ядра вируса
async function activateVirusCore() {
    if (!levelConfig.conveyorsFilled) {
        throw new Error('Сначала нужно заполнить конвейеры предметами!');
    }
    
    if (drone.x !== levelConfig.virusCore.x || drone.y !== levelConfig.virusCore.y) {
        throw new Error('Дрон должен находиться на ядре вируса для активации!');
    }
    
    addConsoleMessage('🚀 Активация ядра вируса...', 'info');
    
    // Анимация активации
    const coreCell = document.querySelector(`[data-x="${levelConfig.virusCore.x}"][data-y="${levelConfig.virusCore.y}"]`);
    if (coreCell) {
        coreCell.style.animation = 'virusPulse 0.5s infinite';
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    levelConfig.virusCoreActivated = true;
    addConsoleMessage('✅ Ядро вируса активировано! Система восстанавливается...', 'success');
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
    levelConfig.conveyorsFilled = false;
    levelConfig.virusCoreActivated = false;
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
        currentLevel: '3.3',
        lastCompleted: '3.3',
        seniorUnlocked: true
    }));
    
    setTimeout(() => {
        alert('🎊 УРОВЕНЬ ПРОЙДЕН!\n\n' +
              '🏆 ВЫ СТАЛИ SENIOR-ПРОГРАММИСТОМ!\n\n' +
              'Вы успешно восстановили систему, победив ядро вируса!\n' +
              'Освоены: условия, циклы, функции и их комбинации!\n\n' +
              'Поздравляем с завершением игры!');
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
    alert('Помощь по уровню 3.3 - Финальный босс:\n\n' +
          '1. Напишите функцию восстановить_систему() с условиями и циклами\n' +
          '2. Проверяйте состояние светофора: светофор == "зеленый/красный"\n' +
          '3. Используйте переложить_предметы() для заполнения конвейеров\n' +
          '4. Доберитесь до ядра вируса и используйте активировать_ядро()\n' +
          '5. Комбинируйте условия, циклы и функции\n\n' +
          'Пример решения:\n' +
          'def восстановить_систему():\n' +
          '    if светофор == "зеленый":\n' +
          '        for i in range(5):\n' +
          '            двигаться_вперед()\n' +
          '        переложить_предметы()\n' +
          '        while not ядро_активировано:\n' +
          '            if конвейеры_заполнены:\n' +
          '                активировать_ядро()\n' +
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