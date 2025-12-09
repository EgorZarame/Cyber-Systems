// Конфигурация уровня 3.2
const level3_2_config = {
    id: '3.2',
    title: 'Условные циклы',
    gridSizeX: 12,
    gridSizeY: 8,
    start: { x: 1, y: 1 },
    finish: { x: 10, y: 6 },
    obstacles: [
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
        state: 'красный',
        changeInterval: 3000
    }
};

class Level3_2 extends LevelBase3 {
    constructor() {
        super(level3_2_config);
        this.functionBody = [];
    }

    initialize() {
        super.initialize();
        this.initializeGameGrid(); // ДОБАВЛЕНО
        this.startTrafficLight();
        this.addConsoleMessage('🚦 Светофор активирован - следите за цветом!', 'warning');
        this.addConsoleMessage('💡 Используйте if/else и циклы для управления дроном', 'info');
    }

    getWelcomeMessage() {
        return 'Уровень 3.2: Условные циклы - освоите условия и циклы в Python';
    }

    // ДОБАВЛЕНО: метод для инициализации игрового поля
    initializeGameGrid() {
        const grid = document.getElementById('gameGrid');
        if (!grid) {
            console.error('Элемент #gameGrid не найден');
            return;
        }
        
        grid.innerHTML = '';

        for (let y = 0; y < this.config.gridSizeY; y++) {
            for (let x = 0; x < this.config.gridSizeX; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;

                if (x === this.config.start.x && y === this.config.start.y) {
                    cell.classList.add('start');
                } else if (x === this.config.finish.x && y === this.config.finish.y) {
                    cell.classList.add('finish');
                } else if (this.config.obstacles.some(obs => obs.x === x && obs.y === y)) {
                    cell.classList.add('obstacle');
                } else if (this.config.path.some(point => point.x === x && point.y === y)) {
                    cell.classList.add('path');
                }

                grid.appendChild(cell);
            }
        }

        this.updateDronePosition();
    }

    // ДОБАВЛЕНО: метод для обновления позиции дрона
    updateDronePosition() {
        const oldDrone = document.querySelector('.drone');
        if (oldDrone) oldDrone.remove();

        const cell = document.querySelector(`[data-x="${this.drone.x}"][data-y="${this.drone.y}"]`);
        if (cell) {
            const droneElement = document.createElement('div');
            droneElement.className = `drone ${this.drone.direction}`;
            cell.appendChild(droneElement);
        }
    }

    validatePythonCode(code) {
        if (!code.includes('движение')) {
            this.addConsoleMessage('❌ Ошибка: функция движение() не найдена!', 'error');
            this.addConsoleMessage('💡 Используйте: def движение():', 'error');
            return false;
        }
        return true;
    }

    async executePythonCode(code) {
        this.parseFunctionBody(code);
        
        if (this.functionBody.length === 0) {
            throw new Error('Тело функции пусто! Добавьте команды с отступами.');
        }
        
        this.addConsoleMessage(`📝 Найдено ${this.functionBody.length} команд в функции`, 'success');
        
        await this.executeFunctionBody();
    }

    parseFunctionBody(code) {
        const lines = code.split('\n');
        let inFunction = false;
        let functionIndent = 0;
        this.functionBody = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            if (trimmed.startsWith('def движение():')) {
                inFunction = true;
                continue;
            }
            
            if (inFunction) {
                const indent = line.search(/\S/);
                
                if (this.functionBody.length === 0 && trimmed !== '' && indent > 0) {
                    functionIndent = indent;
                }
                
                if (trimmed !== '' && !trimmed.startsWith('#')) {
                    if (indent >= functionIndent) {
                        this.functionBody.push({
                            text: line,
                            indent: indent,
                            content: trimmed,
                            lineNumber: i + 1
                        });
                    } else {
                        break;
                    }
                }
            }
        }
    }

    async executeFunctionBody() {
        let i = 0;
        const maxSteps = 1000;
        let stepCount = 0;
        
        while (i < this.functionBody.length && this.isExecuting && stepCount < maxSteps) {
            stepCount++;
            const instruction = this.functionBody[i];
            this.currentLine = instruction.lineNumber;
            
            try {
                i = await this.processInstruction(instruction, i);
            } catch (error) {
                this.addConsoleMessage(`❌ Ошибка в строке ${this.currentLine}: ${error.message}`, 'error');
                break;
            }
            
            if (this.checkLevelComplete()) {
                await this.completeLevel();
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        if (stepCount >= maxSteps) {
            this.addConsoleMessage('⚠️ Достигнут лимит шагов выполнения', 'warning');
        }
        
        if (this.isExecuting && !this.checkLevelComplete()) {
            this.addConsoleMessage('🛑 Программа завершена, но дрон не достиг цели', 'error');
            this.addConsoleMessage(`📍 Текущая позиция: (${this.drone.x}, ${this.drone.y})`, 'error');
        }
        
        this.isExecuting = false;
    }

    async processInstruction(instruction, currentIndex) {
        const content = instruction.content;
        
        this.addConsoleMessage(`📄 Строка ${this.currentLine}: ${content}`, 'info');
        
        if (content.startsWith('if ')) {
            return await this.processIfStatement(instruction, currentIndex);
        }
        else if (content === 'else:') {
            return currentIndex;
        }
        else if (content.startsWith('for ')) {
            await this.executeForLoop(instruction, currentIndex);
            return this.findNextAfterBlock(currentIndex, instruction.indent);
        }
        else if (content.startsWith('while ')) {
            this.addConsoleMessage('⚠️ while циклы пока не поддерживаются', 'warning');
            return this.findNextAfterBlock(currentIndex, instruction.indent);
        }
        else {
            await this.executeCommand(content);
            return currentIndex + 1;
        }
    }

    async processIfStatement(instruction, currentIndex) {
        const conditionResult = this.evaluateCondition(instruction.content);
        this.addConsoleMessage(`🔍 Условие: ${conditionResult ? 'ИСТИНА' : 'ЛОЖЬ'}`, conditionResult ? 'success' : 'warning');
        
        if (conditionResult) {
            await this.executeBlock(currentIndex + 1, instruction.indent);
        } else {
            let nextIndex = this.skipBlock(currentIndex + 1, instruction.indent);
            
            if (nextIndex < this.functionBody.length && 
                this.functionBody[nextIndex].content === 'else:' && 
                this.functionBody[nextIndex].indent === instruction.indent) {
                await this.executeBlock(nextIndex + 1, instruction.indent);
            }
            
            return this.findNextAfterBlock(currentIndex, instruction.indent);
        }
        return currentIndex + 1;
    }

    skipBlock(startIndex, baseIndent) {
        let i = startIndex;
        while (i < this.functionBody.length && this.functionBody[i].indent > baseIndent) {
            i++;
        }
        return i;
    }

    findNextAfterBlock(currentIndex, baseIndent) {
        let i = currentIndex + 1;
        while (i < this.functionBody.length && this.functionBody[i].indent > baseIndent) {
            i++;
        }
        return i;
    }

    async executeBlock(startIndex, baseIndent) {
        let i = startIndex;
        while (i < this.functionBody.length && this.functionBody[i].indent > baseIndent) {
            i = await this.processInstruction(this.functionBody[i], i);
            
            if (this.checkLevelComplete()) {
                return;
            }
        }
    }

    async executeForLoop(loopInstruction, currentIndex) {
        const match = loopInstruction.content.match(/for\s+\w+\s+in\s+range\((\d+)\):/);
        if (!match) {
            throw new Error('Некорректный синтаксис цикла for');
        }
        
        const iterations = parseInt(match[1]);
        if (isNaN(iterations) || iterations <= 0) {
            throw new Error(`Некорректное количество итераций: ${match[1]}`);
        }
        
        this.addConsoleMessage(`🔄 Запуск цикла for на ${iterations} итераций`, 'info');
        
        const loopBody = [];
        let nextIndex = currentIndex + 1;
        while (nextIndex < this.functionBody.length && this.functionBody[nextIndex].indent > loopInstruction.indent) {
            loopBody.push(this.functionBody[nextIndex]);
            nextIndex++;
        }
        
        if (loopBody.length === 0) {
            throw new Error('Тело цикла for пусто');
        }
        
        for (let i = 0; i < iterations && this.isExecuting; i++) {
            this.addConsoleMessage(`⟳ Итерация ${i + 1}/${iterations}`, 'info');
            
            for (const bodyLine of loopBody) {
                if (!this.isExecuting) break;
                
                if (bodyLine.content.startsWith('if ') || bodyLine.content.startsWith('for ')) {
                    await this.processInstruction(bodyLine, this.functionBody.indexOf(bodyLine));
                } else {
                    await this.executeCommand(bodyLine.content);
                }
                
                if (this.checkLevelComplete()) {
                    return;
                }
                
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        
        this.addConsoleMessage('✅ Цикл for завершен', 'success');
    }

    // ДОБАВЛЕНО: метод для оценки условий
    evaluateCondition(conditionLine) {
        const condition = conditionLine.replace(/^if\s+|\s*:$/g, '');
        
        if (condition.includes("светофор == 'зеленый'") || condition.includes('светофор == "зеленый"')) {
            return this.config.trafficLight.state === 'зеленый';
        } 
        else if (condition.includes("светофор == 'красный'") || condition.includes('светофор == "красный"')) {
            return this.config.trafficLight.state === 'красный';
        }
        
        return false;
    }

    async executeCommand(command) {
        if (command.startsWith('#')) return;
        
        if (command === 'двигаться_вперед()') {
            await this.moveForward();
        } else if (command === 'повернуть_налево()') {
            await this.turnLeft();
        } else if (command === 'повернуть_направо()') {
            await this.turnRight();
        } else if (command === 'стой_на_месте()') {
            await this.waitInPlace();
        } else if (command.includes('(') && command.includes(')')) {
            const funcName = command.split('(')[0];
            if (funcName && funcName !== 'range') {
                throw new Error(`Неизвестная команда: ${funcName}`);
            }
        }
    }

    // ДОБАВЛЕНО: метод для движения вперед (с автоматическим ожиданием светофора)
    async moveForward() {
        // Проверяем светофор
        if (this.config.trafficLight && this.config.trafficLight.state === 'красный') {
            this.addConsoleMessage('🚫 Движение запрещено: красный свет!', 'warning');
            this.addConsoleMessage('⏳ Ожидание зеленого света...', 'info');
            
            // Ждем зеленого света
            while (this.config.trafficLight.state === 'красный' && this.isExecuting) {
                await new Promise(resolve => setTimeout(resolve, 500));
                
                if (!this.isExecuting) return;
            }
            
            if (!this.isExecuting) return;
            
            this.addConsoleMessage('✅ Светофор стал зеленым! Продолжаем движение', 'success');
        }

        let newX = this.drone.x;
        let newY = this.drone.y;

        switch (this.drone.direction) {
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
        const hasObstacle = this.config.obstacles.some(obs => obs.x === newX && obs.y === newY);
        
        if (newX >= 0 && newX < this.config.gridSizeX && 
            newY >= 0 && newY < this.config.gridSizeY &&
            !hasObstacle) {
            this.drone.x = newX;
            this.drone.y = newY;
            this.addConsoleMessage(`✅ Движение вперед на (${newX}, ${newY})`, 'success');
        } else {
            throw new Error('Невозможно двигаться вперед: препятствие или граница поля');
        }

        this.updateDronePosition();
        
        if (droneElement) {
            setTimeout(() => {
                droneElement.classList.remove('drone-moving');
            }, 200);
        }
    }

    // ДОБАВЛЕНО: метод для ожидания на месте
    async waitInPlace() {
        const droneElement = document.querySelector('.drone');
        if (droneElement) {
            droneElement.classList.add('waiting');
        }
        
        this.addConsoleMessage('⏳ Ожидание на месте...', 'warning');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (droneElement) {
            droneElement.classList.remove('waiting');
        }
    }

    // ДОБАВЛЕНО: метод для поворота налево
    async turnLeft() {
        const directions = ['north', 'west', 'south', 'east'];
        const currentIndex = directions.indexOf(this.drone.direction);
        this.drone.direction = directions[(currentIndex + 1) % 4];
        
        this.addConsoleMessage(`↩️ Поворот налево. Направление: ${this.drone.direction}`, 'info');
        this.updateDronePosition();
        
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    // ДОБАВЛЕНО: метод для поворота направо
    async turnRight() {
        const directions = ['north', 'east', 'south', 'west'];
        const currentIndex = directions.indexOf(this.drone.direction);
        this.drone.direction = directions[(currentIndex + 1) % 4];
        
        this.addConsoleMessage(`↪️ Поворот направо. Направление: ${this.drone.direction}`, 'info');
        this.updateDronePosition();
        
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    checkLevelComplete() {
        return this.drone.x === this.config.finish.x && 
               this.drone.y === this.config.finish.y;
    }

    getCompletionMessage() {
        return 'Вы освоили условные операторы и циклы в Python!\nДрон успешно прошел лабиринт со светофором!';
    }

    showHelp() {
        alert('Помощь по уровню 3.2:\n\n' +
              '1. Программа выполняется ОДИН РАЗ от начала до конца\n' +
              '2. Дрон автоматически ждет зеленый свет перед движением\n' +
              '3. Используйте if/else для проверки условий\n' +
              '4. Используйте for для повторяющихся действий\n\n' +
              'Пример решения:\n' +
              'def движение():\n' +
              '    if светофор == "зеленый":\n' +
              '        повернуть_налево()\n' +
              '        двигаться_вперед()\n' +
              '        повернуть_направо()\n' +
              '        for i in range(9):\n' +
              '            двигаться_вперед()\n' +
              '        повернуть_направо()\n' +
              '        for i in range(5):\n' +
              '            двигаться_вперед()\n' +
              '    else:\n' +
              '        стой_на_месте()');
    }
}

// Инициализация уровня при загрузке
let level3_2;

document.addEventListener('DOMContentLoaded', () => {
    level3_2 = new Level3_2();
    level3_2.initialize();
});

// Глобальные функции для вызова из HTML
function runPythonCode() {
    if (level3_2) level3_2.runPythonCode();
}

function resetProgram() {
    if (level3_2) level3_2.resetProgram();
}

function goBack() {
    if (level3_2) level3_2.goBack();
}

function showHelp() {
    if (level3_2) level3_2.showHelp();
}

function goToLevelMap() {
    if (level3_2) level3_2.goToLevelMap();
}