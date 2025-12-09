// frontend/js/levels/LevelBase2.js
class LevelBase2 {
    constructor(config) {
        this.config = config;
        this.sortedPackages = {
            'красный': [],
            'синий': [],
            'зеленый': []
        };
        this.currentPackageIndex = 0;
        this.isExecuting = false;
        this.programBlocks = [];
        this.initElements();
    }

    initElements() {
        this.gameGrid = document.getElementById('gameGrid');
        this.codeArea = document.getElementById('codeArea');
        this.consoleOutput = document.getElementById('consoleOutput');
        this.robotArm = document.getElementById('robotArm');
        this.inputConveyor = document.getElementById('inputConveyor');
        this.redConveyor = document.getElementById('redConveyor');
        this.blueConveyor = document.getElementById('blueConveyor');
        this.greenConveyor = document.getElementById('greenConveyor');
        this.conveyorSystem = document.getElementById('conveyorSystem');
    }

    initialize() {
        this.initializeConveyors();
        this.initializeDragAndDrop();
        this.addConsoleMessage(this.getWelcomeMessage(), 'system');
    }

    initializeConveyors() {
        this.resetConveyors();
        this.loadPackagesToInput();
    }

    resetConveyors() {
        if (this.inputConveyor) this.inputConveyor.innerHTML = '';
        if (this.redConveyor) this.redConveyor.innerHTML = '';
        if (this.blueConveyor) this.blueConveyor.innerHTML = '';
        if (this.greenConveyor) this.greenConveyor.innerHTML = '';
        
        this.sortedPackages = {
            'красный': [],
            'синий': [],
            'зеленый': []
        };
        this.currentPackageIndex = 0;
        
        if (this.robotArm) {
            this.robotArm.textContent = '🤖';
            this.robotArm.classList.remove('executing');
        }
    }

    loadPackagesToInput() {
        if (!this.inputConveyor) return;
        
        this.inputConveyor.innerHTML = '';
        
        this.config.packages.forEach(pkg => {
            const packageElement = this.createPackageElement(pkg);
            this.inputConveyor.appendChild(packageElement);
        });
    }

    createPackageElement(pkg) {
        const packageElement = document.createElement('div');
        packageElement.className = `package ${pkg.color}`;
        if (pkg.corrupted) {
            packageElement.classList.add('corrupted');
        }
        packageElement.textContent = pkg.id;
        packageElement.title = `Посылка ${pkg.id} (${pkg.color}) ${pkg.corrupted ? '[ПОВРЕЖДЕНА]' : ''}`;
        packageElement.dataset.id = pkg.id;
        packageElement.dataset.color = pkg.color;
        packageElement.dataset.corrupted = pkg.corrupted || false;
        
        return packageElement;
    }

    async animateRobotPickup(pkg) {
        const packageElement = document.querySelector(`[data-id="${pkg.id}"]`);
        
        if (packageElement) {
            packageElement.remove();
        }
        
        if (this.robotArm) {
            this.robotArm.classList.add('executing');
            this.robotArm.textContent = `📦${pkg.id}`;
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    async sendPackageToConveyor(pkg, conveyorColor) {
        const colorMap = {
            'красный': 'red',
            'синий': 'blue',
            'зеленый': 'green'
        };
        
        const englishColor = colorMap[conveyorColor] || conveyorColor;
        const conveyorId = `${englishColor}Conveyor`;
        const conveyor = document.getElementById(conveyorId);
        
        if (!conveyor) {
            this.addConsoleMessage(`❌ Ошибка: конвейер "${conveyorColor}" не найден`, 'danger');
            return;
        }
        
        if (this.robotArm) {
            this.robotArm.textContent = `➡️${conveyorColor.charAt(0)}`;
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const packageElement = this.createPackageElement(pkg);
        packageElement.classList.add('package-moving');
        conveyor.appendChild(packageElement);
        
        this.sortedPackages[conveyorColor].push(pkg);
        
        if (this.robotArm) {
            this.robotArm.textContent = '🤖';
            this.robotArm.classList.remove('executing');
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    getBlockText(type, params) {
        switch(type) {
            case 'if': return `если(цвет == ${params.color})`;
            case 'elseif': return `иначе если(цвет == ${params.color})`;
            case 'else': return 'иначе';
            case 'send': return `отправить на ${params.conveyor}`;
            default: return 'НЕИЗВЕСТНЫЙ_БЛОК';
        }
    }

    updateProgramState() {
        if (!this.codeArea) return;
        
        if (this.programBlocks.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'code-placeholder';
            placeholder.textContent = 'Перетащите блоки сюда';
            this.codeArea.appendChild(placeholder);
        }
    }

    resetProgram() {
        if (this.isExecuting) {
            this.isExecuting = false;
            this.addConsoleMessage('Программа прервана', 'warning');
        }
        
        if (this.codeArea) {
            this.codeArea.innerHTML = '';
        }
        this.programBlocks = [];
        this.updateProgramState();
        this.resetConveyors();
        this.loadPackagesToInput();
        this.addConsoleMessage('Программа сброшена', 'system');
    }

    addConsoleMessage(message, type = 'system') {
        if (!this.consoleOutput) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `console-line log-${type}`;
        messageElement.textContent = message;
        
        this.consoleOutput.appendChild(messageElement);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    goBack() {
        window.location.href = '../level-map/index.html';
    }

    showHelp() {
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

    goToLevelMap() {
        window.location.href = '../level-map/index.html';
    }

    getWelcomeMessage() {
        return 'Добро пожаловать на уровень!';
    }
}