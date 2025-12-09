// frontend/js/levels/Level2_1.js
class Level2_1 extends LevelBase2 {
    constructor() {
        super({
            id: '2.1',
            title: 'Условные переменные',
            packages: [
                { id: 1, color: 'красный' },
                { id: 2, color: 'синий' },
                { id: 3, color: 'зеленый' },
                { id: 4, color: 'красный' },
                { id: 5, color: 'синий' },
                { id: 6, color: 'зеленый' },
                { id: 7, color: 'красный' },
                { id: 8, color: 'синий' }
            ],
            requiredSorting: {
                'красный': 3,
                'синий': 3,
                'зеленый': 2
            }
        });
    }

    getWelcomeMessage() {
        return 'Система сортировки инициализирована. Запрограммируйте робота-сортировщика';
    }

    initializeDragAndDrop() {
        const blocks = document.querySelectorAll('.code-block[draggable="true"]');
        
        if (!this.codeArea) {
            console.error('codeArea не найден');
            return;
        }

        blocks.forEach(block => {
            block.addEventListener('dragstart', (e) => {
                const type = block.dataset.type;
                const selects = block.querySelectorAll('select');
                const params = {};
                
                selects.forEach(select => {
                    params[select.dataset.param] = select.value;
                });
                
                e.dataTransfer.setData('application/json', JSON.stringify({
                    type: type,
                    params: params
                }));
            });
        });

        this.codeArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';
        });

        this.codeArea.addEventListener('dragleave', (e) => {
            e.currentTarget.style.backgroundColor = '';
        });

        this.codeArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.currentTarget.style.backgroundColor = '';
            try {
                const data = JSON.parse(e.dataTransfer.getData('application/json'));
                this.addBlockToProgram(data.type, data.params);
            } catch (error) {
                console.error('Ошибка при добавлении блока:', error);
            }
        });
    }

    addBlockToProgram(type, params) {
        if (!this.codeArea) return;
        
        const placeholder = this.codeArea.querySelector('.code-placeholder');
        
        if (placeholder) {
            placeholder.remove();
        }

        const block = document.createElement('div');
        block.className = 'code-block';
        block.dataset.type = type;
        block.dataset.params = JSON.stringify(params);
        
        const content = document.createElement('div');
        content.className = 'condition-content';
        
        switch(type) {
            case 'if':
                content.innerHTML = `
                    если(цвет == 
                    <select class="condition-select" data-param="color">
                        <option value="красный" ${params.color === 'красный' ? 'selected' : ''}>красный</option>
                        <option value="синий" ${params.color === 'синий' ? 'selected' : ''}>синий</option>
                        <option value="зеленый" ${params.color === 'зеленый' ? 'selected' : ''}>зеленый</option>
                    </select>
                    )
                `;
                block.classList.add('condition');
                break;
                
            case 'elseif':
                content.innerHTML = `
                    иначе если(цвет == 
                    <select class="condition-select" data-param="color">
                        <option value="красный" ${params.color === 'красный' ? 'selected' : ''}>красный</option>
                        <option value="синий" ${params.color === 'синий' ? 'selected' : ''}>синий</option>
                        <option value="зеленый" ${params.color === 'зеленый' ? 'selected' : ''}>зеленый</option>
                    </select>
                    )
                `;
                block.classList.add('condition');
                break;
                
            case 'else':
                content.textContent = 'иначе';
                block.classList.add('condition');
                break;
                
            case 'send':
                content.innerHTML = `
                    отправить на 
                    <select class="condition-select" data-param="conveyor">
                        <option value="красный" ${params.conveyor === 'красный' ? 'selected' : ''}>красный</option>
                        <option value="синий" ${params.conveyor === 'синий' ? 'selected' : ''}>синий</option>
                        <option value="зеленый" ${params.conveyor === 'зеленый' ? 'selected' : ''}>зеленый</option>
                    </select>
                `;
                block.classList.add('action');
                break;
        }
        
        block.appendChild(content);
        
        // Добавляем обработчик обновления параметров
        const selects = block.querySelectorAll('select');
        selects.forEach(select => {
            select.addEventListener('change', () => {
                this.updateBlockParams(block);
            });
        });
        
        block.addEventListener('dblclick', () => {
            if (!this.isExecuting) {
                block.remove();
                this.programBlocks = this.programBlocks.filter(b => b.element !== block);
                this.updateProgramState();
            }
        });

        this.codeArea.appendChild(block);
        this.programBlocks.push({ 
            type, 
            params: params,
            element: block 
        });
        
        this.addConsoleMessage(`+ Блок: ${this.getBlockText(type, params)}`, 'system');
    }

    updateBlockParams(blockElement) {
        const type = blockElement.dataset.type;
        const selects = blockElement.querySelectorAll('select');
        const params = {};
        
        selects.forEach(select => {
            params[select.dataset.param] = select.value;
        });
        
        blockElement.dataset.params = JSON.stringify(params);
        
        const blockIndex = this.programBlocks.findIndex(b => b.element === blockElement);
        if (blockIndex !== -1) {
            this.programBlocks[blockIndex].params = params;
        }
    }

    async runProgram() {
        if (this.isExecuting) {
            this.addConsoleMessage('⚠️ Программа уже выполняется', 'warning');
            return;
        }
        
        if (this.programBlocks.length === 0) {
            this.addConsoleMessage('❌ Ошибка: программа пуста!', 'danger');
            return;
        }

        this.isExecuting = true;
        this.resetConveyors();
        this.loadPackagesToInput();
        this.addConsoleMessage('Запуск программы...', 'system');

        try {
            for (let i = 0; i < this.config.packages.length; i++) {
                if (!this.isExecuting) break;
                
                this.currentPackageIndex = i;
                const currentPackage = this.config.packages[i];
                
                this.addConsoleMessage(`=== Посылка ${currentPackage.id} (${currentPackage.color}) ===`, 'system');
                await this.animateRobotPickup(currentPackage);
                
                const result = await this.executeProgramForPackage(currentPackage);
                
                if (result) {
                    this.addConsoleMessage(`✅ Отправлена на ${result} конвейер`, 'success');
                } else {
                    this.addConsoleMessage(`❌ Не обработана`, 'danger');
                }
                
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            if (this.isExecuting) {
                await this.checkLevelCompletion();
            }
        } catch (error) {
            console.error('Ошибка выполнения программы:', error);
            this.addConsoleMessage('❌ Критическая ошибка выполнения программы!', 'danger');
        } finally {
            this.isExecuting = false;
        }
    }

    async executeProgramForPackage(pkg) {
        let conveyorColor = null;
        let conditionMet = false;
        let skipToNextCondition = false;
        
        for (let i = 0; i < this.programBlocks.length; i++) {
            const block = this.programBlocks[i];
            
            block.element.classList.add('executing');
            await new Promise(resolve => setTimeout(resolve, 150));
            
            switch(block.type) {
                case 'if':
                    if (!conditionMet && !skipToNextCondition) {
                        if (pkg.color === block.params.color) {
                            conditionMet = true;
                            this.addConsoleMessage(`✓ Условие "если" выполнено`, 'system');
                        } else {
                            skipToNextCondition = true;
                            this.addConsoleMessage(`✗ Условие "если" не выполнено`, 'system');
                        }
                    }
                    break;
                    
                case 'elseif':
                    if (!conditionMet && skipToNextCondition) {
                        if (pkg.color === block.params.color) {
                            conditionMet = true;
                            skipToNextCondition = false;
                            this.addConsoleMessage(`✓ Условие "иначе если" выполнено`, 'system');
                        } else {
                            this.addConsoleMessage(`✗ Условие "иначе если" не выполнено`, 'system');
                        }
                    }
                    break;
                    
                case 'else':
                    if (!conditionMet && skipToNextCondition) {
                        conditionMet = true;
                        skipToNextCondition = false;
                        this.addConsoleMessage(`✓ Выполняется блок "иначе"`, 'system');
                    }
                    break;
                    
                case 'send':
                    if (conditionMet && !conveyorColor) {
                        conveyorColor = block.params.conveyor;
                        this.addConsoleMessage(`➡️ Отправляем на ${conveyorColor} конвейер`, 'system');
                        await this.sendPackageToConveyor(pkg, conveyorColor);
                    }
                    break;
            }
            
            block.element.classList.remove('executing');
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (conveyorColor) break;
        }
        
        return conveyorColor;
    }

    async checkLevelCompletion() {
        let isComplete = true;
        let message = 'Результаты:\n';
        
        for (const color in this.config.requiredSorting) {
            const required = this.config.requiredSorting[color];
            const actual = this.sortedPackages[color].length;
            
            message += `${color}: ${actual}/${required}\n`;
            
            if (actual < required) {
                isComplete = false;
            }
        }
        
        this.addConsoleMessage(message, 'system');
        
        if (isComplete) {
            this.addConsoleMessage('🎉 Все посылки отсортированы! Уровень пройден!', 'success');
            setTimeout(() => {
                this.completeLevel();
            }, 1000);
        } else {
            this.addConsoleMessage('❌ Не все посылки отсортированы', 'danger');
        }
    }

    async completeLevel() {
        this.isExecuting = false;
        
        try {
            await updateProgress(this.config.id);
            this.addConsoleMessage('Прогресс сохранен', 'success');
        } catch (error) {
            console.error('Ошибка обновления прогресса:', error);
        }
        syncLocalProfileAfterLevel(this.config.id);
        
        setTimeout(() => {
            alert('🎊 Уровень пройден!\n\nВы освоили условные переменные!\nСистема сортировки работает корректно!');
            this.goToLevelMap();
        }, 500);
    }
}