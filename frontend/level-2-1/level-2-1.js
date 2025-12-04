// Конфигурация уровня 2.1 - Система сортировки
const levelConfig = {
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
};

let programBlocks = [];
let isExecuting = false;
let currentPackageIndex = 0;
let sortedPackages = {
    'красный': [],
    'синий': [],
    'зеленый': []
};

// Инициализация уровня
function initializeLevel() {
    initializeConveyors();
    initializeDragAndDrop();
    addConsoleMessage('Система готова');
    addConsoleMessage('Программируйте робота');
}

// Инициализация конвейеров
function initializeConveyors() {
    resetConveyors();
    loadPackagesToInput();
}

// Сброс конвейеров
function resetConveyors() {
    console.log('Сброс конвейеров...');
    
    // Проверяем, существуют ли элементы конвейеров
    const inputConveyor = document.getElementById('inputConveyor');
    const redConveyor = document.getElementById('redConveyor');
    const blueConveyor = document.getElementById('blueConveyor');
    const greenConveyor = document.getElementById('greenConveyor');
    
    console.log('Конвейеры найдены:', {
        input: !!inputConveyor,
        red: !!redConveyor,
        blue: !!blueConveyor,
        green: !!greenConveyor
    });
    
    if (inputConveyor) inputConveyor.innerHTML = '';
    if (redConveyor) redConveyor.innerHTML = '';
    if (blueConveyor) blueConveyor.innerHTML = '';
    if (greenConveyor) greenConveyor.innerHTML = '';
    
    sortedPackages = {
        'красный': [],
        'синий': [],
        'зеленый': []
    };
    currentPackageIndex = 0;
    
    // Сброс робота
    const robotArm = document.getElementById('robotArm');
    if (robotArm) {
        robotArm.textContent = '🤖';
        robotArm.classList.remove('executing');
        console.log('Робот сброшен');
    }
}

// Загрузка посылок на входной конвейер
function loadPackagesToInput() {
    const inputConveyor = document.getElementById('inputConveyor');
    inputConveyor.innerHTML = '';
    
    levelConfig.packages.forEach(pkg => {
        const packageElement = document.createElement('div');
        packageElement.className = `package ${pkg.color}`;
        packageElement.textContent = pkg.id;
        packageElement.title = `Посылка ${pkg.id} (${pkg.color})`;
        packageElement.dataset.id = pkg.id;
        packageElement.dataset.color = pkg.color;
        inputConveyor.appendChild(packageElement);
    });
}

// Drag and Drop
function initializeDragAndDrop() {
    const blocks = document.querySelectorAll('.code-block[draggable="true"]');
    const codeArea = document.getElementById('codeArea');

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

    codeArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';
    });

    codeArea.addEventListener('dragleave', (e) => {
        e.currentTarget.style.backgroundColor = '';
    });

    codeArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = '';
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        addBlockToProgram(data.type, data.params);
    });
}

// Добавление блока в программу
function addBlockToProgram(type, params) {
    const codeArea = document.getElementById('codeArea');
    const placeholder = codeArea.querySelector('.code-placeholder');
    
    if (placeholder) {
        placeholder.remove();
    }

    const block = document.createElement('div');
    block.className = 'code-block';
    block.dataset.type = type;
    
    // ВАЖНО: сохраняем params как объект, а не JSON строку
    block.dataset.params = JSON.stringify(params);
    
    // Создаем содержимое блока
    const content = document.createElement('div');
    content.className = 'condition-content';
    
    switch(type) {
        case 'if':
            content.innerHTML = `
                если(цвет == 
                <select class="condition-select" data-param="color" onchange="updateBlockParams(this)">
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
                <select class="condition-select" data-param="color" onchange="updateBlockParams(this)">
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
                <select class="condition-select" data-param="conveyor" onchange="updateBlockParams(this)">
                    <option value="красный" ${params.conveyor === 'красный' ? 'selected' : ''}>красный</option>
                    <option value="синий" ${params.conveyor === 'синий' ? 'selected' : ''}>синий</option>
                    <option value="зеленый" ${params.conveyor === 'зеленый' ? 'selected' : ''}>зеленый</option>
                </select>
            `;
            block.classList.add('action');
            break;
    }
    
    block.appendChild(content);
    
    block.addEventListener('dblclick', () => {
        if (!isExecuting) {
            block.remove();
            programBlocks = programBlocks.filter(b => b.element !== block);
            updateProgramState();
        }
    });

    codeArea.appendChild(block);
    
    // Сохраняем params как объект, а не строку
    programBlocks.push({ 
        type, 
        params: params, // сохраняем как объект
        element: block 
    });
    
    addConsoleMessage(`+ Блок: ${getBlockText(type, params)}`);
}

// Обновление параметров блока
function updateBlockParams(selectElement) {
    if (isExecuting) return;
    
    const block = selectElement.closest('.code-block');
    const type = block.dataset.type;
    const params = JSON.parse(block.dataset.params || '{}');
    params[selectElement.dataset.param] = selectElement.value;
    block.dataset.params = JSON.stringify(params);
    
    // Обновляем в массиве programBlocks
    const blockIndex = programBlocks.findIndex(b => b.element === block);
    if (blockIndex !== -1) {
        programBlocks[blockIndex].params = params;
    }
}

function getBlockText(type, params) {
    switch(type) {
        case 'if':
            return `если(цвет == ${params.color})`;
        case 'elseif':
            return `иначе если(цвет == ${params.color})`;
        case 'else':
            return 'иначе';
        case 'send':
            return `отправить на ${params.conveyor}`;
        default:
            return 'НЕИЗВЕСТНЫЙ_БЛОК';
    }
}

// Запуск программы
async function runProgram() {
    console.log('=== НАЧАЛО ВЫПОЛНЕНИЯ ПРОГРАММЫ ===');
    
    if (isExecuting) {
        console.log('Программа уже выполняется');
        return;
    }
    
    if (programBlocks.length === 0) {
        addConsoleMessage('Ошибка: программа пуста!');
        console.log('Программа пуста');
        return;
    }

    isExecuting = true;
    console.log(`Блоков в программе: ${programBlocks.length}`);
    
    resetConveyors();
    loadPackagesToInput();
    
    console.log(`Всего посылок: ${levelConfig.packages.length}`);
    addConsoleMessage('Запуск программы...');

    // Обрабатываем каждую посылку
    for (let i = 0; i < levelConfig.packages.length; i++) {
        if (!isExecuting) {
            console.log('Выполнение прервано пользователем');
            addConsoleMessage('Выполнение прервано');
            break;
        }
        
        currentPackageIndex = i;
        const currentPackage = levelConfig.packages[i];
        
        console.log(`\nОбработка посылки ${i+1}/${levelConfig.packages.length}: ID=${currentPackage.id}, цвет=${currentPackage.color}`);
        addConsoleMessage(`=== Посылка ${currentPackage.id} (${currentPackage.color}) ===`);
        
        // Анимация взятия посылки роботом
        await animateRobotPickup(currentPackage);
        
        // Выполняем программу для текущей посылки
        console.log('Выполняем программу для посылки...');
        const result = await executeProgramForPackage(currentPackage);
        
        if (result) {
            console.log(`Посылка ${currentPackage.id} успешно отправлена на ${result} конвейер`);
            addConsoleMessage(`✅ Отправлена на ${result} конвейер`);
        } else {
            console.log(`Посылка ${currentPackage.id} не была обработана`);
            addConsoleMessage(`❌ Не обработана`);
        }
        
        // Короткая пауза между посылками
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    if (isExecuting) {
        console.log('=== ПРОВЕРКА РЕЗУЛЬТАТОВ ===');
        await checkLevelCompletion();
        isExecuting = false;
        console.log('=== ВЫПОЛНЕНИЕ ЗАВЕРШЕНО ===');
    }
}

// Анимация взятия посылки роботом
async function animateRobotPickup(pkg) {
    console.log(`Берем посылку ${pkg.id} (${pkg.color})`);
    
    const robotArm = document.getElementById('robotArm');
    const packageElement = document.querySelector(`[data-id="${pkg.id}"]`);
    
    if (!robotArm) {
        console.error('Робот не найден!');
        return;
    }
    
    if (packageElement) {
        packageElement.remove();
        console.log(`Посылка ${pkg.id} удалена с входного конвейера`);
    } else {
        console.warn(`Посылка ${pkg.id} не найдена на входном конвейере`);
    }
    
    robotArm.classList.add('executing');
    robotArm.textContent = `📦${pkg.id}`;
    
    await new Promise(resolve => setTimeout(resolve, 300));
}

// Выполнение программы для конкретной посылки
async function executeProgramForPackage(pkg) {
    console.log(`Выполняем программу для посылки ${pkg.id} (${pkg.color})`);
    
    let conveyorColor = null;
    let conditionMet = false;
    let skipToNextCondition = false;
    
    for (let i = 0; i < programBlocks.length; i++) {
        const block = programBlocks[i];
        
        console.log(`Блок ${i}: type=${block.type}, params=`, block.params);
        
        // Подсветка выполняемого блока
        block.element.classList.add('executing');
        await new Promise(resolve => setTimeout(resolve, 150));
        
        switch(block.type) {
            case 'if':
                if (!conditionMet && !skipToNextCondition) {
                    if (pkg.color === block.params.color) {
                        conditionMet = true;
                        addConsoleMessage(`✓ Условие "если" выполнено`);
                    } else {
                        skipToNextCondition = true;
                        addConsoleMessage(`✗ Условие "если" не выполнено`);
                    }
                }
                break;
                
            case 'elseif':
                if (!conditionMet && skipToNextCondition) {
                    if (pkg.color === block.params.color) {
                        conditionMet = true;
                        skipToNextCondition = false;
                        addConsoleMessage(`✓ Условие "иначе если" выполнено`);
                    } else {
                        addConsoleMessage(`✗ Условие "иначе если" не выполнено`);
                    }
                }
                break;
                
            case 'else':
                if (!conditionMet && skipToNextCondition) {
                    conditionMet = true;
                    skipToNextCondition = false;
                    addConsoleMessage(`✓ Выполняется блок "иначе"`);
                }
                break;
                
            case 'send':
                if (conditionMet && !conveyorColor) {
                    conveyorColor = block.params.conveyor;
                    addConsoleMessage(`➡️ Отправляем на ${conveyorColor} конвейер`);
                    await sendPackageToConveyor(pkg, conveyorColor);
                }
                break;
        }
        
        block.element.classList.remove('executing');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Если посылка отправлена, выходим
        if (conveyorColor) {
            console.log(`Посылка ${pkg.id} отправлена на ${conveyorColor}`);
            break;
        }
    }
    
    if (!conveyorColor) {
        console.log(`Посылка ${pkg.id} не была обработана`);
        addConsoleMessage(`❌ Не была обработана`);
    }
    
    return conveyorColor;
}

// Отправка посылки на конвейер
async function sendPackageToConveyor(pkg, conveyorColor) {
    console.log(`Отправляем посылку ${pkg.id} на конвейер: ${conveyorColor}`);
    
    // Правильно определяем ID конвейера
    let conveyorId;
    switch(conveyorColor) {
        case 'красный':
            conveyorId = 'redConveyor';
            break;
        case 'синий':
            conveyorId = 'blueConveyor';
            break;
        case 'зеленый':
            conveyorId = 'greenConveyor';
            break;
        default:
            console.error(`Неизвестный цвет конвейера: ${conveyorColor}`);
            return;
    }
    
    const conveyor = document.getElementById(conveyorId);
    
    if (!conveyor) {
        console.error(`Конвейер с ID "${conveyorId}" не найден!`);
        addConsoleMessage(`❌ Ошибка: конвейер "${conveyorColor}" не найден`);
        return;
    }
    
    const robotArm = document.getElementById('robotArm');
    
    // Анимация отправки
    robotArm.textContent = `→${conveyorColor[0].toUpperCase()}`;
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Создаем элемент посылки на целевом конвейере
    const packageElement = document.createElement('div');
    packageElement.className = `package ${pkg.color} package-moving`;
    packageElement.textContent = pkg.id;
    packageElement.title = `Посылка ${pkg.id} (${pkg.color})`;
    conveyor.appendChild(packageElement);
    
    // Добавляем в отсортированные
    sortedPackages[conveyorColor].push(pkg);
    console.log(`Посылка ${pkg.id} добавлена на ${conveyorColor} конвейер. Всего: ${sortedPackages[conveyorColor].length}`);
    
    // Сбрасываем робота
    setTimeout(() => {
        robotArm.textContent = '🤖';
        robotArm.classList.remove('executing');
    }, 100);
    
    await new Promise(resolve => setTimeout(resolve, 200));
}

// Проверка завершения уровня
async function checkLevelCompletion() {
    let isComplete = true;
    let message = 'Результаты:\n';
    
    for (const color in levelConfig.requiredSorting) {
        const required = levelConfig.requiredSorting[color];
        const actual = sortedPackages[color].length;
        
        message += `${color}: ${actual}/${required}\n`;
        
        if (actual < required) {
            isComplete = false;
        }
    }
    
    addConsoleMessage(message);
    
    if (isComplete) {
        addConsoleMessage('Все отсортированы!');
        setTimeout(() => {
            completeLevel();
        }, 1000);
    } else {
        addConsoleMessage('Не все отсортированы');
    }
}

// Сброс программы
function resetProgram() {
    if (isExecuting) {
        isExecuting = false;
        addConsoleMessage('Программа прервана');
    }
    
    const codeArea = document.getElementById('codeArea');
    codeArea.innerHTML = '';
    programBlocks = [];
    updateProgramState();
    resetConveyors();
    loadPackagesToInput();
    addConsoleMessage('Программа сброшена');
}

// Обновление состояния программы
function updateProgramState() {
    const codeArea = document.getElementById('codeArea');
    if (programBlocks.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'code-placeholder';
        placeholder.textContent = 'Перетащите блоки сюда';
        codeArea.appendChild(placeholder);
    }
}

// Добавление сообщения в консоль
function addConsoleMessage(message) {
    const consoleOutput = document.getElementById('consoleOutput');
    const messageElement = document.createElement('div');
    messageElement.className = 'console-line';
    
    // Добавляем префиксы для разных типов сообщений
    let displayMessage = message;
    if (message.includes('✓') || message.includes('✅') || message.includes('➡️')) {
        messageElement.style.color = '#4CAF50';
    } else if (message.includes('✗') || message.includes('❌')) {
        messageElement.style.color = '#f44336';
    } else if (message.includes('===') || message.includes('---')) {
        messageElement.style.color = '#2196F3';
        messageElement.style.fontWeight = 'bold';
    } else if (message.includes('Посылка') && message.includes('===')) {
        messageElement.style.color = '#FF9800';
        messageElement.style.fontWeight = 'bold';
    }
    
    messageElement.textContent = displayMessage;
    
    consoleOutput.appendChild(messageElement);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Завершение уровня
async function completeLevel() {
    isExecuting = false;
    
    // Обновляем прогресс на бэкенде и в локальном профиле
    try {
        await updateProgress('2.1');
    } catch (error) {
        console.error('Ошибка обновления прогресса (2.1):', error);
    }
    // Синхронизация локального профиля
    syncLocalProfileAfterLevel('2.1');
    
    alert('🎊 Уровень пройден!\n\nВы освоили условные переменные!\nСистема сортировки работает корректно!');
    goToLevelMap();
}

// Навигация
function goBack() {
    window.location.href = '../level-map/index.html';
}

function showHelp() {
    alert('Помощь по уровню 2.1:\n\n' +
          '1. Используйте блоки "если" для проверки цвета посылки\n' +
          '2. Добавьте блоки "отправить_на_цвет_конвейер" для действий\n' +
          '3. Используйте "иначе если" для дополнительных условий\n' +
          '4. Блок "иначе" выполнится если другие условия не сработали\n\n' +
          'Пример решения:\n' +
          'если(посылка.цвет == красный)\n' +
          '  отправить_на_красный_конвейер()\n' +
          'иначе если(посылка.цвет == синий)\n' +
          '  отправить_на_синий_конвейер()\n' +
          'иначе\n' +
          '  отправить_на_зеленый_конвейер()');
}

function goToLevelMap() {
    window.location.href = '../level-map/index.html';
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initializeLevel);