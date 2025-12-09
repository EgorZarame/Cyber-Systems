// Конфигурация уровня 3.1
const level3_1_config = {
    id: '3.1',
    title: 'Функция движения',
    gridSizeX: 10,
    gridSizeY: 8,
    start: { x: 1, y: 4 },
    finish: { x: 8, y: 4 },
    obstacles: [
        { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 },
        { x: 4, y: 2 }, { x: 4, y: 6 },
        { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 },
        { x: 6, y: 2 }, { x: 6, y: 6 },
        { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }
    ],
    description: 'Напишите функцию на Python для движения дрона по лабиринту'
};

class Level3_1 extends LevelBase3 {
    constructor() {
        super(level3_1_config);
    }

    initialize() {
        // Не вызываем super.initialize(), так как он вызывает drag&drop, который нам не нужен
        this.initializeGameGrid();
        this.setupCodeEditor();
        this.setupDefaultCode();
        this.addConsoleMessage('🐍 Python интерпретатор готов', 'info');
        this.addConsoleMessage('💡 Напишите функцию пройти_лабиринт() для движения дрона', 'info');
        this.addConsoleMessage('📍 Проведите дрона от зеленой к оранжевой клетке', 'info');
    }

    setupCodeEditor() {
        super.setupCodeEditor();
        
        // Дополнительная настройка редактора
        if (this.codeEditor) {
            this.codeEditor.addEventListener('keydown', (e) => {
                // Поддержка табуляции
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = this.codeEditor.selectionStart;
                    const end = this.codeEditor.selectionEnd;
                    
                    // Вставляем 4 пробела
                    this.codeEditor.value = this.codeEditor.value.substring(0, start) + 
                                           '    ' + 
                                           this.codeEditor.value.substring(end);
                    
                    // Устанавливаем курсор после табуляции
                    this.codeEditor.selectionStart = this.codeEditor.selectionEnd = start + 4;
                }
            });
        }
    }

    setupDefaultCode() {
        if (this.codeEditor) {
            this.codeEditor.value = `def пройти_лабиринт():
    # Ваш код здесь
    двигаться_вперед()
    двигаться_вперед()
    повернуть_направо()
    двигаться_вперед()
    двигаться_вперед()
    повернуть_налево()
    двигаться_вперед()`;
        }
    }

    getWelcomeMessage() {
        return 'Уровень 3.1: Функция движения - научитесь писать функции на Python';
    }

    validatePythonCode(code) {
        if (!code.includes('пройти_лабиринт')) {
            this.addConsoleMessage('❌ Ошибка: функция пройти_лабиринт() не найдена!', 'error');
            this.addConsoleMessage('💡 Используйте: def пройти_лабиринт():', 'error');
            return false;
        }
        
        // Проверяем, что функция определена правильно
        const functionPattern = /def\s+пройти_лабиринт\s*\(\s*\)\s*:/;
        if (!functionPattern.test(code)) {
            this.addConsoleMessage('❌ Ошибка: неправильное определение функции!', 'error');
            this.addConsoleMessage('💡 Используйте правильный синтаксис: def пройти_лабиринт():', 'error');
            return false;
        }
        
        return true;
    }

    async executePythonCode(code) {
        const lines = code.split('\n');
        let inFunction = false;
        let functionBody = [];
        
        // Парсим код для извлечения тела функции
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            if (trimmedLine.startsWith('def пройти_лабиринт():')) {
                inFunction = true;
                continue;
            }
            
            if (inFunction) {
                if (trimmedLine === '' || trimmedLine.startsWith('#')) {
                    continue;
                }
                
                // Проверяем, что строка имеет отступ (находится внутри функции)
                if (line.length > 0 && line[0] === ' ') {
                    const command = trimmedLine;
                    if (command && !command.startsWith('def ')) {
                        functionBody.push({
                            text: line,
                            indent: line.search(/\S/),
                            content: trimmedLine,
                            lineNumber: i + 1
                        });
                    }
                } else if (trimmedLine !== '' && !trimmedLine.startsWith('#')) {
                    // Если нашли строку без отступа и это не комментарий, выходим из функции
                    break;
                }
            }
        }
        
        if (functionBody.length === 0) {
            // Проверяем простейший случай - функция в одну строку
            const simpleMatch = code.match(/def пройти_лабиринт\(\):\s*(.+)/);
            if (simpleMatch && simpleMatch[1]) {
                functionBody.push({
                    text: '    ' + simpleMatch[1],
                    indent: 4,
                    content: simpleMatch[1].trim(),
                    lineNumber: 2
                });
            } else {
                throw new Error('Тело функции пусто! Добавьте команды с отступами.');
            }
        }
        
        this.addConsoleMessage(`📝 Найдено ${functionBody.length} команд в функции`);
        this.addConsoleMessage('🔍 Начинаю выполнение...');
        
        // Выполняем команды из тела функции
        for (let i = 0; i < functionBody.length; i++) {
            if (!this.isExecuting) break;
            
            const instruction = functionBody[i];
            this.currentLine = instruction.lineNumber;
            
            this.addConsoleMessage(`📄 Строка ${this.currentLine}: ${instruction.content}`);
            
            try {
                await this.executeCommand(instruction.content);
                await new Promise(resolve => setTimeout(resolve, 600));
                
                if (this.checkLevelComplete()) {
                    this.addConsoleMessage('🎉 Дрон достиг цели!', 'success');
                    await this.completeLevel();
                    break;
                }
            } catch (error) {
                this.addConsoleMessage(`❌ Ошибка в строке ${this.currentLine}: ${error.message}`, 'error');
                break;
            }
        }
        
        if (this.isExecuting && !this.checkLevelComplete()) {
            this.addConsoleMessage('🛑 Выполнение завершено, но дрон не достиг цели', 'error');
            this.addConsoleMessage(`📍 Текущая позиция: (${this.drone.x}, ${this.drone.y})`, 'error');
            this.addConsoleMessage('💡 Проверьте свой маршрут и попробуйте снова');
        }
        
        this.isExecuting = false;
    }

    getCompletionMessage() {
        return 'Вы успешно написали свою первую функцию на Python!\nДрон достиг цели!';
    }

    showHelp() {
        alert('Помощь по уровню 3.1:\n\n' +
              '1. Напишите функцию пройти_лабиринт() на Python\n' +
              '2. Используйте команды движения внутри функции\n' +
              '3. Не забудьте про отступы (4 пробела или табуляция)\n' +
              '4. Проведите дрона от зеленой к оранжевой клетке\n\n' +
              'Пример решения:\n' +
              'def пройти_лабиринт():\n' +
              '    двигаться_вперед()\n' +
              '    двигаться_вперед()\n' +
              '    повернуть_направо()\n' +
              '    двигаться_вперед()\n' +
              '    двигаться_вперед()\n' +
              '    повернуть_налево()\n' +
              '    двигаться_вперед()\n\n' +
              'Внимание: Все команды должны быть с отступами!\n' +
              'Нажмите Tab для вставки 4 пробелов.');
    }

    // Переопределяем goToLevelMap для главы 3
    goToLevelMap() {
        if (this.trafficLightInterval) {
            clearInterval(this.trafficLightInterval);
        }
        window.location.href = '../level-map/index.html';
    }
}