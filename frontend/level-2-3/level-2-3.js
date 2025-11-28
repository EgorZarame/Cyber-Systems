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
    sectionStates: [true, false, true], // true = заполнена, false = не заполнена
    bossHealth: 100,
    maxBlocks: 4 // Максимальное количество блоков для одной секции
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
let availableBlocks = levelConfig.maxBlocks;

// Инициализация уровня
function initializeLevel() {
    initializeConveyors();
    initializeDragAndDrop();
    updateBossHealth();
    startGlitchEffects();
    addConsoleMessage('🟢 Система инициализирована в аварийном режиме', 'system');
    addConsoleMessage('💡 Используйте циклы и условия для обработки секций', 'system');
    addConsoleMessage(`🚨 Доступно блоков: ${availableBlocks} (хватит на одну секцию)`, 'warning');
}

// Запуск глитч-эффектов
function startGlitchEffects() {
    setInterval(() => {
        const glitch = document.getElementById('glitchEffect');
        if (Math.random() < 0.3) {
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
    document.getElementById('inputConveyor').innerHTML = '';
    document.getElementById('redConveyor').innerHTML = '';
    document.getElementById('blueConveyor').innerHTML = '';
    document.getElementById('greenConveyor').innerHTML = '';
    
    sortedPackages = {
        'красный': [],
        'синий': [],
        'зеленый': []
    };
    currentPackageIndex = 0;
    currentSection = 1;
    availableBlocks = levelConfig.maxBlocks;
    updateBlocksCounter();
}

// Загрузка посылок на входной конвейер
function loadPackagesToInput() {
    const inputConveyor = document.getElementById('inputConveyor');
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
    levelConfig.sectionStates.forEach((state, index) => {
        if (!state) {
            conveyorSystem.classList.add('glitch-active');
        }
    });
}

// Drag and Drop с ограничением блоков
function initializeDragAndDrop() {
    const blocks = document.querySelectorAll('.code-block[draggable="true"]');
    const codeArea = document.getElementById('codeArea');

    blocks.forEach(block => {
        block.addEventListener('dragstart', (e) => {
            if (availableBlocks <= 0) {
                e.preventDefault();
                addConsoleMessage('❌ Превышено максимальное количество блоков!', 'danger');
                return;
            }

            const type = block.dataset.type;
            const selects = block.querySelectorAll('select, input');
            const params = {};
            
            selects.forEach(select => {
                if (select.tagName === 'SELECT') {
                    params[select.dataset.param] = select.value;
                } else if (select.tagName === 'INPUT') {
                    params[select.value.includes('n &lt;') ? 'loopEnd' : 'loopStart'] = select.value;
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
    });

    codeArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (availableBlocks <= 0) {
            addConsoleMessage('❌ Превышено максимальное количество блоков!', 'danger');
            return;
        }
        
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        addBlockToProgram(data.type, data.params);
    });
}

// Добавление блока в программу
function addBlockToProgram(type, params) {
    if (availableBlocks <= 0) {
        addConsoleMessage('❌ Достигнут лимит блоков! Удалите некоторые блоки.', 'danger');
        return;
    }

    const codeArea = document.getElementById('codeArea');
    const placeholder = codeArea.querySelector('.code-placeholder');
    
    if (placeholder) {
        placeholder.remove();
    }

    const block = document.createElement('div');
    block.className = 'code-block';
    block.dataset.type = type;
    block.dataset.params = JSON.stringify(params);
    
    // Создаем содержимое блока
    const content = document.createElement('div');
    content.className = type === 'loop' ? 'loop-content' : 'condition-content';
    
    switch(type) {
        case 'loop':
            content.innerHTML = `
                повторить(n=
                <input type="number" class="loop-input" value="${params.loopStart || 1}" min="1" max="3" onchange="updateBlockParams(this)">
                ; n &lt; 
                <input type="number" class="loop-input" value="${params.loopEnd || 3}" min="1" max="3" onchange="updateBlockParams(this)">
                ; n++)
            `;
            block.classList.add('loop');
            break;
            
        case 'if':
            content.innerHTML = `
                если(
                <select class="condition-select" data-param="section" onchange="updateBlockParams(this)">
                    <option value="1" ${params.section === '1' ? 'selected' : ''}>секция_1</option>
                    <option value="2" ${params.section === '2' ? 'selected' : ''}>секция_2</option>
                    <option value="3" ${params.section === '3' ? 'selected' : ''}>секция_3</option>
                </select>
                .заполнена != 
                <select class="condition-select" data-param="state" onchange="updateBlockParams(this)">
                    <option value="true" ${params.state === 'true' ? 'selected' : ''}>true</option>
                    <option value="false" ${params.state === 'false' ? 'selected' : ''}>false</option>
                </select>
                )
            `;
            block.classList.add('condition', 'corrupted');
            break;
            
        case 'ifcolor':
            content.innerHTML = `
                если(посылка.цвет == 
                <select class="condition-select" data-param="color" onchange="updateBlockParams(this)">
                    <option value="красный" ${params.color === 'красный' ? 'selected' : ''}>красный</option>
                    <option value="синий" ${params.color === 'синий' ? 'selected' : ''}>синий</option>
                    <option value="зеленый" ${params.color === 'зеленый' ? 'selected' : ''}>зеленый</option>
                </select>
                )
            `;
            block.classList.add('condition');
            break;
            
        case 'send':
            content.innerHTML = `
                отправить_на_
                <select class="condition-select" data-param="conveyor" onchange="updateBlockParams(this)">
                    <option value="красный" ${params.conveyor === 'красный' ? 'selected' : ''}>красный</option>
                    <option value="синий" ${params.conveyor === 'синий' ? 'selected' : ''}>синий</option>
                    <option value="зеленый" ${params.conveyor === 'зеленый' ? 'selected' : ''}>зеленый</option>
                </select>
                _конвейер()
            `;
            block.classList.add('action');
            break;
    }
    
    block.appendChild(content);
    
    block.addEventListener('dblclick', () => {
        if (!isExecuting) {
            block.remove();
            programBlocks = programBlocks.filter(b => b.element !== block);
            availableBlocks++;
            updateBlocksCounter();
            updateProgramState();
        }
    });

    codeArea.appendChild(block);
    programBlocks.push({ type, params, element: block });
    availableBlocks--;
    updateBlocksCounter();
    
    addConsoleMessage(`✅ Добавлен блок: ${getBlockText(type, params)}`, 'system');
    addConsoleMessage(`🚨 Осталось блоков: ${availableBlocks}`, 'warning');
}

// Обновление счетчика блоков
function updateBlocksCounter() {
    const placeholder = document.querySelector('.code-placeholder');
    if (placeholder) {
        placeholder.textContent = `Перетащите блоки сюда. Осталось блоков: ${availableBlocks}`;
    }
}

// Обновление параметров блока
function updateBlockParams(selectElement) {
    const block = selectElement.closest('.code-block');
    const params = JSON.parse(block.dataset.params || '{}');
    
    if (selectElement.tagName === 'SELECT') {
        params[selectElement.dataset.param] = selectElement.value;
    } else if (selectElement.tagName === 'INPUT') {
        const isEnd = selectElement.value.includes('n &lt;');
        params[isEnd ? 'loopEnd' : 'loopStart'] = selectElement.value;
    }
    
    block.dataset.params = JSON.stringify(params);
}

function getBlockText(type, params) {
    switch(type) {
        case 'loop':
            return `повторить(n=${params.loopStart || 1}; n < ${params.loopEnd || 3}; n++)`;
        case 'if':
            return `если(секция_${params.section}.заполнена != ${params.state})`;
        case 'ifcolor':
            return `если(посылка.цвет == ${params.color})`;
        case 'send':
            return `отправить_на_${params.conveyor}_конвейер()`;
        default:
            return 'НЕИЗВЕСТНЫЙ_БЛОК';
    }
}

// Запуск программы
async function runProgram() {
    if (isExecuting) return;
    
    if (programBlocks.length === 0) {
        addConsoleMessage('❌ Ошибка: программа пуста!', 'danger');
        return;
    }

    isExecuting = true;
    resetConveyors();
    loadPackagesToInput();
    addConsoleMessage('⚡ Запуск процедуры стабилизации...', 'system');

    // Обрабатываем каждую секцию
    for (let section = 1; section <= levelConfig.sections; section++) {
        if (!isExecuting) break;
        
        currentSection = section;
        addConsoleMessage(`🔧 Обработка секции ${section}...`, 'system');
        
        // Получаем посылки для текущей секции
        const sectionPackages = levelConfig.packages.filter(pkg => pkg.section === section);
        
        // Обрабатываем каждую посылку в секции
        for (const pkg of sectionPackages) {
            if (!isExecuting) break;
            
            addConsoleMessage(`📦 Обработка посылки ${pkg.id} (${pkg.color})`, 'system');
            
            // Анимация взятия посылки роботом
            await animateRobotPickup(pkg);
            
            // Выполняем программу для текущей посылки
            const result = await executeProgramForPackage(pkg, section);
            
            if (result) {
                addConsoleMessage(`✅ Посылка ${pkg.id} отправлена на ${result} конвейер`, 'success');
                // Наносим урон боссу за успешную сортировку
                if (!pkg.corrupted) {
                    levelConfig.bossHealth = Math.max(0, levelConfig.bossHealth - 5);
                    updateBossHealth();
                }
            } else {
                addConsoleMessage(`❌ Посылка ${pkg.id} не была отсортирована`, 'danger');
                // Босс атакует при ошибке
                await bossAttack();
            }
            
            await new Promise(resolve => setTimeout(resolve, 600));
        }
        
        // Проверяем состояние босса после каждой секции
        if (levelConfig.bossHealth <= 0) {
            await defeatBoss();
            break;
        }
    }
    
    if (isExecuting) {
        await checkLevelCompletion();
        isExecuting = false;
    }
}

// Атака босса
async function bossAttack() {
    addConsoleMessage('⚡ Глитч-атака! Система нестабильна!', 'danger');
    
    // Визуальные эффекты
    const glitch = document.getElementById('glitchEffect');
    glitch.style.opacity = '0.2';
    
    // Случайным образом повреждаем секцию
    const randomSection = Math.floor(Math.random() * levelConfig.sections) + 1;
    levelConfig.sectionStates[randomSection - 1] = !levelConfig.sectionStates[randomSection - 1];
    
    addConsoleMessage(`🔧 Секция ${randomSection} ${levelConfig.sectionStates[randomSection - 1] ? 'восстановлена' : 'повреждена'}!`, 'warning');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    glitch.style.opacity = '0';
}

// Выполнение программы для конкретной посылки и секции
async function executeProgramForPackage(pkg, section) {
    let foundAction = false;
    let conveyorColor = null;
    let loopActive = false;
    let loopCount = 0;
    
    for (let i = 0; i < programBlocks.length; i++) {
        const block = programBlocks[i];
        const params = JSON.parse(block.params);
        
        // Подсветка выполняемого блока
        block.element.classList.add('executing');
        
        switch(block.type) {
            case 'loop':
                if (!loopActive) {
                    loopActive = true;
                    loopCount = parseInt(params.loopStart) || 1;
                    const loopEnd = parseInt(params.loopEnd) || 3;
                    addConsoleMessage(`🔄 Запуск цикла: ${loopCount} < ${loopEnd}`, 'system');
                }
                break;
                
            case 'if':
                if (!foundAction) {
                    const targetSection = parseInt(params.section);
                    const expectedState = params.state === 'true';
                    const actualState = levelConfig.sectionStates[targetSection - 1];
                    
                    if (targetSection === section && actualState !== expectedState) {
                        foundAction = true;
                        addConsoleMessage(`✓ Условие выполнено: секция_${section}.заполнена != ${expectedState}`, 'system');
                    }
                }
                break;
                
            case 'ifcolor':
                if (!foundAction && pkg.color === params.color) {
                    foundAction = true;
                    addConsoleMessage(`✓ Условие выполнено: посылка.цвет == ${params.color}`, 'system');
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
    
    return conveyorColor;
}

// Анимация взятия посылки роботом
async function animateRobotPickup(pkg) {
    const robotArm = document.getElementById('robotArm');
    const packageElement = document.querySelector(`[data-id="${pkg.id}"]`);
    
    if (packageElement) {
        packageElement.remove();
    }
    
    robotArm.classList.add('executing');
    robotArm.textContent = pkg.corrupted ? `💀${pkg.id}` : `📦${pkg.id}`;
    
    await new Promise(resolve => setTimeout(resolve, 500));
}

// Отправка посылки на конвейер
async function sendPackageToConveyor(pkg, conveyorColor) {
    const conveyor = document.getElementById(`${conveyorColor}Conveyor`);
    const robotArm = document.getElementById('robotArm');
    
    // Анимация отправки
    robotArm.textContent = `➡️${conveyorColor}`;
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Создаем элемент посылки на целевом конвейере
    const packageElement = document.createElement('div');
    packageElement.className = `package ${pkg.color} ${pkg.corrupted ? 'corrupted' : ''}`;
    packageElement.textContent = pkg.id;
    packageElement.title = `Посылка ${pkg.id} (${pkg.color}) ${pkg.corrupted ? '[ПОВРЕЖДЕНА]' : ''}`;
    conveyor.appendChild(packageElement);
    
    // Добавляем в отсортированные
    sortedPackages[conveyorColor].push(pkg);
    
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
    
    // Анимация победы
    const conveyorSystem = document.getElementById('conveyorSystem');
    conveyorSystem.classList.remove('glitch-active');
    
    // Сохраняем прогресс
    setTimeout(() => {
        completeLevel();
    }, 2000);
}

// Проверка завершения уровня
async function checkLevelCompletion() {
    const sortedCount = Object.values(sortedPackages).reduce((sum, arr) => sum + arr.length, 0);
    const totalPackages = levelConfig.packages.length;
    
    addConsoleMessage(`📊 Результаты: ${sortedCount}/${totalPackages} посылок отсортировано`, 'system');
    
    if (sortedCount >= totalPackages * 0.8) { // 80% для победы
        addConsoleMessage('🎉 Большинство посылок отсортировано!', 'success');
        setTimeout(() => {
            completeLevel();
        }, 1000);
    } else {
        addConsoleMessage('❌ Недостаточно посылок отсортировано для стабилизации', 'danger');
    }
}

// Сброс программы
function resetProgram() {
    if (isExecuting) {
        isExecuting = false;
        addConsoleMessage('⚠️ Процедура прервана', 'warning');
    }
    
    const codeArea = document.getElementById('codeArea');
    codeArea.innerHTML = '';
    programBlocks = [];
    availableBlocks = levelConfig.maxBlocks;
    updateBlocksCounter();
    updateProgramState();
    resetConveyors();
    levelConfig.bossHealth = 100;
    updateBossHealth();
    addConsoleMessage('🔄 Система сброшена', 'system');
}

// Обновление состояния программы
function updateProgramState() {
    const codeArea = document.getElementById('codeArea');
    if (programBlocks.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'code-placeholder';
        placeholder.textContent = `Перетащите блоки сюда. Осталось блоков: ${availableBlocks}`;
        codeArea.appendChild(placeholder);
    }
}

// Добавление сообщения в консоль
function addConsoleMessage(message, type = 'system') {
    const consoleOutput = document.getElementById('consoleOutput');
    const messageElement = document.createElement('div');
    messageElement.className = `console-line log-${type}`;
    messageElement.textContent = message;
    
    consoleOutput.appendChild(messageElement);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Завершение уровня
function completeLevel() {
    // Сохраняем прогресс в localStorage
    localStorage.setItem('cyberSystemsProgress', JSON.stringify({
        currentLevel: '2.boss',
        lastCompleted: '2.boss'
    }));
    
    alert('🎊 ПОБЕДА!\n\nВы победили Адаптивный глитч!\nСистема сортировки стабилизирована!\n\nПовышение до Разработчика!');
    goToLevelMap();
}

// Навигация
function goBack() {
    window.location.href = '../level-map/index.html';
}

function showHelp() {
    alert('Помощь по уровню Босс 2.3:\n\n' +
          '1. Ограниченное количество блоков (хватит на одну секцию)\n' +
          '2. Используйте циклы для обработки нескольких посылок\n' +
          '3. Проверяйте состояние секций (секция_X.заполнена)\n' +
          '4. Сортируйте посылки по цветам\n' +
          '5. Избегайте поврежденных посылок\n' +
          '6. Стабилизируйте систему до 0% нестабильности\n\n' +
          'Глитч может менять состояние секций во время выполнения!');
}

function goToLevelMap() {
    window.location.href = '../level-map/index.html';
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initializeLevel);