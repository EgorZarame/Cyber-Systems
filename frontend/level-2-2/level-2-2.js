  // frontend/js/levels/Level2_2.js
  class Level2_2 extends LevelBase {
    constructor() {
        super({
            id: '2.2',
            title: 'Циклы',
            gridSizeX: 12,
            gridSizeY: 8,
            start: { x: 1, y: 1 },
            finish: { x: 10, y: 6 },
            obstacles: [
                { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
                { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 },
                { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 },
                { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 },
                { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 },
                { x: 1, y: 6 }, { x: 2, y: 6 },
                { x: 10, y: 4 }, { x: 10, y: 5 }
            ],
            patterns: [
                { x: 2, y: 1, width: 1, height: 3, repeat: 3, stepX: 3 },
                { x: 3, y: 4, width: 3, height: 1, repeat: 2, stepY: 1 }
            ]
        });
        
        this.programBlocks = [];
        this.currentLoop = {
            active: false,
            count: 0,
            total: 0,
            blocks: [],
            index: 0
        };
        this.activeLoopBody = null;
    }

    getWelcomeMessage() {
        return 'Используйте циклы для повторяющихся паттернов';
    }

    initialize() {
        this.initializeGameGrid();
        this.initializeDragAndDrop();
        this.updateLoopCounter();
        this.addConsoleMessage('Дрон готов', 'system');
        this.addConsoleMessage(this.getWelcomeMessage(), 'system');
    }

    initElements() {
        super.initElements();
        this.loopCounter = document.getElementById('loopCounter');
        this.currentLoopSpan = document.getElementById('currentLoop');
        this.totalLoopsSpan = document.getElementById('totalLoops');
    }

    createGridCell(x, y) {
        const cell = super.createGridCell(x, y);
        
        if (this.isPatternCell(x, y)) {
            cell.classList.add('pattern');
        }
        
        return cell;
    }

    checkObstacles(cell, x, y) {
        const hasObstacle = this.config.obstacles.some(obs => obs.x === x && obs.y === y);
        if (hasObstacle) {
            cell.classList.add('obstacle');
        }
    }

    isPatternCell(x, y) {
        return this.config.patterns.some(pattern => {
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

    initializeDragAndDrop() {
        const blocks = document.querySelectorAll('.code-block[draggable="true"]');
        
        blocks.forEach(block => {
            block.addEventListener('dragstart', (e) => {
                const action = block.dataset.action;
                let data = { action };
                
                if (action === 'loop') {
                    const input = block.querySelector('.loop-input');
                    // ИСПРАВЛЕНИЕ: получаем реальное значение из input
                    data.count = parseInt(input.value) || 3;
                    console.log('Dragstart: count =', data.count);
                }
                
                e.dataTransfer.setData('application/json', JSON.stringify(data));
            });
        });

        this.codeArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.currentTarget.style.backgroundColor = 'rgba(255, 152, 0, 0.1)';
        });

        this.codeArea.addEventListener('dragleave', (e) => {
            e.currentTarget.style.backgroundColor = '';
        });

        this.codeArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.currentTarget.style.backgroundColor = '';
            try {
                const data = JSON.parse(e.dataTransfer.getData('application/json'));
                console.log('Drop: data =', data);
                this.addBlockToProgram(data.action, data.count);
            } catch (error) {
                console.error('Ошибка при добавлении блока:', error);
            }
        });
    }

    addBlockToProgram(action, loopCount = 3) {
        const placeholder = this.codeArea.querySelector('.code-placeholder');
        
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
                <input type="number" class="loop-input" value="${loopCount}" min="1" max="10">
                )
            `;
            block.appendChild(content);
            
            // Добавляем обработчик изменения значения
            const input = content.querySelector('.loop-input');
            input.addEventListener('change', () => {
                this.updateLoopCount(input);
            });
            
            const loopBody = document.createElement('div');
            loopBody.className = 'loop-body';
            loopBody.dataset.loopBody = 'true';
            loopBody.dataset.loopActive = 'true';
            block.appendChild(loopBody);
            
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
            endLoopBtn.onclick = () => {
                loopBody.dataset.loopActive = 'false';
                this.activeLoopBody = null;
                endLoopBtn.remove();
                this.addConsoleMessage('✅ Тело цикла завершено', 'system');
            };
            block.appendChild(endLoopBtn);
            
            this.activeLoopBody = loopBody;
        } else {
            if (action === 'move') {
                block.classList.add('movement');
            } else {
                block.classList.add('rotation');
            }
            block.textContent = this.getBlockText(action);
        }
        
        block.addEventListener('dblclick', () => {
            if (!this.isExecuting) {
                if (action === 'loop') {
                    const loopBody = block.querySelector('.loop-body');
                    if (loopBody) {
                        const childBlocks = loopBody.querySelectorAll('.code-block');
                        childBlocks.forEach(child => {
                            this.programBlocks = this.programBlocks.filter(b => b.element !== child);
                        });
                    }
                }
                
                block.remove();
                this.programBlocks = this.programBlocks.filter(b => b.element !== block);
                this.updateProgramState();
            }
        });

        const activeLoopBody = this.codeArea.querySelector('.loop-body[data-loop-active="true"]');
        
        if (activeLoopBody && action !== 'loop') {
            activeLoopBody.appendChild(block);
        } else {
            this.codeArea.appendChild(block);
        }
        
        this.programBlocks.push({ action, count: loopCount, element: block });
        this.addConsoleMessage(`+ Блок: ${this.getBlockText(action, loopCount)}`, 'system');
    }

    updateLoopCount(input) {
        const block = input.closest('.code-block');
        const count = parseInt(input.value) || 3;
        console.log('updateLoopCount: new count =', count);
        
        // Обновляем data-атрибут
        block.dataset.count = count;
        
        // Обновляем в массиве programBlocks
        const blockIndex = this.programBlocks.findIndex(b => b.element === block);
        if (blockIndex !== -1) {
            this.programBlocks[blockIndex].count = count;
            console.log('Updated block count in programBlocks:', this.programBlocks[blockIndex]);
        }
    }

    getBlockText(action, count = 0) {
        switch (action) {
            case 'move': return 'ДВИГАТЬСЯ_ВПЕРЕД()';
            case 'left': return 'ПОВЕРНУТЬ_НАЛЕВО()';
            case 'right': return 'ПОВЕРНУТЬ_НАПРАВО()';
            case 'loop': return `повторить(${count})`;
            default: return 'НЕИЗВЕСТНАЯ_КОМАНДА';
        }
    }

    async runProgram() {
        if (this.isExecuting) return;
        
        if (this.programBlocks.length === 0) {
            this.addConsoleMessage('Ошибка: программа пуста!', 'danger');
            return;
        }

        this.isExecuting = true;
        this.resetDrone();
        this.addConsoleMessage('Запуск программы...', 'system');

        await this.executeBlocks(this.programBlocks);
        
        if (this.isExecuting) {
            if (this.checkLevelComplete()) {
                this.addConsoleMessage('🎉 Дрон достиг цели!', 'success');
                setTimeout(() => {
                    this.completeLevel();
                }, 1000);
            } else {
                this.addConsoleMessage(`Программа завершена. Дрон на (${this.drone.x}, ${this.drone.y})`, 'system');
            }
            this.isExecuting = false;
        }
    }

    async executeBlocks(blocks) {
        for (let i = 0; i < blocks.length; i++) {
            if (!this.isExecuting) break;
            
            const block = blocks[i];
            
            if (block.action === 'loop') {
                await this.executeLoop(block);
            } else {
                await this.executeAction(block);
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            if (this.checkLevelComplete()) break;
        }
    }

    async executeLoop(loopBlock) {
        // ИСПРАВЛЕНИЕ: получаем count из самого блока, а не только из dataset
        const loopCount = loopBlock.count || 3;
        const loopBody = loopBlock.element.querySelector('.loop-body');
        const bodyBlocks = this.getBlocksInLoopBody(loopBody);
        
        console.log('Executing loop: count =', loopCount, 'bodyBlocks =', bodyBlocks.length);
        this.addConsoleMessage(`🔁 Цикл: ${loopCount} повторений`, 'system');
        
        for (let i = 0; i < loopCount; i++) {
            if (!this.isExecuting) break;
            
            this.currentLoop.active = true;
            this.currentLoop.count = i + 1;
            this.currentLoop.total = loopCount;
            this.updateLoopCounter();
            
            this.addConsoleMessage(`🔂 Итерация ${i + 1}/${loopCount}`, 'system');
            loopBlock.element.classList.add('loop-executing');
            
            await this.executeBlocks(bodyBlocks);
            
            loopBlock.element.classList.remove('loop-executing');
            await new Promise(resolve => setTimeout(resolve, 200));
            
            if (this.checkLevelComplete()) break;
        }
        
        this.currentLoop.active = false;
        this.updateLoopCounter();
        this.addConsoleMessage(`✅ Цикл завершен (выполнено ${loopCount} повторений)`, 'system');
    }

    getBlocksInLoopBody(loopBody) {
        const blocks = [];
        const childBlocks = loopBody.querySelectorAll(':scope > .code-block');
        
        childBlocks.forEach(child => {
            const blockIndex = this.programBlocks.findIndex(b => b.element === child);
            if (blockIndex !== -1) {
                blocks.push(this.programBlocks[blockIndex]);
            }
        });
        
        return blocks;
    }

    async executeAction(block) {
        const { action, element } = block;
        
        element.classList.add('executing');
        this.addConsoleMessage(`→ ${this.getBlockText(action)}`, 'system');

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
        }

        setTimeout(() => {
            element.classList.remove('executing');
        }, 200);
    }

    canMoveTo(x, y) {
        if (x < 0 || x >= this.config.gridSizeX || y < 0 || y >= this.config.gridSizeY) {
            return false;
        }
        
        const hasObstacle = this.config.obstacles.some(obs => obs.x === x && obs.y === y);
        return !hasObstacle;
    }

    updateLoopCounter() {
        if (this.currentLoop.active && this.currentLoopSpan && this.totalLoopsSpan) {
            this.currentLoopSpan.textContent = this.currentLoop.count;
            this.totalLoopsSpan.textContent = this.currentLoop.total;
            this.loopCounter.style.display = 'block';
        } else if (this.loopCounter) {
            this.loopCounter.style.display = 'none';
        }
    }

    // ПЕРЕОПРЕДЕЛЯЕМ метод addConsoleMessage для оптимизации вывода
    addConsoleMessage(message, type = 'system') {
        if (!this.consoleOutput) return;
        
        // Сокращаем длинные сообщения
        let shortMessage = message;
        if (message.length > 60) {
            shortMessage = message.substring(0, 57) + '...';
        }
        
        // Оптимизируем текст для консоли
        shortMessage = shortMessage
            .replace('Система инициализирована', 'Сис. иниц.')
            .replace('Используйте циклы для повторяющихся паттернов', 'Циклы для паттернов')
            .replace('Дрон готов к программированию', 'Дрон готов')
            .replace('Запуск программы...', 'Запуск...')
            .replace('Выполняется:', '→')
            .replace('ДВИГАТЬСЯ_ВПЕРЕД()', 'ДВИГ_ВПЕР()')
            .replace('ПОВЕРНУТЬ_НАЛЕВО()', 'ПОВ_НАЛЕВО()')
            .replace('ПОВЕРНУТЬ_НАПРАВО()', 'ПОВ_НАПРАВО()')
            .replace('Цикл: повторений', 'Цикл:')
            .replace('Итерация', 'Ит.')
            .replace('Цикл завершен', 'Цикл ок')
            .replace('Программа завершена', 'Завершено')
            .replace('Дрон достиг цели!', 'Цель!')
            .replace('Программа прервана', 'Прервано')
            .replace('Программа сброшена', 'Сброшено')
            .replace('Препятствие или граница поля', 'Столкн.')
            .replace('Перемещение на', '→')
            .replace('Поворот налево', '↰')
            .replace('Поворот направо', '↱');
        
        const messageElement = document.createElement('div');
        messageElement.className = `console-line log-${type}`;
        messageElement.textContent = shortMessage;
        
        this.consoleOutput.appendChild(messageElement);
        
        // Ограничиваем количество сообщений в консоли (удаляем старые)
        const maxMessages = 15;
        const messages = this.consoleOutput.querySelectorAll('.console-line');
        if (messages.length > maxMessages) {
            for (let i = 0; i < messages.length - maxMessages; i++) {
                if (messages[i]) {
                    messages[i].remove();
                }
            }
        }
        
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    async completeLevel() {
        this.isExecuting = false;
        
        try {
            await updateProgress(this.config.id);
        } catch (error) {
            console.error('Ошибка обновления прогресса:', error);
        }
        syncLocalProfileAfterLevel(this.config.id);
        
        alert('🎊 Уровень пройден!\n\nВы освоили циклы!\nЭффективное программирование с повторениями!');
        this.goToLevelMap();
    }
}