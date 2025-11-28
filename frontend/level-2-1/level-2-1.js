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
    addConsoleMessage('🟢 Система сортировки готова');
    addConsoleMessage('💡 Запрограммируйте условия для робота-сортировщика');
}

// Инициализация конвейеров
function initializeConveyors() {
    resetConveyors();
    loadPackagesToInput();
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
    });

    codeArea.addEventListener('drop', (e) => {
        e.preventDefault();
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
    block.dataset.params = JSON.stringify(params);
    
    // Создаем содержимое блока
    const content = document.createElement('div');
    content.className = 'condition-content';
    
    switch(type) {
        case 'if':
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
            
        case 'elseif':
            content.innerHTML = `
                иначе если(посылка.цвет == 
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
            updateProgramState();
        }
    });

    codeArea.appendChild(block);
    programBlocks.push({ type, params, element: block });
    
    addConsoleMessage(`Добавлен блок: ${getBlockText(type, params)}`);
}

// Обновление параметров блока
function updateBlockParams(selectElement) {
    const block = selectElement.closest('.code-block');
    const params = JSON.parse(block.dataset.params || '{}');
    params[selectElement.dataset.param] = selectElement.value;
    block.dataset.params = JSON.stringify(params);
}

function getBlockText(type, params) {
    switch(type) {
        case 'if':
            return `если(посылка.цвет == ${params.color})`;
        case 'elseif':
            return `иначе если(посылка.цвет == ${params.color})`;
        case 'else':
            return 'иначе';
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
        addConsoleMessage('❌ Ошибка: программа пуста!');
        return;
    }

    isExecuting = true;
    resetConveyors();
    loadPackagesToInput();
    addConsoleMessage('⚡ Запуск программы сортировки...');

    // Обрабатываем каждую посылку
    for (let i = 0; i < levelConfig.packages.length; i++) {
        if (!isExecuting) break;
        
        currentPackageIndex = i;
        const currentPackage = levelConfig.packages[i];
        
        addConsoleMessage(`📦 Обработка посылки ${currentPackage.id} (${currentPackage.color})`);
        
        // Анимация взятия посылки роботом
        await animateRobotPickup(currentPackage);
        
        // Выполняем программу для текущей посылки
        const result = await executeProgramForPackage(currentPackage);
        
        if (result) {
            addConsoleMessage(`✅ Посылка ${currentPackage.id} отправлена на ${result} конвейер`);
        } else {
            addConsoleMessage(`❌ Посылка ${currentPackage.id} не была отсортирована`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    if (isExecuting) {
        await checkLevelCompletion();
        isExecuting = false;
    }
}

// Анимация взятия посылки роботом
async function animateRobotPickup(pkg) {
    const robotArm = document.getElementById('robotArm');
    const packageElement = document.querySelector(`[data-id="${pkg.id}"]`);
    
    if (packageElement) {
        packageElement.remove();
    }
    
    robotArm.classList.add('executing');
    robotArm.textContent = `📦${pkg.id}`;
    
    await new Promise(resolve => setTimeout(resolve, 500));
}

// Выполнение программы для конкретной посылки
async function executeProgramForPackage(pkg) {
    let foundAction = false;
    let conveyorColor = null;
    
    for (let i = 0; i < programBlocks.length; i++) {
        const block = programBlocks[i];
        const params = JSON.parse(block.params);
        
        // Подсветка выполняемого блока
        block.element.classList.add('executing');
        
        switch(block.type) {
            case 'if':
                if (!foundAction && pkg.color === params.color) {
                    foundAction = true;
                    addConsoleMessage(`✓ Условие выполнено: посылка.цвет == ${params.color}`);
                }
                break;
                
            case 'elseif':
                if (!foundAction && pkg.color === params.color) {
                    foundAction = true;
                    addConsoleMessage(`✓ Условие выполнено: посылка.цвет == ${params.color}`);
                }
                break;
                
            case 'else':
                if (!foundAction) {
                    foundAction = true;
                    addConsoleMessage('✓ Выполняется блок иначе');
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

// Отправка посылки на конвейер
async function sendPackageToConveyor(pkg, conveyorColor) {
    const conveyor = document.getElementById(`${conveyorColor}Conveyor`);
    const robotArm = document.getElementById('robotArm');
    
    // Анимация отправки
    robotArm.textContent = `➡️${conveyorColor}`;
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Создаем элемент посылки на целевом конвейере
    const packageElement = document.createElement('div');
    packageElement.className = `package ${pkg.color} package-moving`;
    packageElement.textContent = pkg.id;
    packageElement.title = `Посылка ${pkg.id} (${pkg.color})`;
    conveyor.appendChild(packageElement);
    
    // Добавляем в отсортированные
    sortedPackages[conveyorColor].push(pkg);
    
    // Сбрасываем робота
    robotArm.textContent = '🤖';
    robotArm.classList.remove('executing');
}

// Проверка завершения уровня
async function checkLevelCompletion() {
    let isComplete = true;
    let message = 'Результаты сортировки:\n';
    
    for (const color in levelConfig.requiredSorting) {
        const required = levelConfig.requiredSorting[color];
        const actual = sortedPackages[color].length;
        
        message += `• ${color}: ${actual}/${required}\n`;
        
        if (actual < required) {
            isComplete = false;
        }
    }
    
    addConsoleMessage(message);
    
    if (isComplete) {
        addConsoleMessage('🎉 Все посылки отсортированы правильно!');
        setTimeout(() => {
            completeLevel();
        }, 1000);
    } else {
        addConsoleMessage('❌ Не все посылки отсортированы правильно');
    }
}

// Сброс программы
function resetProgram() {
    if (isExecuting) {
        isExecuting = false;
        addConsoleMessage('⚠️ Программа прервана');
    }
    
    const codeArea = document.getElementById('codeArea');
    codeArea.innerHTML = '';
    programBlocks = [];
    updateProgramState();
    resetConveyors();
    loadPackagesToInput();
    addConsoleMessage('🔄 Программа сброшена');
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
    messageElement.textContent = message;
    
    consoleOutput.appendChild(messageElement);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Завершение уровня
function completeLevel() {
    // Сохраняем прогресс в localStorage
    localStorage.setItem('cyberSystemsProgress', JSON.stringify({
        currentLevel: '2.1',
        lastCompleted: '2.1'
    }));
    
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