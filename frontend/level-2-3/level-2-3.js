// Конфигурация уровня 2.3 - Адаптивный глитч
const levelConfig = {
    id: '2.3',
    title: 'Босс - Адаптивный глитч',
    sections: 3,
    packagesPerSection: 3,
    packages: [
        // Секция 1
        { id: 1, color: 'красный', section: 1, corrupted: false },
        { id: 2, color: 'синий', section: 1, corrupted: true },
        { id: 3, color: 'зеленый', section: 1, corrupted: false },
        // Секция 2
        { id: 4, color: 'красный', section: 2, corrupted: true },
        { id: 5, color: 'синий', section: 2, corrupted: false },
        { id: 6, color: 'зеленый', section: 2, corrupted: true },
        // Секция 3
        { id: 7, color: 'красный', section: 3, corrupted: false },
        { id: 8, color: 'синий', section: 3, corrupted: false },
        { id: 9, color: 'зеленый', section: 3, corrupted: true }
    ],
    sectionStates: [true, false, true],
    bossHealth: 100,
    maxBlocks: 999 // Отключили ограничение блоков
};

let programBlocks = [];
let isExecuting = false;
let currentPackageIndex = 0;
let currentSection = 1;
let sortedPackages = {
    'красный': [],
    'синий': [],
    'зеленый': []
};
let availableBlocks = 999; // Много блоков
let activeLoopBody = null;

// Инициализация уровня
function initializeLevel() {
    console.log('🚀 Инициализация уровня 2.3...');
    
    try {
        initializeConveyors();
        initializeDragAndDrop();
        updateBossHealth();
        startGlitchEffects();
        addConsoleMessage('🟢 Система инициализирована в аварийном режиме', 'system');
        addConsoleMessage('💡 Используйте циклы и условия для обработки секций', 'system');
        
        console.log('✅ Уровень инициализирован успешно');
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        addConsoleMessage('❌ Ошибка инициализации системы', 'danger');
    }
}

// Запуск глитч-эффектов
function startGlitchEffects() {
    setInterval(() => {
        const glitch = document.getElementById('glitchEffect');
        if (glitch && Math.random() < 0.3) {
            glitch.style.opacity = '0.1';
            setTimeout(() => {
                glitch.style.opacity = '0';
            }, 100);
        }
    }, 2000);
}

// Инициализация конвейеров
function initializeConveyors() {
    resetConveyors();
    loadPackagesToInput();
    updateSectionVisuals();
}

// Сброс конвейеров
function resetConveyors() {
    ['inputConveyor', 'redConveyor', 'blueConveyor', 'greenConveyor'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.innerHTML = '';
    });
    
    sortedPackages = {
        'красный': [],
        'синий': [],
        'зеленый': []
    };
    currentPackageIndex = 0;
    currentSection = 1;
    availableBlocks = 999;
    updateBlocksCounter();
}

// Загрузка посылок на входной конвейер
function loadPackagesToInput() {
    const inputConveyor = document.getElementById('inputConveyor');
    if (!inputConveyor) {
        console.error('❌ inputConveyor не найден');
        return;
    }
    
    inputConveyor.innerHTML = '';
    
    levelConfig.packages.forEach(pkg => {
        const packageElement = document.createElement('div');
        packageElement.className = `package ${pkg.color} ${pkg.corrupted ? 'corrupted' : ''}`;
        packageElement.textContent = pkg.id;
        packageElement.title = `Посылка ${pkg.id} (${pkg.color}) ${pkg.corrupted ? '[ПОВРЕЖДЕНА]' : ''}`;
        packageElement.dataset.id = pkg.id;
        packageElement.dataset.color = pkg.color;
        packageElement.dataset.section = pkg.section;
        packageElement.dataset.corrupted = pkg.corrupted;
        inputConveyor.appendChild(packageElement);
    });
}

// Обновление визуализации секций
function updateSectionVisuals() {
    const conveyorSystem = document.getElementById('conveyorSystem');
    if (conveyorSystem) {
        conveyorSystem.classList.remove('glitch-active');
        levelConfig.sectionStates.forEach((state, index) => {
            if (!state) {
                conveyorSystem.classList.add('glitch-active');
            }
        });
    }
}

// Drag and Drop - УПРОЩЕННАЯ ВЕРСИЯ
function initializeDragAndDrop() {
    const blocks = document.querySelectorAll('.code-block[draggable="true"]');
    const codeArea = document.getElementById('codeArea');

    if (!codeArea) {
        console.error('❌ codeArea не найден');
        return;
    }

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

    codeArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = 'rgba(156, 39, 176, 0.1)';
    });

    codeArea.addEventListener('dragleave', (e) => {
        e.currentTarget.style.backgroundColor = '';
    });

    codeArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = '';
        
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            addBlockToProgram(data.type, data.params);
        } catch (error) {
            console.error('❌ Ошибка при добавлении блока:', error);
        }
    });
}

// Добавление блока в программу - ФИКСИРОВАННАЯ ВЕРСИЯ
function addBlockToProgram(type, params) {
    const codeArea = document.getElementById('codeArea');
    const placeholder = codeArea.querySelector('.code-placeholder');
    
    if (placeholder) {
        placeholder.remove();
    }

    const block = document.createElement('div');
    block.className = 'code-block';
    block.dataset.type = type;
    block.dataset.params = JSON.stringify(params || {});
    
    // Создаем содержимое блока
    const content = document.createElement('div');
    content.className = type === 'loop' ? 'loop-content' : 'condition-content';
    
    switch(type) {
        case 'loop':
            block.classList.add('loop');
            content.innerHTML = `
                повторить(n=
                <input type="number" class="loop-input" value="${params?.loopStart || 1}" min="1" max="9" onchange="updateBlockParams(this)">
                ; n &lt; 
                <input type="number" class="loop-input" value="${params?.loopEnd || 3}" min="2" max="9" onchange="updateBlockParams(this)">
                ; n++)
            `;
            block.appendChild(content);
            
            // ТЕЛО ЦИКЛА
            const loopBody = document.createElement('div');
            loopBody.className = 'loop-body';
            loopBody.dataset.loopBody = 'true';
            block.appendChild(loopBody);
            
            // КНОПКА ЗАВЕРШЕНИЯ ЦИКЛА
            const endLoopBtn = document.createElement('button');
            endLoopBtn.textContent = 'Закончить цикл';
            endLoopBtn.className = 'end-loop-btn';
            endLoopBtn.onclick = function() {
                activeLoopBody = null;
                this.style.display = 'none';
                addConsoleMessage('✅ Тело цикла завершено', 'system');
            };
            block.appendChild(endLoopBtn);
            
            // Делаем этот цикл активным
            activeLoopBody = loopBody;
            break;
            
        case 'if':
            content.innerHTML = `
                если(
                <select class="condition-select" data-param="section" onchange="updateBlockParams(this)">
                    <option value="1" ${params?.section === '1' ? 'selected' : ''}>секция_1</option>
                    <option value="2" ${params?.section === '2' ? 'selected' : ''}>секция_2</option>
                    <option value="3" ${params?.section === '3' ? 'selected' : ''}>секция_3</option>
                </select>
                .заполнена != 
                <select class="condition-select" data-param="state" onchange="updateBlockParams(this)">
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
                <select class="condition-select" data-param="color" onchange="updateBlockParams(this)">
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
                <select class="condition-select" data-param="conveyor" onchange="updateBlockParams(this)">
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
    
    // Удаление блока по двойному клику
    block.addEventListener('dblclick', () => {
        if (!isExecuting) {
            // Если это цикл, удаляем все его внутренние блоки из programBlocks
            if (type === 'loop') {
                const loopBody = block.querySelector('.loop-body');
                if (loopBody) {
                    const childBlocks = loopBody.querySelectorAll('.code-block');
                    childBlocks.forEach(child => {
                        programBlocks = programBlocks.filter(b => b.element !== child);
                    });
                }
            }
            
            block.remove();
            programBlocks = programBlocks.filter(b => b.element !== block);
            updateProgramState();
            addConsoleMessage('🗑️ Блок удален', 'system');
        }
    });

    // ЛОГИКА РАЗМЕЩЕНИЯ БЛОКА
    if (activeLoopBody && type !== 'loop') {
        // Добавляем в активное тело цикла
        activeLoopBody.appendChild(block);
    } else {
        // Добавляем в основную область
        codeArea.appendChild(block);
    }
    
    // Сохраняем блок
    programBlocks.push({ type, params: params || {}, element: block });
    
    addConsoleMessage(`✅ Добавлен блок: ${getBlockText(type, params)}`, 'system');
    
    return block;
}

// Обновление счетчика блоков
function updateBlocksCounter() {
    const placeholder = document.querySelector('.code-placeholder');
    if (placeholder) {
        placeholder.textContent = `Блоков в программе: ${programBlocks.length}`;
    }
}

// Обновление параметров блока
function updateBlockParams(selectElement) {
    const block = selectElement.closest('.code-block');
    if (!block) return;
    
    const params = JSON.parse(block.dataset.params || '{}');
    
    if (selectElement.tagName === 'SELECT') {
        params[selectElement.dataset.param] = selectElement.value;
    } else if (selectElement.tagName === 'INPUT') {
        const inputs = Array.from(block.querySelectorAll('input'));
        const index = inputs.indexOf(selectElement);
        params[index === 0 ? 'loopStart' : 'loopEnd'] = selectElement.value;
    }
    
    block.dataset.params = JSON.stringify(params);
    
    // Обновляем запись в programBlocks
    const blockIndex = programBlocks.findIndex(b => b.element === block);
    if (blockIndex !== -1) {
        programBlocks[blockIndex].params = params;
    }
}

function getBlockText(type, params) {
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

// Выполнение программы
async function executeProgramForPackage(pkg, section) {
    let foundAction = false;
    let conveyorColor = null;
    
    // Вложенная функция для выполнения блоков
    async function executeBlocks(blocks) {
        for (let i = 0; i < blocks.length; i++) {
            if (!isExecuting) break;
            
            const block = blocks[i];
            const params = block.params || {};
            
            // Подсветка выполняемого блока
            block.element.classList.add('executing');
            
            switch(block.type) {
                case 'loop':
                    const loopStart = parseInt(params.loopStart) || 1;
                    const loopEnd = parseInt(params.loopEnd) || 3;
                    const loopBody = block.element.querySelector('.loop-body');
                    const bodyBlocks = getBlocksInLoopBody(loopBody);
                    
                    addConsoleMessage(`🔄 Цикл: ${loopStart} → ${loopEnd-1}`, 'system');
                    
                    for (let n = loopStart; n < loopEnd; n++) {
                        if (!isExecuting) break;
                        addConsoleMessage(`🔂 Итерация ${n}`, 'system');
                        await executeBlocks(bodyBlocks);
                        if (conveyorColor) return;
                    }
                    break;
                    
                case 'if':
                    if (!foundAction) {
                        const targetSection = parseInt(params.section) || 1;
                        const expectedState = params.state === 'true';
                        const actualState = levelConfig.sectionStates[targetSection - 1];
                        
                        if (targetSection === section && actualState !== expectedState) {
                            foundAction = true;
                            addConsoleMessage(`✓ Условие: секция_${section}.заполнена != ${expectedState}`, 'system');
                        }
                    }
                    break;
                    
                case 'ifcolor':
                    if (!foundAction && pkg.color === params.color) {
                        foundAction = true;
                        addConsoleMessage(`✓ Условие: посылка.цвет == ${params.color}`, 'system');
                    }
                    break;
                    
                case 'send':
                    if (foundAction && !conveyorColor) {
                        conveyorColor = params.conveyor;
                        await sendPackageToConveyor(pkg, conveyorColor);
                    }
                    break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
            block.element.classList.remove('executing');
            
            if (conveyorColor) break;
        }
    }
    
    await executeBlocks(programBlocks);
    return conveyorColor;
}

// Получение блоков в теле цикла
function getBlocksInLoopBody(loopBody) {
    const blocks = [];
    if (!loopBody) return blocks;
    
    const childBlocks = loopBody.querySelectorAll('.code-block');
    
    childBlocks.forEach(child => {
        const blockIndex = programBlocks.findIndex(b => b.element === child);
        if (blockIndex !== -1) {
            blocks.push(programBlocks[blockIndex]);
        }
    });
    
    return blocks;
}

// Анимация взятия посылки роботом
async function animateRobotPickup(pkg) {
    const robotArm = document.getElementById('robotArm');
    const packageElement = document.querySelector(`[data-id="${pkg.id}"]`);
    
    if (!robotArm) return;
    
    if (packageElement) {
        packageElement.remove();
    }
    
    robotArm.classList.add('executing');
    robotArm.textContent = pkg.corrupted ? `💀${pkg.id}` : `📦${pkg.id}`;
    
    await new Promise(resolve => setTimeout(resolve, 400));
}

// Отправка посылки на конвейер - ИСПРАВЛЕННАЯ ВЕРСИЯ
async function sendPackageToConveyor(pkg, conveyorColor) {
    // Преобразуем русское название цвета в английское для ID
    const colorMap = {
        'красный': 'red',
        'синий': 'blue', 
        'зеленый': 'green'
    };
    
    const englishColor = colorMap[conveyorColor] || conveyorColor;
    const conveyorId = `${englishColor}Conveyor`;
    const conveyor = document.getElementById(conveyorId);
    const robotArm = document.getElementById('robotArm');
    
    if (!conveyor) {
        console.error(`❌ Конвейер "${conveyorId}" не найден!`, {
            requestedColor: conveyorColor,
            englishColor: englishColor,
            conveyorId: conveyorId,
            elementExists: !!document.getElementById(conveyorId)
        });
        return;
    }
    
    if (!robotArm) {
        console.error('❌ Робот не найден!');
        return;
    }
    
    // Анимация отправки
    robotArm.textContent = `➡️${conveyorColor.charAt(0)}`;
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
        // Создаем элемент посылки на целевом конвейере
        const packageElement = document.createElement('div');
        packageElement.className = `package ${englishColor} ${pkg.corrupted ? 'corrupted' : ''}`;
        packageElement.textContent = pkg.id;
        packageElement.title = `Посылка ${pkg.id} (${pkg.color}) ${pkg.corrupted ? '[ПОВРЕЖДЕНА]' : ''}`;
        packageElement.dataset.id = pkg.id;
        packageElement.dataset.color = pkg.color;
        packageElement.dataset.section = pkg.section;
        packageElement.dataset.corrupted = pkg.corrupted;
        
        conveyor.appendChild(packageElement);
        
        // Добавляем в отсортированные
        sortedPackages[conveyorColor].push(pkg);
        
        console.log(`✅ Посылка ${pkg.id} (${pkg.color}) → ${conveyorId}`);
        
    } catch (error) {
        console.error('❌ Ошибка при добавлении посылки на конвейер:', error);
    }
    
    // Сбрасываем робота
    robotArm.textContent = '🤖';
    robotArm.classList.remove('executing');
}

// Обновление здоровья босса
function updateBossHealth() {
    const healthBar = document.getElementById('bossHealth');
    const healthText = document.getElementById('healthText');
    const healthPercent = Math.max(0, levelConfig.bossHealth);
    
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

// Победа над боссом
async function defeatBoss() {
    addConsoleMessage('🎉 АДАПТИВНЫЙ ГЛИТЧ ПОБЕЖДЁН!', 'success');
    addConsoleMessage('✅ СИСТЕМА СТАБИЛИЗИРОВАНА!', 'success');
    
    isExecuting = false;
    
    const conveyorSystem = document.getElementById('conveyorSystem');
    if (conveyorSystem) {
        conveyorSystem.classList.remove('glitch-active');
    }
    
    setTimeout(() => {
        completeLevel();
    }, 1500);
}

// Проверка завершения уровня
async function checkLevelCompletion() {
    const sortedCount = Object.values(sortedPackages).reduce((sum, arr) => sum + arr.length, 0);
    const totalPackages = levelConfig.packages.length;
    
    addConsoleMessage(`📊 Результаты: ${sortedCount}/${totalPackages} посылок отсортировано`, 'system');
    
    if (sortedCount >= totalPackages * 0.8) {
        addConsoleMessage('🎉 Большинство посылок отсортировано!', 'success');
        setTimeout(() => {
            completeLevel();
        }, 1000);
    } else {
        addConsoleMessage('❌ Недостаточно посылок отсортировано для стабилизации', 'danger');
    }
}

// Запуск программы
async function runProgram() {
    if (isExecuting) {
        addConsoleMessage('⚠️ Программа уже выполняется', 'warning');
        return;
    }
    
    if (programBlocks.length === 0) {
        addConsoleMessage('❌ Ошибка: программа пуста!', 'danger');
        return;
    }

    isExecuting = true;
    resetConveyors();
    loadPackagesToInput();
    addConsoleMessage('⚡ Запуск процедуры стабилизации...', 'system');

    try {
        for (let section = 1; section <= levelConfig.sections; section++) {
            if (!isExecuting) break;
            
            currentSection = section;
            addConsoleMessage(`🔧 Обработка секции ${section}...`, 'system');
            
            const sectionPackages = levelConfig.packages.filter(pkg => pkg.section === section);
            
            for (const pkg of sectionPackages) {
                if (!isExecuting) break;
                
                addConsoleMessage(`📦 Обработка посылки ${pkg.id} (${pkg.color})`, 'system');
                
                await animateRobotPickup(pkg);
                
                const result = await executeProgramForPackage(pkg, section);
                
                if (result) {
                    addConsoleMessage(`✅ Посылка ${pkg.id} отправлена на ${result} конвейер`, 'success');
                    if (!pkg.corrupted) {
                        levelConfig.bossHealth = Math.max(0, levelConfig.bossHealth - 5);
                        updateBossHealth();
                    }
                } else {
                    addConsoleMessage(`❌ Посылка ${pkg.id} не была отсортирована`, 'danger');
                    await bossAttack();
                }
                
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            if (levelConfig.bossHealth <= 0) {
                await defeatBoss();
                break;
            }
        }
        
        if (isExecuting) {
            await checkLevelCompletion();
        }
    } catch (error) {
        console.error('❌ Ошибка выполнения программы:', error);
        addConsoleMessage('❌ Критическая ошибка выполнения программы!', 'danger');
    } finally {
        isExecuting = false;
    }
}

// Атака босса
async function bossAttack() {
    addConsoleMessage('⚡ Глитч-атака! Система нестабильна!', 'danger');
    
    const glitch = document.getElementById('glitchEffect');
    if (glitch) {
        glitch.style.opacity = '0.2';
    }
    
    const randomSection = Math.floor(Math.random() * levelConfig.sections) + 1;
    levelConfig.sectionStates[randomSection - 1] = !levelConfig.sectionStates[randomSection - 1];
    
    addConsoleMessage(`🔧 Секция ${randomSection} ${levelConfig.sectionStates[randomSection - 1] ? 'восстановлена' : 'повреждена'}!`, 'warning');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    if (glitch) {
        glitch.style.opacity = '0';
    }
}

// Сброс программы
function resetProgram() {
    if (isExecuting) {
        isExecuting = false;
        addConsoleMessage('⚠️ Процедура прервана', 'warning');
    }
    
    const codeArea = document.getElementById('codeArea');
    if (codeArea) {
        codeArea.innerHTML = '';
    }
    programBlocks = [];
    activeLoopBody = null;
    updateProgramState();
    resetConveyors();
    levelConfig.bossHealth = 100;
    updateBossHealth();
    addConsoleMessage('🔄 Система сброшена', 'system');
}

// Обновление состояния программы
function updateProgramState() {
    const codeArea = document.getElementById('codeArea');
    if (!codeArea) return;
    
    if (programBlocks.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'code-placeholder';
        placeholder.textContent = 'Перетащите блоки сюда';
        codeArea.appendChild(placeholder);
    }
}

// Добавление сообщения в консоль
function addConsoleMessage(message, type = 'system') {
    const consoleOutput = document.getElementById('consoleOutput');
    if (!consoleOutput) {
        console.error('❌ consoleOutput не найден');
        return;
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `console-line log-${type}`;
    messageElement.textContent = message;
    
    consoleOutput.appendChild(messageElement);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Завершение уровня
function completeLevel() {
    try {
        localStorage.setItem('cyberSystemsProgress', JSON.stringify({
            currentLevel: '2.boss',
            lastCompleted: '2.boss'
        }));
    } catch (e) {
        console.log('⚠️ Не удалось сохранить прогресс');
    }
    
    alert('🎊 ПОБЕДА!\n\nВы победили Адаптивный глитч!\nСистема сортировки стабилизирована!\n\nПовышение до Разработчика!');
    goToLevelMap();
}

// Навигация
function goBack() {
    window.location.href = '../level-map/index.html';
}

function showHelp() {
    alert('Помощь по уровню Босс 2.3:\n\n' +
          '1. Добавьте цикл "повторить(n=1; n<4; n++)"\n' +
          '2. Добавьте блоки ВНУТРЬ цикла (они появятся с отступом)\n' +
          '3. Нажмите "Закончить цикл" под блоком цикла\n' +
          '4. Программа обработает все 3 секции автоматически\n\n' +
          'Пример программы:\n' +
          'повторить(n=1; n<4; n++)\n' +
          '  если(секция_1.заполнена != true)\n' +
          '  если(посылка.цвет == красный)\n' +
          '  отправить_на_красный_конвейер()\n' +
          '  если(посылка.цвет == синий)\n' +
          '  отправить_на_синий_конвейер()\n' +
          '  если(посылка.цвет == зеленый)\n' +
          '  отправить_на_зеленый_конвейер()');
}

function goToLevelMap() {
    window.location.href = '../level-map/index.html';
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initializeLevel);