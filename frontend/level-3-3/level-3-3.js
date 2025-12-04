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
        state: 'красный',
        changeInterval: 3000,
        lastChange: 0
    },
    conveyorsFilled: false,
    virusCoreActivated: false,
    itemsMoved: 0 // Счетчик перемещенных предметов
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
    addConsoleMessage('📦 Переложите предметы с раздатчиков на конвейеры (3 предмета)', 'warning');
    addConsoleMessage('🚦 Светофор активирован - следите за цветом!', 'warning');
    addConsoleMessage(`📍 Стартовая позиция: (${levelConfig.start.x}, ${levelConfig.start.y})`, 'info');
    addConsoleMessage(`🎯 Ядро вируса: (${levelConfig.virusCore.x}, ${levelConfig.virusCore.y})`, 'info');
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

            grid.appendChild(cell);
        }
    }

    // Добавляем предметы на конвейеры
    updateItemsDisplay();
    
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
    
    setTimeout(() => {
        redLight.classList.remove('light-changing');
        greenLight.classList.remove('light-changing');
    }, 500);
}

// Настройка редактора кода
function setupCodeEditor() {
    const codeEditor = document.getElementById('codeEditor');
    
    codeEditor.addEventListener('input', function() {
        // Можно добавить подсветку синтаксиса
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

    if (!code.includes('восстановить_систему')) {
        addConsoleMessage('❌ Ошибка: функция восстановить_систему() не найдена!', 'error');
        addConsoleMessage('💡 Используйте: def восстановить_систему():', 'error');
        return;
    }

    isExecuting = true;
    resetDrone();
    addConsoleMessage('⚡ Запуск выполнения кода...', 'info');

    try {
        // Парсим и выполняем код ОДИН РАЗ
        await parseAndExecute(code);
    } catch (error) {
        addConsoleMessage(`❌ Ошибка выполнения: ${error.message}`, 'error');
        isExecuting = false;
    }
}

// Парсинг и выполнение кода ОДИН РАЗ
async function parseAndExecute(code) {
    const lines = code.split('\n');
    let inFunction = false;
    let functionIndent = 0;
    let functionBody = [];
    
    // Парсим тело функции восстановить_систему
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Находим начало функции
        if (trimmed.startsWith('def восстановить_систему():')) {
            inFunction = true;
            continue;
        }
        
        if (inFunction) {
            // Определяем отступ
            const indent = line.search(/\S/);
            
            // Если это первая строка тела функции
            if (functionBody.length === 0 && trimmed !== '' && indent > 0) {
                functionIndent = indent;
            }
            
            // Если строка в теле функции
            if (trimmed !== '' && !trimmed.startsWith('#')) {
                if (indent >= functionIndent) {
                    functionBody.push({
                        text: line,
                        indent: indent,
                        content: trimmed,
                        lineNumber: i + 1
                    });
                } else {
                    // Меньший отступ - вышли из функции
                    break;
                }
            }
        }
    }
    
    if (functionBody.length === 0) {
        throw new Error('Тело функции пусто! Добавьте команды с отступами.');
    }
    
    addConsoleMessage(`📝 Найдено ${functionBody.length} команд в функции`, 'success');
    
    // Выполняем тело функции последовательно
    await executeFunctionBody(functionBody);
}

// Выполнение тела функции
async function executeFunctionBody(functionBody) {
    let i = 0;
    const maxSteps = 200;
    let stepCount = 0;
    
    while (i < functionBody.length && isExecuting && stepCount < maxSteps) {
        stepCount++;
        const instruction = functionBody[i];
        currentLine = instruction.lineNumber;
        
        try {
            await processInstruction(instruction, functionBody, i);
        } catch (error) {
            addConsoleMessage(`❌ Ошибка в строке ${currentLine}: ${error.message}`, 'error');
            break;
        }
        
        // Находим следующую инструкцию
        i = findNextInstruction(i, functionBody);
        
        // Проверка достижения ядра вируса
        if (drone.x === levelConfig.virusCore.x && drone.y === levelConfig.virusCore.y && levelConfig.conveyorsFilled) {
            await activateVirusCore();
            await completeLevel();
            return;
        }
        
        // Небольшая пауза между командами
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    if (stepCount >= maxSteps) {
        addConsoleMessage('⚠️ Достигнут лимит шагов выполнения', 'warning');
    }
    
    if (isExecuting && !(drone.x === levelConfig.virusCore.x && drone.y === levelConfig.virusCore.y && levelConfig.conveyorsFilled)) {
        addConsoleMessage('🛑 Программа завершена, но система не восстановлена', 'error');
        addConsoleMessage(`📍 Текущая позиция: (${drone.x}, ${drone.y})`, 'error');
        addConsoleMessage(`📦 Конвейеры заполнены: ${levelConfig.conveyorsFilled}`, 'error');
        addConsoleMessage(`📊 Перемещено предметов: ${levelConfig.itemsMoved}/3`, 'error');
    }
    
    isExecuting = false;
}

// Найти следующую инструкцию
function findNextInstruction(currentIndex, functionBody) {
    return currentIndex + 1;
}

// Обработка инструкции
async function processInstruction(instruction, functionBody, currentIndex) {
    const content = instruction.content;
    
    addConsoleMessage(`📄 Строка ${currentLine}: ${content}`, 'info');
    
    // Обработка while циклов (добавлена поддержка)
    if (content.startsWith('while ')) {
        const conditionResult = evaluateCondition(content.replace('while ', 'if '));
        addConsoleMessage(`🔄 Проверка while условия: ${conditionResult ? 'ИСТИНА' : 'ЛОЖЬ'}`, conditionResult ? 'success' : 'warning');
        
        if (conditionResult) {
            // Выполняем тело while
            await executeBlock(currentIndex + 1, instruction.indent, functionBody);
            // Возвращаемся к проверке условия
            return currentIndex;
        } else {
            // Пропускаем тело while
            return skipBlock(currentIndex + 1, instruction.indent, functionBody);
        }
    }
    else if (content.startsWith('if ')) {
        const conditionResult = evaluateCondition(content);
        addConsoleMessage(`🔍 Условие if: ${conditionResult ? 'ИСТИНА' : 'ЛОЖЬ'}`, conditionResult ? 'success' : 'warning');
        
        if (conditionResult) {
            // Выполняем тело if
            await executeBlock(currentIndex + 1, instruction.indent, functionBody);
        } else {
            // Пропускаем тело if и ищем else
            let nextIndex = skipBlock(currentIndex + 1, instruction.indent, functionBody);
            
            // Проверяем, есть ли else
            if (nextIndex < functionBody.length && functionBody[nextIndex].content === 'else:' && 
                functionBody[nextIndex].indent === instruction.indent) {
                // Выполняем тело else
                await executeBlock(nextIndex + 1, instruction.indent, functionBody);
            }
            
            // Возвращаем индекс после всего блока if/else
            return findNextAfterBlock(currentIndex, instruction.indent, functionBody);
        }
    }
    else if (content === 'else:') {
        // else обрабатывается в if, поэтому пропускаем
        return currentIndex;
    }
    else if (content.startsWith('for ')) {
        await executeForLoop(instruction, currentIndex, functionBody);
        return findNextAfterBlock(currentIndex, instruction.indent, functionBody);
    }
    else {
        // Обычная команда
        await executeCommand(content);
    }
}

// Оценка условия
function evaluateCondition(conditionLine) {
    // Убираем "if " или "while " и ":" в конце
    const condition = conditionLine.replace(/^(if|while)\s+|\s*:$/g, '');
    
    if (condition.includes("светофор == 'зеленый'")) {
        return levelConfig.trafficLight.state === 'зеленый';
    } 
    else if (condition.includes("светофор == 'красный'")) {
        return levelConfig.trafficLight.state === 'красный';
    }
    else if (condition.includes('конвейеры_заполнены')) {
        return levelConfig.conveyorsFilled;
    }
    else if (condition.includes('ядро_активировано')) {
        return levelConfig.virusCoreActivated;
    }
    
    return false;
}

// Пропустить блок кода
function skipBlock(startIndex, baseIndent, functionBody) {
    let i = startIndex;
    while (i < functionBody.length && functionBody[i].indent > baseIndent) {
        i++;
    }
    return i;
}

// Найти следующий индекс после блока
function findNextAfterBlock(currentIndex, baseIndent, functionBody) {
    let i = currentIndex + 1;
    while (i < functionBody.length && functionBody[i].indent > baseIndent) {
        i++;
    }
    return i;
}

// Выполнить блок кода
async function executeBlock(startIndex, baseIndent, functionBody) {
    let i = startIndex;
    while (i < functionBody.length && functionBody[i].indent > baseIndent) {
        await processInstruction(functionBody[i], functionBody, i);
        i++;
        
        // Проверка достижения ядра
        if (drone.x === levelConfig.virusCore.x && drone.y === levelConfig.virusCore.y && levelConfig.conveyorsFilled) {
            return;
        }
    }
}

// Выполнить цикл for
async function executeForLoop(loopInstruction, currentIndex, functionBody) {
    const match = loopInstruction.content.match(/for\s+\w+\s+in\s+range\((\d+)\):/);
    if (!match) {
        throw new Error('Некорректный синтаксис цикла for');
    }
    
    const iterations = parseInt(match[1]);
    if (isNaN(iterations) || iterations <= 0) {
        throw new Error(`Некорректное количество итераций: ${match[1]}`);
    }
    
    addConsoleMessage(`🔄 Запуск цикла for на ${iterations} итераций`, 'info');
    
    // Собираем тело цикла
    const loopBody = [];
    let nextIndex = currentIndex + 1;
    while (nextIndex < functionBody.length && functionBody[nextIndex].indent > loopInstruction.indent) {
        loopBody.push(functionBody[nextIndex]);
        nextIndex++;
    }
    
    if (loopBody.length === 0) {
        throw new Error('Тело цикла for пусто');
    }
    
    // Выполняем цикл
    for (let i = 0; i < iterations && isExecuting; i++) {
        addConsoleMessage(`⟳ Итерация ${i + 1}/${iterations}`, 'info');
        
        for (const bodyLine of loopBody) {
            if (!isExecuting) break;
            
            // Рекурсивно обрабатываем команды в теле цикла
            if (bodyLine.content.startsWith('if ') || bodyLine.content.startsWith('for ') || bodyLine.content.startsWith('while ')) {
                await processInstruction(bodyLine, functionBody, functionBody.indexOf(bodyLine));
            } else {
                await executeCommand(bodyLine.content);
            }
            
            // Проверка достижения ядра
            if (drone.x === levelConfig.virusCore.x && drone.y === levelConfig.virusCore.y && levelConfig.conveyorsFilled) {
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    
    addConsoleMessage('✅ Цикл for завершен', 'success');
}

// Выполнить одну команду
async function executeCommand(command) {
    if (command.startsWith('#')) return;
    
    if (command === 'двигаться_вперед()') {
        await moveForward();
    } else if (command === 'повернуть_налево()') {
        await turnLeft();
    } else if (command === 'повернуть_направо()') {
        await turnRight();
    } else if (command === 'стой_на_месте()') {
        await waitInPlace();
    } else if (command === 'переложить_предметы()') {
        await moveItems();
    } else if (command === 'активировать_ядро()') {
        await activateVirusCore();
    } else if (command.includes('(') && command.includes(')')) {
        const funcName = command.split('(')[0];
        if (funcName && funcName !== 'range') {
            throw new Error(`Неизвестная команда: ${funcName}`);
        }
    }
}

// Движение вперед с проверкой светофора
async function moveForward() {
    // Проверяем светофор
    if (levelConfig.trafficLight.state === 'красный') {
        addConsoleMessage('🚫 Движение запрещено: красный свет!', 'warning');
        
        // Ждем зеленый свет
        addConsoleMessage('⏳ Ожидание зеленого света...', 'info');
        
        // Ждем пока светофор станет зеленым
        while (levelConfig.trafficLight.state === 'красный' && isExecuting) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (!isExecuting) return;
        
        addConsoleMessage('✅ Светофор стал зеленым! Продолжаем движение', 'success');
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
        throw new Error(`Невозможно двигаться вперед: препятствие или граница поля. Направление: ${drone.direction}`);
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

// Перемещение предметов - ИСПРАВЛЕННАЯ ВЕРСИЯ
async function moveItems() {
    // Проверяем, находится ли дрон на конвейере
    const onConveyor = levelConfig.conveyors.some(conv => 
        drone.x === conv.x && drone.y === conv.y
    );
    
    if (!onConveyor) {
        throw new Error('Дрон должен находиться на конвейере для перемещения предметов!');
    }
    
    // Находим раздатчик, соответствующий этому конвейеру
    const conveyorIndex = levelConfig.conveyors.findIndex(conv => 
        drone.x === conv.x && drone.y === conv.y
    );
    
    if (conveyorIndex === -1) {
        throw new Error('Не найден соответствующий раздатчик!');
    }
    
    const section = levelConfig.conveyors[conveyorIndex].section;
    const dispenser = levelConfig.dispensers.find(d => {
        if (section === 1) return d.color === 'red';
        if (section === 2) return d.color === 'blue';
        if (section === 3) return d.color === 'green';
        return false;
    });
    
    if (!dispenser) {
        throw new Error('Не найден раздатчик для этого конвейера!');
    }
    
    addConsoleMessage(`📦 Перемещение предмета ${dispenser.color} с раздатчика...`, 'info');
    
    // Имитация процесса перемещения
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Увеличиваем счетчик перемещенных предметов
    levelConfig.itemsMoved++;
    
    // Проверяем, все ли конвейеры заполнены (все 3 предмета перемещены)
    if (levelConfig.itemsMoved >= 3) {
        levelConfig.conveyorsFilled = true;
        addConsoleMessage(`✅ Все конвейеры заполнены! (${levelConfig.itemsMoved}/3 предметов)`, 'success');
    } else {
        addConsoleMessage(`📊 Перемещено предметов: ${levelConfig.itemsMoved}/3`, 'info');
    }
}

// Активация ядра вируса - ИСПРАВЛЕННАЯ ВЕРСИЯ
async function activateVirusCore() {
    if (!levelConfig.conveyorsFilled) {
        throw new Error(`Сначала нужно заполнить все конвейеры предметами! Перемещено: ${levelConfig.itemsMoved}/3`);
    }
    
    if (drone.x !== levelConfig.virusCore.x || drone.y !== levelConfig.virusCore.y) {
        throw new Error(`Дрон должен находиться на ядре вируса для активации! Текущая позиция: (${drone.x}, ${drone.y}), нужна: (${levelConfig.virusCore.x}, ${levelConfig.virusCore.y})`);
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

// Функция для обновления отображения предметов
function updateItemsDisplay() {
    // Удаляем все существующие предметы
    document.querySelectorAll('.item-red, .item-blue, .item-green').forEach(item => {
        item.classList.remove('item-red', 'item-blue', 'item-green');
    });
    
    // Добавляем предметы на их позиции
    levelConfig.items.forEach(item => {
        const cell = document.querySelector(`[data-x="${item.x}"][data-y="${item.y}"]`);
        if (cell) {
            cell.classList.add(`item-${item.color}`);
        }
    });
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
    
    // Сбрасываем все состояния
    levelConfig.trafficLight.state = 'красный';
    levelConfig.conveyorsFilled = false;
    levelConfig.virusCoreActivated = false;
    levelConfig.itemsMoved = 0;
    
    // Сбрасываем предметы на начальные позиции
    levelConfig.items = [
        { x: 1, y: 8, color: 'red' },
        { x: 5, y: 8, color: 'blue' },
        { x: 9, y: 8, color: 'green' }
    ];
    
    // Обновляем отображение предметов
    updateItemsDisplay();
    
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
async function completeLevel() {
    isExecuting = false;
    
    if (trafficLightInterval) {
        clearInterval(trafficLightInterval);
    }
    
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
          '   - Дрон должен стоять НА КОНВЕЙЕРЕ (координаты: 1,8 / 5,8 / 9,8)\n' +
          '4. Доберитесь до ядра вируса (13,8) и используйте активировать_ядро()\n' +
          '5. Нужно переместить 3 предмета\n\n' +
          'Координаты:\n' +
          '- Старт: (1,1)\n' +
          '- Конвейеры: (1,8), (5,8), (9,8)\n' +
          '- Ядро вируса: (13,8)');
}

function goToLevelMap() {
    if (trafficLightInterval) {
        clearInterval(trafficLightInterval);
    }
    window.location.href = '../level-map/index.html';
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initializeLevel);