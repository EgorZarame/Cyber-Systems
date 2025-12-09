// frontend/js/levels/Level2_3.js
class Level2_3 extends LevelBase2 {
    constructor() {
        super({
            id: '2.boss',
            title: 'Босс - Адаптивный глитч',
            sections: 3,
            packagesPerSection: 3,
            packages: [
                { id: 1, color: 'красный', section: 1, corrupted: false },
                { id: 2, color: 'синий', section: 1, corrupted: true },
                { id: 3, color: 'зеленый', section: 1, corrupted: false },
                { id: 4, color: 'красный', section: 2, corrupted: true },
                { id: 5, color: 'синий', section: 2, corrupted: false },
                { id: 6, color: 'зеленый', section: 2, corrupted: true },
                { id: 7, color: 'красный', section: 3, corrupted: false },
                { id: 8, color: 'синий', section: 3, corrupted: false },
                { id: 9, color: 'зеленый', section: 3, corrupted: true }
            ],
            sectionStates: [true, false, true],
            bossHealth: 100
        });
        
        this.programBlocks = [];
        this.currentSection = 1;
        this.activeLoopBody = null;
        this.glitchEffect = document.getElementById('glitchEffect');
    }

    getWelcomeMessage() {
        return '⚠️ ОБНАРУЖЕН АДАПТИВНЫЙ ГЛИТЧ\n⚡ Система нестабильна! Секции конвейеров повреждены\n🚨 Стабилизируйте систему до полного отказа!';
    }

    initialize() {
        super.initialize();
        this.startGlitchEffects();
        this.updateSectionVisuals();
        this.updateBossHealth();
    }

    startGlitchEffects() {
        setInterval(() => {
            if (this.glitchEffect && Math.random() < 0.3) {
                this.glitchEffect.style.opacity = '0.1';
                setTimeout(() => {
                    this.glitchEffect.style.opacity = '0';
                }, 100);
            }
        }, 2000);
    }

    updateSectionVisuals() {
        const conveyorSystem = document.getElementById('conveyorSystem');
        if (conveyorSystem) {
            conveyorSystem.classList.remove('glitch-active');
            this.config.sectionStates.forEach((state, index) => {
                if (!state) {
                    conveyorSystem.classList.add('glitch-active');
                }
            });
        }
    }

    updateBossHealth() {
        const healthBar = document.getElementById('bossHealth');
        const healthText = document.getElementById('healthText');
        const healthPercent = Math.max(0, this.config.bossHealth);
        
        if (healthBar) {
            healthBar.style.width = `${healthPercent}%`;
        }
        
        if (healthText) {
            healthText.textContent = `${healthPercent}%`;
            
            if (healthPercent <= 25) {
                healthText.style.color = '#ff0000';
            } else if (healthPercent <= 50) {
                healthText.style.color = '#ff8800';
            } else {
                healthText.style.color = '#ffffff';
            }
        }
    }

    initializeDragAndDrop() {
        const blocks = document.querySelectorAll('.code-block[draggable="true"]');
        
        blocks.forEach(block => {
            block.addEventListener('dragstart', (e) => {
                const type = block.dataset.type;
                const selects = block.querySelectorAll('select, input');
                const params = {};
                
                selects.forEach(select => {
                    if (select.tagName === 'SELECT') {
                        params[select.dataset.param] = select.value;
                    } else if (select.tagName === 'INPUT') {
                        const inputs = Array.from(block.querySelectorAll('input'));
                        const index = inputs.indexOf(select);
                        params[index === 0 ? 'loopStart' : 'loopEnd'] = select.value;
                    }
                });
                
                e.dataTransfer.setData('application/json', JSON.stringify({
                    type: type,
                    params: params
                }));
            });
        });

        this.codeArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.currentTarget.style.backgroundColor = 'rgba(156, 39, 176, 0.1)';
        });

        this.codeArea.addEventListener('dragleave', (e) => {
            e.currentTarget.style.backgroundColor = '';
        });

        this.codeArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.currentTarget.style.backgroundColor = '';
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            this.addBlockToProgram(data.type, data.params);
        });
    }

    addBlockToProgram(type, params) {
        const placeholder = this.codeArea.querySelector('.code-placeholder');
        
        if (placeholder) {
            placeholder.remove();
        }

        const block = document.createElement('div');
        block.className = 'code-block';
        block.dataset.type = type;
        block.dataset.params = JSON.stringify(params || {});
        
        const content = document.createElement('div');
        content.className = type === 'loop' ? 'loop-content' : 'condition-content';
        
        switch(type) {
            case 'loop':
                block.classList.add('loop');
                content.innerHTML = `
                    повторить(n=
                    <input type="number" class="loop-input" value="${params?.loopStart || 1}" min="1" max="9" onchange="level.updateBlockParams(this)">
                    ; n &lt; 
                    <input type="number" class="loop-input" value="${params?.loopEnd || 3}" min="2" max="9" onchange="level.updateBlockParams(this)">
                    ; n++)
                `;
                block.appendChild(content);
                
                const loopBody = document.createElement('div');
                loopBody.className = 'loop-body';
                loopBody.dataset.loopBody = 'true';
                block.appendChild(loopBody);
                
                const endLoopBtn = document.createElement('button');
                endLoopBtn.textContent = 'Закончить цикл';
                endLoopBtn.className = 'end-loop-btn';
                endLoopBtn.onclick = () => {
                    this.activeLoopBody = null;
                    endLoopBtn.style.display = 'none';
                    this.addConsoleMessage('✅ Тело цикла завершено', 'system');
                };
                block.appendChild(endLoopBtn);
                
                this.activeLoopBody = loopBody;
                break;
                
            case 'if':
                content.innerHTML = `
                    если(
                    <select class="condition-select" data-param="section" onchange="level.updateBlockParams(this)">
                        <option value="1" ${params?.section === '1' ? 'selected' : ''}>секция_1</option>
                        <option value="2" ${params?.section === '2' ? 'selected' : ''}>секция_2</option>
                        <option value="3" ${params?.section === '3' ? 'selected' : ''}>секция_3</option>
                    </select>
                    .заполнена != 
                    <select class="condition-select" data-param="state" onchange="level.updateBlockParams(this)">
                        <option value="true" ${params?.state === 'true' ? 'selected' : ''}>true</option>
                        <option value="false" ${params?.state === 'false' ? 'selected' : ''}>false</option>
                    </select>
                    )
                `;
                block.classList.add('condition', 'corrupted');
                block.appendChild(content);
                break;
                
            case 'ifcolor':
                content.innerHTML = `
                    если(посылка.цвет == 
                    <select class="condition-select" data-param="color" onchange="level.updateBlockParams(this)">
                        <option value="красный" ${params?.color === 'красный' ? 'selected' : ''}>красный</option>
                        <option value="синий" ${params?.color === 'синий' ? 'selected' : ''}>синий</option>
                        <option value="зеленый" ${params?.color === 'зеленый' ? 'selected' : ''}>зеленый</option>
                    </select>
                    )
                `;
                block.classList.add('condition');
                block.appendChild(content);
                break;
                
            case 'send':
                content.innerHTML = `
                    отправить_на_
                    <select class="condition-select" data-param="conveyor" onchange="level.updateBlockParams(this)">
                        <option value="красный" ${params?.conveyor === 'красный' ? 'selected' : ''}>красный</option>
                        <option value="синий" ${params?.conveyor === 'синий' ? 'selected' : ''}>синий</option>
                        <option value="зеленый" ${params?.conveyor === 'зеленый' ? 'selected' : ''}>зеленый</option>
                    </select>
                    _конвейер()
                `;
                block.classList.add('action');
                block.appendChild(content);
                break;
        }
        
        block.addEventListener('dblclick', () => {
            if (!this.isExecuting) {
                if (type === 'loop') {
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

        if (this.activeLoopBody && type !== 'loop') {
            this.activeLoopBody.appendChild(block);
        } else {
            this.codeArea.appendChild(block);
        }
        
        this.programBlocks.push({ type, params: params || {}, element: block });
        this.addConsoleMessage(`✅ Добавлен блок: ${this.getBlockText(type, params)}`, 'system');
    }

    updateBlockParams(selectElement) {
        const block = selectElement.closest('.code-block');
        const params = JSON.parse(block.dataset.params || '{}');
        
        if (selectElement.tagName === 'SELECT') {
            params[selectElement.dataset.param] = selectElement.value;
        } else if (selectElement.tagName === 'INPUT') {
            const inputs = Array.from(block.querySelectorAll('input'));
            const index = inputs.indexOf(selectElement);
            params[index === 0 ? 'loopStart' : 'loopEnd'] = selectElement.value;
        }
        
        block.dataset.params = JSON.stringify(params);
        
        const blockIndex = this.programBlocks.findIndex(b => b.element === block);
        if (blockIndex !== -1) {
            this.programBlocks[blockIndex].params = params;
        }
    }

    getBlockText(type, params) {
        switch(type) {
            case 'loop':
                return `повторить(n=${params?.loopStart || 1}; n < ${params?.loopEnd || 3}; n++)`;
            case 'if':
                return `если(секция_${params?.section || 1}.заполнена != ${params?.state || 'false'})`;
            case 'ifcolor':
                return `если(посылка.цвет == ${params?.color || 'красный'})`;
            case 'send':
                return `отправить_на_${params?.conveyor || 'красный'}_конвейер()`;
            default:
                return 'НЕИЗВЕСТНЫЙ_БЛОК';
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
        this.addConsoleMessage('⚡ Запуск процедуры стабилизации...', 'system');

        try {
            for (let section = 1; section <= this.config.sections; section++) {
                if (!this.isExecuting) break;
                
                this.currentSection = section;
                this.addConsoleMessage(`🔧 Обработка секции ${section}...`, 'system');
                
                const sectionPackages = this.config.packages.filter(pkg => pkg.section === section);
                
                for (const pkg of sectionPackages) {
                    if (!this.isExecuting) break;
                    
                    this.addConsoleMessage(`📦 Обработка посылки ${pkg.id} (${pkg.color})`, 'system');
                    
                    await this.animateRobotPickup(pkg);
                    
                    const result = await this.executeProgramForPackage(pkg, section);
                    
                    if (result) {
                        this.addConsoleMessage(`✅ Посылка ${pkg.id} отправлена на ${result} конвейер`, 'success');
                        if (!pkg.corrupted) {
                            this.config.bossHealth = Math.max(0, this.config.bossHealth - 5);
                            this.updateBossHealth();
                        }
                    } else {
                        this.addConsoleMessage(`❌ Посылка ${pkg.id} не была отсортирована`, 'danger');
                        await this.bossAttack();
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    if (this.config.bossHealth <= 0) {
                        await this.defeatBoss();
                        break;
                    }
                }
                
                if (this.config.bossHealth <= 0) break;
            }
            
            if (this.isExecuting) {
                await this.checkLevelCompletion();
            }
        } catch (error) {
            console.error('❌ Ошибка выполнения программы:', error);
            this.addConsoleMessage('❌ Критическая ошибка выполнения программы!', 'danger');
        } finally {
            this.isExecuting = false;
        }
    }

    async executeProgramForPackage(pkg, section) {
        let foundAction = false;
        let conveyorColor = null;
        
        const executeBlocks = async (blocks) => {
            for (let i = 0; i < blocks.length; i++) {
                if (!this.isExecuting) break;
                
                const block = blocks[i];
                const params = block.params || {};
                
                block.element.classList.add('executing');
                
                switch(block.type) {
                    case 'loop':
                        const loopStart = parseInt(params.loopStart) || 1;
                        const loopEnd = parseInt(params.loopEnd) || 3;
                        const loopBody = block.element.querySelector('.loop-body');
                        const bodyBlocks = this.getBlocksInLoopBody(loopBody);
                        
                        this.addConsoleMessage(`🔄 Цикл: ${loopStart} → ${loopEnd-1}`, 'system');
                        
                        for (let n = loopStart; n < loopEnd; n++) {
                            if (!this.isExecuting) break;
                            this.addConsoleMessage(`🔂 Итерация ${n}`, 'system');
                            await executeBlocks(bodyBlocks);
                            if (conveyorColor) return;
                        }
                        break;
                        
                    case 'if':
                        if (!foundAction) {
                            const targetSection = parseInt(params.section) || 1;
                            const expectedState = params.state === 'true';
                            const actualState = this.config.sectionStates[targetSection - 1];
                            
                            if (targetSection === section && actualState !== expectedState) {
                                foundAction = true;
                                this.addConsoleMessage(`✓ Условие: секция_${section}.заполнена != ${expectedState}`, 'system');
                            }
                        }
                        break;
                        
                    case 'ifcolor':
                        if (!foundAction && pkg.color === params.color) {
                            foundAction = true;
                            this.addConsoleMessage(`✓ Условие: посылка.цвет == ${params.color}`, 'system');
                        }
                        break;
                        
                    case 'send':
                        if (foundAction && !conveyorColor) {
                            conveyorColor = params.conveyor;
                            await this.sendPackageToConveyor(pkg, conveyorColor);
                        }
                        break;
                }
                
                await new Promise(resolve => setTimeout(resolve, 300));
                block.element.classList.remove('executing');
                
                if (conveyorColor) break;
            }
        };
        
        await executeBlocks(this.programBlocks);
        return conveyorColor;
    }

    getBlocksInLoopBody(loopBody) {
        const blocks = [];
        if (!loopBody) return blocks;
        
        const childBlocks = loopBody.querySelectorAll('.code-block');
        
        childBlocks.forEach(child => {
            const blockIndex = this.programBlocks.findIndex(b => b.element === child);
            if (blockIndex !== -1) {
                blocks.push(this.programBlocks[blockIndex]);
            }
        });
        
        return blocks;
    }

    async bossAttack() {
        this.addConsoleMessage('⚡ Глитч-атака! Система нестабильна!', 'danger');
        
        if (this.glitchEffect) {
            this.glitchEffect.style.opacity = '0.2';
        }
        
        const randomSection = Math.floor(Math.random() * this.config.sections) + 1;
        this.config.sectionStates[randomSection - 1] = !this.config.sectionStates[randomSection - 1];
        
        this.addConsoleMessage(`🔧 Секция ${randomSection} ${this.config.sectionStates[randomSection - 1] ? 'восстановлена' : 'повреждена'}!`, 'warning');
        this.updateSectionVisuals();
        
        await new Promise(resolve => setTimeout(resolve, 800));
        if (this.glitchEffect) {
            this.glitchEffect.style.opacity = '0';
        }
    }

    async defeatBoss() {
        this.addConsoleMessage('🎉 АДАПТИВНЫЙ ГЛИТЧ ПОБЕЖДЁН!', 'success');
        this.addConsoleMessage('✅ СИСТЕМА СТАБИЛИЗИРОВАНА!', 'success');
        
        this.isExecuting = false;
        
        const conveyorSystem = document.getElementById('conveyorSystem');
        if (conveyorSystem) {
            conveyorSystem.classList.remove('glitch-active');
        }
        
        setTimeout(() => {
            this.completeLevel();
        }, 1500);
    }

    async checkLevelCompletion() {
        const sortedCount = Object.values(this.sortedPackages).reduce((sum, arr) => sum + arr.length, 0);
        const totalPackages = this.config.packages.length;
        
        this.addConsoleMessage(`📊 Результаты: ${sortedCount}/${totalPackages} посылок отсортировано`, 'system');
        
        if (sortedCount >= totalPackages * 0.8) {
            this.addConsoleMessage('🎉 Большинство посылок отсортировано!', 'success');
            setTimeout(() => {
                this.completeLevel();
            }, 1000);
        } else {
            this.addConsoleMessage('❌ Недостаточно посылок отсортировано для стабилизации', 'danger');
        }
    }

    async completeLevel() {
        this.isExecuting = false;
        
        try {
            await updateProgress(this.config.id);
        } catch (error) {
            console.error('Ошибка обновления прогресса:', error);
        }
        syncLocalProfileAfterLevel(this.config.id);
        
        alert('🎊 ПОБЕДА!\n\nВы победили Адаптивный глитч!\nСистема сортировки стабилизирована!\n\nПовышение до Разработчика!');
        this.goToLevelMap();
    }
}