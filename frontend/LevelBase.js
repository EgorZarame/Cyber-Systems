// frontend/js/levels/LevelBase.js
class LevelBase {
    constructor(config) {
        this.config = config;
        this.drone = {
            x: config.start.x,
            y: config.start.y,
            direction: 'east'
        };
        this.programBlocks = [];
        this.isExecuting = false;
        this.initElements();
    }

    initElements() {
        this.gameGrid = document.getElementById('gameGrid');
        this.codeArea = document.getElementById('codeArea');
        this.consoleOutput = document.getElementById('consoleOutput');
    }

    initialize() {
        this.initializeGameGrid();
        this.initializeDragAndDrop();
        this.addConsoleMessage('Дрон готов');
        this.addConsoleMessage(this.getWelcomeMessage());
    }

    initializeGameGrid() {
        this.gameGrid.innerHTML = '';

        for (let y = 0; y < this.config.gridSizeY; y++) {
            for (let x = 0; x < this.config.gridSizeX; x++) {
                const cell = this.createGridCell(x, y);
                this.gameGrid.appendChild(cell);
            }
        }

        this.updateDronePosition();
    }

    createGridCell(x, y) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.x = x;
        cell.dataset.y = y;

        if (x === this.config.start.x && y === this.config.start.y) {
            cell.classList.add('start');
        } else if (x === this.config.finish.x && y === this.config.finish.y) {
            cell.classList.add('finish');
        }

        // Метод для обработки препятствий (переопределяется в наследниках)
        this.checkObstacles(cell, x, y);

        return cell;
    }

    checkObstacles(cell, x, y) {
        // Базовый метод - без препятствий
        // Переопределяется в Level1_2 и Level1_3
    }

    initializeDragAndDrop() {
        const blocks = document.querySelectorAll('.code-block[draggable="true"]');
        
        blocks.forEach(block => {
            block.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', block.dataset.action);
            });
        });

        this.codeArea.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.codeArea.addEventListener('drop', (e) => {
            e.preventDefault();
            const action = e.dataTransfer.getData('text/plain');
            this.addBlockToProgram(action);
        });
    }

    addBlockToProgram(action) {
        const placeholder = this.codeArea.querySelector('.code-placeholder');
        
        if (placeholder) {
            placeholder.remove();
        }

        const block = document.createElement('div');
        block.className = 'code-block';
        block.textContent = this.getBlockText(action);
        block.dataset.action = action;
        
        // Стилизация блоков
        this.styleBlock(block, action);
        
        block.addEventListener('dblclick', () => {
            if (!this.isExecuting) {
                block.remove();
                this.programBlocks = this.programBlocks.filter(b => b.element !== block);
                this.updateProgramState();
            }
        });

        this.codeArea.appendChild(block);
        this.programBlocks.push({ action, element: block });
        
        this.addConsoleMessage(`Добавлен блок: ${this.getBlockText(action)}`);
    }

    getBlockText(action) {
        const actions = {
            'move': 'ДВИГАТЬСЯ_ВПЕРЕД()',
            'left': 'ПОВЕРНУТЬ_НАЛЕВО()',
            'right': 'ПОВЕРНУТЬ_НАПРАВО()',
            'attack': 'АТАКОВАТЬ_БОССА()'
        };
        return actions[action] || 'НЕИЗВЕСТНАЯ_КОМАНДА';
    }

    styleBlock(block, action) {
        if (action === 'move') {
            block.classList.add('movement');
        } else if (action === 'attack') {
            block.classList.add('attack');
        } else {
            block.classList.add('rotation');
        }
    }

    async runProgram() {
        if (this.isExecuting) return;
        
        if (this.programBlocks.length === 0) {
            this.addConsoleMessage('Ошибка: программа пуста!');
            return;
        }

        this.isExecuting = true;
        this.resetDrone();
        this.addConsoleMessage('Программа запущена');

        for (const block of this.programBlocks) {
            if (!this.isExecuting) break;
            
            await this.executeAction(block);
            await new Promise(resolve => setTimeout(resolve, 600));
            
            if (this.checkLevelComplete()) {
                await this.completeLevel();
                break;
            }
        }
        
        if (this.isExecuting) {
            this.addConsoleMessage('Программа завершена');
            this.isExecuting = false;
        }
    }

    async executeAction(blockData) {
        const { action } = blockData;
        
        this.addConsoleMessage(`Выполняется: ${this.getBlockText(action)}`);

        switch (action) {
            case 'move':
                await this.moveForward();
                break;
            case 'left':
                await this.turnLeft();
                break;
            case 'right':
                await this.turnRight();
                break;
            case 'attack':
                await this.attackBoss();
                break;
        }
    }

    async moveForward() {
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
            droneElement.style.setProperty('--rotation', 
                this.drone.direction === 'north' ? '0deg' :
                this.drone.direction === 'east' ? '90deg' :
                this.drone.direction === 'south' ? '180deg' : '270deg');
        }

        await new Promise(resolve => setTimeout(resolve, 400));

        if (this.canMoveTo(newX, newY)) {
            this.drone.x = newX;
            this.drone.y = newY;
            this.addConsoleMessage(`✅ Перемещение на (${newX}, ${newY})`);
        } else {
            this.addConsoleMessage('❌ Препятствие или граница поля');
        }

        this.updateDronePosition();
        
        if (droneElement) {
            setTimeout(() => {
                droneElement.classList.remove('drone-moving');
            }, 200);
        }
    }

    canMoveTo(x, y) {
        // Базовый метод - проверяет только границы
        return x >= 0 && x < this.config.gridSizeX && 
               y >= 0 && y < this.config.gridSizeY;
    }

    async turnLeft() {
        const directions = ['north', 'west', 'south', 'east'];
        const currentIndex = directions.indexOf(this.drone.direction);
        this.drone.direction = directions[(currentIndex + 1) % 4];
        
        this.addConsoleMessage(`↩️ Поворот налево. Направление: ${this.drone.direction}`);
        this.updateDronePosition();
        
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    async turnRight() {
        const directions = ['north', 'east', 'south', 'west'];
        const currentIndex = directions.indexOf(this.drone.direction);
        this.drone.direction = directions[(currentIndex + 1) % 4];
        
        this.addConsoleMessage(`↪️ Поворот направо. Направление: ${this.drone.direction}`);
        this.updateDronePosition();
        
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    async attackBoss() {
        // Базовый метод - пустая реализация
        // Переопределяется в Level1_3
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

    resetProgram() {
        if (this.isExecuting) {
            this.isExecuting = false;
            this.addConsoleMessage('Программа прервана');
        }
        
        this.codeArea.innerHTML = '';
        this.programBlocks = [];
        this.updateProgramState();
        this.resetDrone();
        this.addConsoleMessage('Программа сброшена');
    }

    resetDrone() {
        this.drone.x = this.config.start.x;
        this.drone.y = this.config.start.y;
        this.drone.direction = 'east';
        this.updateDronePosition();
    }

    updateProgramState() {
        if (this.programBlocks.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'code-placeholder';
            placeholder.textContent = 'Перетащите блоки сюда';
            this.codeArea.appendChild(placeholder);
        }
    }

    addConsoleMessage(message, type = 'player') {
        const messageElement = document.createElement('div');
        messageElement.className = `console-line log-${type}`;
        messageElement.textContent = message;
        
        this.consoleOutput.appendChild(messageElement);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    checkLevelComplete() {
        return this.drone.x === this.config.finish.x && 
               this.drone.y === this.config.finish.y;
    }

    async completeLevel() {
        this.isExecuting = false;
        
        try {
            await updateProgress(this.config.id);
            this.addConsoleMessage('Прогресс сохранен', 'success');
        } catch (error) {
            console.error(`Ошибка обновления прогресса (${this.config.id}):`, error);
        }
        syncLocalProfileAfterLevel(this.config.id);
        
        setTimeout(() => {
            alert(`🎉 ${this.config.title} пройден!`);
            goToLevelMap();
        }, 500);
    }

    getWelcomeMessage() {
        return 'Добро пожаловать на уровень!';
    }

    // Навигация (общие методы)
    goBack() {
        window.location.href = '../level-map/index.html';
    }

    showHelp() {
        alert('Помощь по уровню:\n\nИспользуйте блоки программирования для управления дроном');
    }

    goToLevelMap() {
        window.location.href = '../level-map/index.html';
    }
}