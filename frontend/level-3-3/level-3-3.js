// Конфигурация уровня 3.3
const level3_3_config = {
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
        changeInterval: 3000
    }
};

class Level3_3 extends LevelBase3 {
    constructor() {
        super(level3_3_config);
        this.functionBody = [];
        this.conveyorsFilled = false;
        this.virusCoreActivated = false;
        this.itemsMoved = 0;
        this.trafficLightInterval = null;
    }

    initialize() {
        super.initialize();
        this.initializeGameGrid();
        this.startTrafficLight();
        
        // Отладочная информация
        this.debugLocalStorage();
        
        this.addConsoleMessage('🚨 ОБНАРУЖЕНО ЯДРО ВИРУСА!', 'error');
        this.addConsoleMessage('💡 Используйте условия, циклы и функции для восстановления системы', 'info');
        this.addConsoleMessage('📦 Переложите предметы с раздатчиков на конвейеры (3 предмета)', 'warning');
        this.addConsoleMessage('🚦 Светофор активирован - следите за цветом!', 'warning');
    }

    debugLocalStorage() {
        console.group('=== DEBUG LOCALSTORAGE ===');
        console.log('1. cyberSystemsProfile:', JSON.parse(localStorage.getItem('cyberSystemsProfile') || '{}'));
        console.log('2. cyberProfile:', JSON.parse(localStorage.getItem('cyberProfile') || '{}'));
        console.log('3. Уровни:');
        ['1.1', '1.2', '1.boss', '2.1', '2.2', '2.boss', '3.1', '3.2', '3.boss'].forEach(level => {
            console.log(`   - ${level}:`, 
                localStorage.getItem(`level_${level}_completed`) || 
                localStorage.getItem(`level_${level.replace('.', '_')}_completed`) || 
                'не пройден'
            );
        });
        console.groupEnd();
    }

    getWelcomeMessage() {
        return 'Уровень 3.3: Финальный босс - Ядро вируса - восстановите систему!';
    }

    validatePythonCode(code) {
        if (!code.includes('восстановить_систему')) {
            this.addConsoleMessage('❌ Ошибка: функция восстановить_систему() не найдена!', 'error');
            this.addConsoleMessage('💡 Используйте: def восстановить_систему():', 'error');
            return false;
        }
        return true;
    }

    async runPythonCode() {
        if (this.isExecuting) {
            this.addConsoleMessage('⚠️ Код уже выполняется', 'error');
            return;
        }

        const codeEditor = document.getElementById('codeEditor');
        const code = codeEditor.value.trim();
        
        if (!code) {
            this.addConsoleMessage('❌ Ошибка: код пуст!', 'error');
            return;
        }

        if (!this.validatePythonCode(code)) {
            return;
        }

        this.isExecuting = true;
        this.resetDrone();
        this.addConsoleMessage('⚡ Запуск выполнения кода...', 'info');

        try {
            await this.executePythonCode(code);
        } catch (error) {
            this.addConsoleMessage(`❌ Ошибка выполнения: ${error.message}`, 'error');
            this.isExecuting = false;
        }
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
            
            if (trimmed.startsWith('def восстановить_систему():')) {
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
        const maxSteps = 200;
        let stepCount = 0;
        
        while (i < this.functionBody.length && this.isExecuting && stepCount < maxSteps) {
            stepCount++;
            const instruction = this.functionBody[i];
            this.currentLine = instruction.lineNumber;
            
            try {
                const result = await this.processInstruction(instruction, i);
                i = result;
            } catch (error) {
                this.addConsoleMessage(`❌ Ошибка в строке ${this.currentLine}: ${error.message}`, 'error');
                break;
            }
            
            // Проверка завершения уровня
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
            this.addConsoleMessage('🛑 Программа завершена, но система не восстановлена', 'error');
            this.addConsoleMessage(`📍 Текущая позиция: (${this.drone.x}, ${this.drone.y})`, 'error');
            this.addConsoleMessage(`📦 Конвейеры заполнены: ${this.conveyorsFilled}`, 'error');
            this.addConsoleMessage(`📊 Перемещено предметов: ${this.itemsMoved}/3`, 'error');
        }
        
        this.isExecuting = false;
    }

    async processInstruction(instruction, currentIndex) {
        const content = instruction.content;
        
        this.addConsoleMessage(`📄 Строка ${this.currentLine}: ${content}`, 'info');
        
        if (content.startsWith('while ')) {
            const conditionResult = this.evaluateCondition(content.replace('while ', 'if '));
            this.addConsoleMessage(`🔄 Проверка while условия: ${conditionResult ? 'ИСТИНА' : 'ЛОЖЬ'}`, conditionResult ? 'success' : 'warning');
            
            if (conditionResult) {
                await this.executeBlock(currentIndex + 1, instruction.indent);
                return currentIndex; // Возвращаемся к проверке условия
            } else {
                return this.skipBlock(currentIndex + 1, instruction.indent);
            }
        }
        else if (content.startsWith('if ')) {
            const conditionResult = this.evaluateCondition(content);
            this.addConsoleMessage(`🔍 Условие if: ${conditionResult ? 'ИСТИНА' : 'ЛОЖЬ'}`, conditionResult ? 'success' : 'warning');
            
            if (conditionResult) {
                await this.executeBlock(currentIndex + 1, instruction.indent);
                return this.findNextAfterBlock(currentIndex, instruction.indent);
            } else {
                let nextIndex = this.skipBlock(currentIndex + 1, instruction.indent);
                
                if (nextIndex < this.functionBody.length && 
                    this.functionBody[nextIndex].content === 'else:' && 
                    this.functionBody[nextIndex].indent === instruction.indent) {
                    await this.executeBlock(nextIndex + 1, instruction.indent);
                }
                
                return this.findNextAfterBlock(currentIndex, instruction.indent);
            }
        }
        else if (content === 'else:') {
            return currentIndex;
        }
        else if (content.startsWith('for ')) {
            await this.executeForLoop(instruction, currentIndex);
            return this.findNextAfterBlock(currentIndex, instruction.indent);
        }
        else {
            await this.executeCommand(content);
            return currentIndex + 1;
        }
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
        } else if (command === 'переложить_предметы()') {
            await this.moveItems();
        } else if (command === 'активировать_ядро()') {
            await this.activateVirusCore();
        } else if (command.includes('(') && command.includes(')')) {
            const funcName = command.split('(')[0];
            if (funcName && funcName !== 'range') {
                throw new Error(`Неизвестная команда: ${funcName}`);
            }
        }
    }

    evaluateCondition(conditionLine) {
        const condition = conditionLine.replace(/^(if|while)\s+|\s*:$/g, '');
        
        if (condition.includes("светофор == 'зеленый'")) {
            return this.config.trafficLight.state === 'зеленый';
        } 
        else if (condition.includes("светофор == 'красный'")) {
            return this.config.trafficLight.state === 'красный';
        }
        else if (condition.includes('конвейеры_заполнены')) {
            return this.conveyorsFilled;
        }
        else if (condition.includes('ядро_активировано')) {
            return this.virusCoreActivated;
        }
        
        return false;
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
                
                if (bodyLine.content.startsWith('if ') || bodyLine.content.startsWith('for ') || bodyLine.content.startsWith('while ')) {
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

    async moveForward() {
        if (this.config.trafficLight.state === 'красный') {
            this.addConsoleMessage('🚫 Движение запрещено: красный свет!', 'warning');
            this.addConsoleMessage('⏳ Ожидание зеленого света...', 'info');
            
            while (this.config.trafficLight.state === 'красный' && this.isExecuting) {
                await new Promise(resolve => setTimeout(resolve, 500));
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

        const droneElement = document.querySelector('.drone');
        if (droneElement) {
            droneElement.classList.add('drone-moving');
        }

        await new Promise(resolve => setTimeout(resolve, 400));

        const hasObstacle = this.config.obstacles.some(obs => obs.x === newX && obs.y === newY);
        
        if (newX >= 0 && newX < this.config.gridSizeX && 
            newY >= 0 && newY < this.config.gridSizeY &&
            !hasObstacle) {
            this.drone.x = newX;
            this.drone.y = newY;
            this.addConsoleMessage(`✅ Движение вперед на (${newX}, ${newY})`, 'success');
        } else {
            throw new Error(`Невозможно двигаться вперед: препятствие или граница поля. Направление: ${this.drone.direction}`);
        }

        this.updateDronePosition();
        
        if (droneElement) {
            setTimeout(() => {
                droneElement.classList.remove('drone-moving');
            }, 200);
        }
    }

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

    async moveItems() {
        const onConveyor = this.config.conveyors.some(conv => 
            this.drone.x === conv.x && this.drone.y === conv.y
        );
        
        if (!onConveyor) {
            throw new Error('Дрон должен находиться на конвейере для перемещения предметов!');
        }
        
        const conveyorIndex = this.config.conveyors.findIndex(conv => 
            this.drone.x === conv.x && this.drone.y === conv.y
        );
        
        if (conveyorIndex === -1) {
            throw new Error('Не найден соответствующий раздатчик!');
        }
        
        const section = this.config.conveyors[conveyorIndex].section;
        const dispenser = this.config.dispensers.find(d => {
            if (section === 1) return d.color === 'red';
            if (section === 2) return d.color === 'blue';
            if (section === 3) return d.color === 'green';
            return false;
        });
        
        if (!dispenser) {
            throw new Error('Не найден раздатчик для этого конвейера!');
        }
        
        this.addConsoleMessage(`📦 Перемещение предмета ${dispenser.color} с раздатчика...`, 'info');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.itemsMoved++;
        
        if (this.itemsMoved >= 3) {
            this.conveyorsFilled = true;
            this.addConsoleMessage(`✅ Все конвейеры заполнены! (${this.itemsMoved}/3 предметов)`, 'success');
        } else {
            this.addConsoleMessage(`📊 Перемещено предметов: ${this.itemsMoved}/3`, 'info');
        }
    }

    async activateVirusCore() {
        if (!this.conveyorsFilled) {
            throw new Error(`Сначала нужно заполнить все конвейеры предметами! Перемещено: ${this.itemsMoved}/3`);
        }
        
        if (this.drone.x !== this.config.virusCore.x || this.drone.y !== this.config.virusCore.y) {
            throw new Error(`Дрон должен находиться на ядре вируса для активации! Текущая позиция: (${this.drone.x}, ${this.drone.y}), нужна: (${this.config.virusCore.x}, ${this.config.virusCore.y})`);
        }
        
        this.addConsoleMessage('🚀 Активация ядра вируса...', 'info');
        
        const coreCell = document.querySelector(`[data-x="${this.config.virusCore.x}"][data-y="${this.config.virusCore.y}"]`);
        if (coreCell) {
            coreCell.style.animation = 'virusPulse 0.5s infinite';
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        this.virusCoreActivated = true;
        this.addConsoleMessage('✅ Ядро вируса активировано! Система восстанавливается...', 'success');
    }

    async turnLeft() {
        const directions = ['north', 'west', 'south', 'east'];
        const currentIndex = directions.indexOf(this.drone.direction);
        this.drone.direction = directions[(currentIndex + 1) % 4];
        
        this.addConsoleMessage(`↩️ Поворот налево. Направление: ${this.drone.direction}`, 'info');
        this.updateDronePosition();
        
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    async turnRight() {
        const directions = ['north', 'east', 'south', 'west'];
        const currentIndex = directions.indexOf(this.drone.direction);
        this.drone.direction = directions[(currentIndex + 1) % 4];
        
        this.addConsoleMessage(`↪️ Поворот направо. Направление: ${this.drone.direction}`, 'info');
        this.updateDronePosition();
        
        await new Promise(resolve => setTimeout(resolve, 400));
    }

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
                } else if (x === this.config.virusCore.x && y === this.config.virusCore.y) {
                    cell.classList.add('virus-core');
                } else if (this.config.obstacles.some(obs => obs.x === x && obs.y === y)) {
                    cell.classList.add('obstacle');
                } else if (this.config.conveyors.some(conv => conv.x === x && conv.y === y)) {
                    cell.classList.add('conveyor');
                } else if (this.config.dispensers.some(disp => disp.x === x && disp.y === y)) {
                    cell.classList.add('dispenser');
                } else if (this.config.path.some(point => point.x === x && point.y === y)) {
                    cell.classList.add('path');
                }

                grid.appendChild(cell);
            }
        }

        this.updateItemsDisplay();
        this.updateDronePosition();
    }

    updateItemsDisplay() {
        document.querySelectorAll('.item-red, .item-blue, .item-green').forEach(item => {
            item.classList.remove('item-red', 'item-blue', 'item-green');
        });
        
        this.config.items.forEach(item => {
            const cell = document.querySelector(`[data-x="${item.x}"][data-y="${item.y}"]`);
            if (cell) {
                cell.classList.add(`item-${item.color}`);
            }
        });
    }

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

    startTrafficLight() {
        this.updateTrafficLightDisplay();
        
        this.trafficLightInterval = setInterval(() => {
            this.config.trafficLight.state = this.config.trafficLight.state === 'зеленый' ? 'красный' : 'зеленый';
            this.updateTrafficLightDisplay();
            this.addConsoleMessage(`🚦 Светофор сменился на: ${this.config.trafficLight.state}`, 'warning');
        }, this.config.trafficLight.changeInterval);
    }

    updateTrafficLightDisplay() {
        const redLight = document.getElementById('redLight');
        const greenLight = document.getElementById('greenLight');
        
        if (this.config.trafficLight.state === 'красный') {
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
            if (redLight) redLight.classList.remove('light-changing');
            if (greenLight) greenLight.classList.remove('light-changing');
        }, 500);
    }

    resetProgram() {
        if (this.isExecuting) {
            this.isExecuting = false;
            this.addConsoleMessage('⚠️ Выполнение прервано', 'warning');
        }
        
        this.resetDrone();
        this.addConsoleMessage('🔄 Программа сброшена', 'info');
    }

    resetDrone() {
        this.drone.x = this.config.start.x;
        this.drone.y = this.config.start.y;
        this.drone.direction = 'east';
        this.drone.isMoving = false;
        this.updateDronePosition();
        
        this.config.trafficLight.state = 'красный';
        this.conveyorsFilled = false;
        this.virusCoreActivated = false;
        this.itemsMoved = 0;
        
        this.config.items = [
            { x: 1, y: 8, color: 'red' },
            { x: 5, y: 8, color: 'blue' },
            { x: 9, y: 8, color: 'green' }
        ];
        
        this.updateItemsDisplay();
        this.updateTrafficLightDisplay();
    }

    checkLevelComplete() {
        return this.drone.x === this.config.virusCore.x && 
               this.drone.y === this.config.virusCore.y && 
               this.conveyorsFilled;
    }

    async completeLevel() {
        this.isExecuting = false;
        
        if (this.trafficLightInterval) {
            clearInterval(this.trafficLightInterval);
            this.trafficLightInterval = null;
        }
        
        try {
            console.log('=== НАЧАЛО ЗАВЕРШЕНИЯ УРОВНЯ 3.3 ===');
            
            // ВАЖНО: Сохраняем в ТЕ ЖЕ КЛЮЧИ, что и карта уровней!
            // 1. Получаем или создаем профиль в правильном формате
            let profile = JSON.parse(localStorage.getItem('cyberSystemsProfile') || '{}');
            console.log('📊 Текущий профиль (cyberSystemsProfile):', profile);
            
            // Если профиля нет, создаем его
            if (!profile || Object.keys(profile).length === 0) {
                profile = {
                    currentLevelId: '1.1',
                    lastCompleted: null,
                    juniorUnlocked: false,
                    seniorUnlocked: false,
                    completedLevels: [],
                    rank: 'СТАЖЕР'
                };
            }
            
            // 2. Обновляем прогресс
            profile.lastCompleted = '3.boss'; // Важно: используем тот же формат, что в карте уровней
            profile.seniorUnlocked = true;
            profile.juniorUnlocked = true;
            
            // 3. Добавляем все пройденные уровни
            const allLevels = ['1.1', '1.2', '1.boss', '2.1', '2.2', '2.boss', '3.1', '3.2', '3.boss'];
            
            if (!profile.completedLevels) {
                profile.completedLevels = [];
            }
            
            // Добавляем недостающие уровни
            allLevels.forEach(level => {
                if (!profile.completedLevels.includes(level)) {
                    profile.completedLevels.push(level);
                }
            });
            
            profile.completedLevels = allLevels; // Гарантируем, что все уровни есть
            
            // 4. Устанавливаем ранг SENIOR
            profile.rank = 'SENIOR';
            
            // 5. Сохраняем обновленный профиль
            localStorage.setItem('cyberSystemsProfile', JSON.stringify(profile));
            console.log('✅ Обновленный профиль сохранен:', profile);
            
            // 6. Также сохраняем дублирующие ключи для совместимости
            localStorage.setItem(`level_3.3_completed`, 'true');
            localStorage.setItem(`level_3_3_completed`, 'true');
            localStorage.setItem('game_completed', 'true');
            localStorage.setItem('senior_unlocked', 'true');
            
            // 7. Синхронизируем с cyberProfile для обратной совместимости
            const cyberProfile = {
                rank: 'Senior Developer',
                title: 'Senior Разработчик',
                rankIcon: '👨‍💻',
                levels: allLevels
            };
            localStorage.setItem('cyberProfile', JSON.stringify(cyberProfile));
            
            // 8. Показываем сообщение об успехе
            this.addConsoleMessage('🎉 Все уровни пройдены! Вы стали SENIOR разработчиком!', 'success');
            this.addConsoleMessage('📊 Прогресс сохранен', 'info');
            
            // 9. Создаем красивое окно с результатом
            setTimeout(() => {
                this.showCompletionPopup();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Критическая ошибка сохранения прогресса:', error);
            this.addConsoleMessage('❌ Ошибка сохранения прогресса! Проверьте консоль', 'error');
            
            // Показываем сообщение с деталями ошибки
            setTimeout(() => {
                this.showErrorPopup(error);
            }, 500);
        }
    }

    showCompletionPopup() {
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #0a0a1a, #1a1a2e);
            border: 3px solid #00ff88;
            border-radius: 15px;
            padding: 30px;
            z-index: 9999;
            color: white;
            font-family: 'Courier New', monospace;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 0 50px rgba(0, 255, 136, 0.5);
        `;
        
        alertDiv.innerHTML = `
            <h2 style="color: #00ff88; margin-bottom: 20px; text-shadow: 0 0 10px #00ff88;">🎊 УРОВЕНЬ ПРОЙДЕН!</h2>
            <h3 style="color: gold; margin-bottom: 20px;">🏆 ВЫ СТАЛИ SENIOR РАЗРАБОТЧИКОМ!</h3>
            <div style="background: rgba(0, 255, 136, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 8px 0; font-size: 16px;">✅ Ядро вируса уничтожено</p>
                <p style="margin: 8px 0; font-size: 16px;">✅ Все 9 уровней завершены</p>
                <p style="margin: 8px 0; font-size: 16px;">✅ Статус: SENIOR</p>
                <p style="margin: 8px 0; font-size: 14px; color: #aaa;">Все уровни разблокированы для повторного прохождения</p>
            </div>
            <button onclick="this.parentElement.remove(); goToLevelMap();" 
                    style="background: #00ff88; 
                           color: #0a0a1a; 
                           border: none; 
                           padding: 12px 30px; 
                           font-size: 16px; 
                           border-radius: 5px; 
                           cursor: pointer;
                           font-family: 'Courier New', monospace;
                           font-weight: bold;
                           margin-top: 20px;
                           transition: all 0.3s;">
                Перейти к карте уровней
            </button>
            <div style="margin-top: 15px; font-size: 12px; color: #888;">
                Прогресс сохранен в: cyberSystemsProfile
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Добавляем анимацию кнопки
        const button = alertDiv.querySelector('button');
        button.addEventListener('mouseover', () => {
            button.style.background = '#00cc6a';
            button.style.boxShadow = '0 0 15px #00ff88';
        });
        button.addEventListener('mouseout', () => {
            button.style.background = '#00ff88';
            button.style.boxShadow = 'none';
        });
        
        // Автоматический переход через 15 секунд
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
            this.goToLevelMap();
        }, 15000);
    }

    showErrorPopup(error) {
        const errorAlert = document.createElement('div');
        errorAlert.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1a1a2e;
            border: 3px solid #f44336;
            border-radius: 10px;
            padding: 20px;
            z-index: 9999;
            color: white;
            font-family: 'Courier New', monospace;
            text-align: left;
            max-width: 600px;
        `;
        
        errorAlert.innerHTML = `
            <h3 style="color: #f44336;">⚠️ Ошибка сохранения</h3>
            <p>${error.message}</p>
            <p style="margin-top: 15px; color: #aaa;">Рекомендации:</p>
            <ol style="color: #aaa; margin-left: 20px;">
                <li>Откройте DevTools (F12) и проверьте Console</li>
                <li>Проверьте ключ 'cyberSystemsProfile' в Application/Storage</li>
                <li>Попробуйте перезагрузить страницу и пройти уровень снова</li>
            </ol>
            <button onclick="this.parentElement.remove(); location.reload();" 
                    style="background: #f44336; 
                           color: white; 
                           border: none; 
                           padding: 10px 20px; 
                           border-radius: 5px; 
                           cursor: pointer;
                           margin-top: 15px;">
                Перезагрузить страницу
            </button>
        `;
        
        document.body.appendChild(errorAlert);
    }

    checkAndFixProgress() {
        console.group('=== ПРОВЕРКА И ВОССТАНОВЛЕНИЕ ПРОГРЕССА ===');
        
        const profile = JSON.parse(localStorage.getItem('cyberSystemsProfile') || '{}');
        const allLevels = ['1.1', '1.2', '1.boss', '2.1', '2.2', '2.boss', '3.1', '3.2', '3.boss'];
        let needsFix = false;
        
        // Проверяем, все ли уровни в профиле
        if (!profile.completedLevels || !Array.isArray(profile.completedLevels)) {
            console.log('❌ completedLevels отсутствует или не массив');
            needsFix = true;
        } else {
            allLevels.forEach(level => {
                if (!profile.completedLevels.includes(level)) {
                    console.log(`❌ Уровень ${level} отсутствует в completedLevels`);
                    needsFix = true;
                }
            });
        }
        
        // Проверяем статус SENIOR
        if (profile.seniorUnlocked !== true || profile.rank !== 'SENIOR') {
            console.log(`❌ Статус не SENIOR: seniorUnlocked=${profile.seniorUnlocked}, rank=${profile.rank}`);
            needsFix = true;
        }
        
        // Если нужно исправить
        if (needsFix) {
            console.log('🔄 Исправляю прогресс...');
            
            // Обновляем профиль
            profile.lastCompleted = '3.boss';
            profile.seniorUnlocked = true;
            profile.juniorUnlocked = true;
            profile.completedLevels = allLevels;
            profile.rank = 'SENIOR';
            
            localStorage.setItem('cyberSystemsProfile', JSON.stringify(profile));
            console.log('✅ Прогресс исправлен!');
            
            this.addConsoleMessage('🔄 Прогресс восстановлен', 'success');
        } else {
            console.log('✅ Прогресс в порядке');
        }
        
        console.groupEnd();
        return !needsFix;
    }

    getCompletionMessage() {
        return '🎊 УРОВЕНЬ ПРОЙДЕН!\n\n🏆 ВЫ СТАЛИ SENIOR-ПРОГРАММИСТОМ!\n\nВы успешно восстановили систему, победив ядро вируса!\nОсвоены: условия, циклы, функции и их комбинации!\n\nПоздравляем с завершением игры!';
    }

    showHelp() {
        alert('Помощь по уровню 3.3 - Финальный босс:\n\n' +
              '1. Напишите функцию восстановить_систему() с условиями и циклами\n' +
              '2. Проверяйте состояние светофора: светофор == "зеленый/красный"\n' +
              '3. Используйте переложить_предметы() для заполнения конвейеров\n' +
              '   - Дрон должен стоять НА КОНВЕЙЕРЕ (координаты: 1,8 / 5,8 / 9,8)\n' +
              '4. Доберитесь до ядра вируса (13,8) и используйте активировать_ядро()\n' +
              '5. Нужно переместить 3 предметов\n\n' +
              'Координаты:\n' +
              '- Старт: (1,1)\n' +
              '- Конвейеры: (1,8), (5,8), (9,8)\n' +
              '- Ядро вируса: (13,8)');
    }

    goBack() {
        if (this.trafficLightInterval) {
            clearInterval(this.trafficLightInterval);
            this.trafficLightInterval = null;
        }
        window.location.href = '../level-map/index.html';
    }

    goToLevelMap() {
        if (this.trafficLightInterval) {
            clearInterval(this.trafficLightInterval);
            this.trafficLightInterval = null;
        }
        window.location.href = '../level-map/index.html';
    }
}