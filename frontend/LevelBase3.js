// Базовый класс для всех уровней главы 3
class LevelBase3 extends LevelBase {
    constructor(config) {
        super(config);
        this.isPythonMode = true;
        this.currentLine = 0;
        this.trafficLightInterval = null;
        this.conveyorsFilled = false;
        this.virusCoreActivated = false;
        this.itemsMoved = 0;
        this.initPythonElements();
    }

    initPythonElements() {
        this.codeEditor = document.getElementById('codeEditor');
        this.redLight = document.getElementById('redLight');
        this.greenLight = document.getElementById('greenLight');
    }

    initialize() {
        // УБРАЛИ вызов initializeGameGrid() здесь!
        this.setupCodeEditor();
        this.addConsoleMessage('🐍 Python интерпретатор готов', 'info');
        this.addConsoleMessage(this.getWelcomeMessage(), 'info');
    }

    getWelcomeMessage() {
        return 'Добро пожаловать на уровень главы 3!';
    }

    setupCodeEditor() {
        if (this.codeEditor) {
            this.codeEditor.addEventListener('input', this.handleCodeInput.bind(this));
        }
    }

    handleCodeInput() {
        // Базовая обработка ввода кода
    }

    updateTrafficLightDisplay() {
        if (!this.redLight || !this.greenLight) return;
        
        const state = this.config.trafficLight?.state || 'красный';
        
        if (state === 'красный') {
            this.redLight.classList.remove('inactive');
            this.redLight.classList.add('red', 'light-changing');
            this.greenLight.classList.add('inactive');
            this.greenLight.classList.remove('green', 'light-changing');
        } else {
            this.greenLight.classList.remove('inactive');
            this.greenLight.classList.add('green', 'light-changing');
            this.redLight.classList.add('inactive');
            this.redLight.classList.remove('red', 'light-changing');
        }
        
        setTimeout(() => {
            if (this.redLight) this.redLight.classList.remove('light-changing');
            if (this.greenLight) this.greenLight.classList.remove('light-changing');
        }, 500);
    }

    startTrafficLight(changeInterval = 3000) {
        if (!this.config.trafficLight) {
            this.config.trafficLight = { state: 'красный' };
        }
        
        this.updateTrafficLightDisplay();
        
        this.trafficLightInterval = setInterval(() => {
            this.config.trafficLight.state = 
                this.config.trafficLight.state === 'зеленый' ? 'красный' : 'зеленый';
            this.updateTrafficLightDisplay();
            this.addConsoleMessage(`🚦 Светофор сменился на: ${this.config.trafficLight.state}`, 'warning');
        }, changeInterval);
    }

    async runPythonCode() {
        if (this.isExecuting) {
            this.addConsoleMessage('⚠️ Код уже выполняется', 'error');
            return;
        }

        const code = this.codeEditor?.value.trim() || '';
        
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

    validatePythonCode(code) {
        // Базовый метод - должен быть переопределен в дочерних классах
        return true;
    }

    async executePythonCode(code) {
        // Базовый метод - должен быть переопределен в дочерних классах
        throw new Error('Метод executePythonCode должен быть переопределен');
    }

    async executeCommand(command) {
        const cleanCommand = command.split('#')[0].trim();
        
        if (!cleanCommand) return;
        
        if (cleanCommand === 'двигаться_вперед()') {
            await this.moveForward();
        } else if (cleanCommand === 'повернуть_налево()') {
            await this.turnLeft();
        } else if (cleanCommand === 'повернуть_направо()') {
            await this.turnRight();
        } else if (cleanCommand === 'стой_на_месте()') {
            await this.waitInPlace();
        } else if (cleanCommand === 'переложить_предметы()') {
            await this.moveItems();
        } else if (cleanCommand === 'активировать_ядро()') {
            await this.activateVirusCore();
        } else if (cleanCommand.startsWith('#')) {
            return;
        } else if (cleanCommand.includes('(') && cleanCommand.includes(')')) {
            const funcName = cleanCommand.split('(')[0];
            if (funcName && funcName !== 'range') {
                throw new Error(`Неизвестная команда: ${funcName}`);
            }
        }
    }

    async moveForward() {
        // Проверяем светофор, если есть
        if (this.config.trafficLight && this.config.trafficLight.state === 'красный') {
            this.addConsoleMessage('🚫 Движение запрещено: красный свет!', 'warning');
            
            this.addConsoleMessage('⏳ Ожидание зеленого света...', 'info');
            
            // Ждем зеленый свет
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

        // Анимация движения
        const droneElement = document.querySelector('.drone');
        if (droneElement) {
            droneElement.classList.add('drone-moving');
        }

        await new Promise(resolve => setTimeout(resolve, 400));

        // Проверка препятствий и границ
        const hasObstacle = this.config.obstacles?.some(obs => obs.x === newX && obs.y === newY) || false;
        
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
        // Базовый метод - должен быть переопределен в Level3_3
        throw new Error('Метод moveItems должен быть переопределен');
    }

    async activateVirusCore() {
        // Базовый метод - должен быть переопределен в Level3_3
        throw new Error('Метод activateVirusCore должен быть переопределен');
    }

    checkObstacles(cell, x, y) {
        // Проверяем препятствия из конфигурации
        if (this.config.obstacles?.some(obs => obs.x === x && obs.y === y)) {
            cell.classList.add('obstacle');
        }
        
        // Проверяем конвейеры (для уровня 3.3)
        if (this.config.conveyors?.some(conv => conv.x === x && conv.y === y)) {
            cell.classList.add('conveyor');
        }
        
        // Проверяем раздатчики (для уровня 3.3)
        if (this.config.dispensers?.some(disp => disp.x === x && disp.y === y)) {
            cell.classList.add('dispenser');
        }
        
        // Проверяем путь (для отображения)
        if (this.config.path?.some(point => point.x === x && point.y === y)) {
            cell.classList.add('path');
        }
        
        // Проверяем ядро вируса (для уровня 3.3)
        if (this.config.virusCore && x === this.config.virusCore.x && y === this.config.virusCore.y) {
            cell.classList.add('virus-core');
        }
    }

    resetProgram() {
        if (this.trafficLightInterval) {
            clearInterval(this.trafficLightInterval);
            this.trafficLightInterval = null;
        }
        
        if (this.codeEditor) {
            this.codeEditor.value = '';
        }
        
        // Сбрасываем специфичные для главы 3 переменные
        this.conveyorsFilled = false;
        this.virusCoreActivated = false;
        this.itemsMoved = 0;
        
        this.addConsoleMessage('🔄 Программа сброшена', 'info');
        
        super.resetProgram();
    }

    resetDrone() {
        super.resetDrone();
        
        if (this.config.trafficLight) {
            this.config.trafficLight.state = 'красный';
            this.updateTrafficLightDisplay();
        }
        
        // Восстанавливаем предметы для уровня 3.3
        if (this.config.items) {
            this.updateItemsDisplay();
        }
    }

    updateItemsDisplay() {
        // Удаляем все существующие предметы
        document.querySelectorAll('.item-red, .item-blue, .item-green').forEach(item => {
            item.classList.remove('item-red', 'item-blue', 'item-green');
        });
        
        // Добавляем предметы на их позиции
        if (this.config.items) {
            this.config.items.forEach(item => {
                const cell = document.querySelector(`[data-x="${item.x}"][data-y="${item.y}"]`);
                if (cell) {
                    cell.classList.add(`item-${item.color}`);
                }
            });
        }
    }

    addConsoleMessage(message, type = '') {
        const messageElement = document.createElement('div');
        messageElement.className = `console-line ${type ? 'log-' + type : ''}`;
        messageElement.textContent = message;
        
        if (this.consoleOutput) {
            this.consoleOutput.appendChild(messageElement);
            this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
        }
    }

    evaluateCondition(conditionLine) {
        const condition = conditionLine.replace(/^(if|while)\s+|\s*:$/g, '');
        
        if (condition.includes("светофор == 'зеленый'")) {
            return this.config.trafficLight?.state === 'зеленый';
        } 
        else if (condition.includes("светофор == 'красный'")) {
            return this.config.trafficLight?.state === 'красный';
        }
        else if (condition.includes('конвейеры_заполнены')) {
            return this.conveyorsFilled;
        }
        else if (condition.includes('ядро_активировано')) {
            return this.virusCoreActivated;
        }
        
        return false;
    }

    checkLevelComplete() {
        // Базовая проверка достижения финиша
        if (this.config.finish) {
            return this.drone.x === this.config.finish.x && 
                   this.drone.y === this.config.finish.y;
        }
        return false;
    }

    async completeLevel() {
        this.isExecuting = false;
        
        if (this.trafficLightInterval) {
            clearInterval(this.trafficLightInterval);
            this.trafficLightInterval = null;
        }
        
        try {
            // Проверяем, существует ли функция updateProgress
            if (typeof updateProgress === 'function') {
                await updateProgress(this.config.id);
                this.addConsoleMessage('🎉 Уровень пройден! Прогресс сохранен', 'success');
            } else {
                // Если нет - используем localStorage как fallback
                localStorage.setItem(`level_${this.config.id}_completed`, 'true');
                this.addConsoleMessage('🎉 Уровень пройден! (локальное сохранение)', 'success');
            }
        } catch (error) {
            console.error(`Ошибка обновления прогресса (${this.config.id}):`, error);
            this.addConsoleMessage('⚠️ Не удалось сохранить прогресс', 'warning');
        }
        
        // Синхронизируем профиль
        if (typeof syncLocalProfileAfterLevel === 'function') {
            syncLocalProfileAfterLevel(this.config.id);
        }
        
        setTimeout(() => {
            const message = this.getCompletionMessage();
            if (message) {
                alert(`🎊 ${this.config.title} пройден!\n\n${message}`);
            } else {
                alert(`🎊 ${this.config.title} пройден!`);
            }
            this.goToLevelMap();
        }, 1000);
    }

    getCompletionMessage() {
        return 'Поздравляем с завершением уровня!';
    }

    showHelp() {
        alert('Помощь по уровню главы 3:\n\nИспользуйте Python код для управления дроном');
    }

    goBack() {
        if (this.trafficLightInterval) {
            clearInterval(this.trafficLightInterval);
        }
        super.goBack();
    }

    goToLevelMap() {
        if (this.trafficLightInterval) {
            clearInterval(this.trafficLightInterval);
        }
        super.goToLevelMap();
    }
}