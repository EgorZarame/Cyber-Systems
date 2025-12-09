// frontend/level-1-1/level-1-1.js
class Level1_1 extends LevelBase {
    constructor() {
        super({
            id: '1.1',
            title: 'Первые шаги',
            gridSizeX: 10,
            gridSizeY: 6,
            start: { x: 1, y: 3 },
            finish: { x: 8, y: 3 }
        });
    }

    initializeDragAndDrop() {
        // Только один блок для этого уровня
        const block = document.querySelector('.code-block[draggable="true"]');
        
        block.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', 'move');
        });

        this.codeArea.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.codeArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.addBlockToProgram('move');
        });
    }

    getWelcomeMessage() {
        return 'Используйте ДВИГАТЬСЯ_ВПЕРЕД() чтобы достичь цели';
    }

    showHelp() {
        alert('Помощь:\n\nПеретащите блок ДВИГАТЬСЯ_ВПЕРЕД() в область программы\nЗапустите программу чтобы двигать дрона');
    }
}

// Инициализация уровня
let level;

function initializeLevel() {
    level = new Level1_1();
    level.initialize();
}

// Глобальные функции для вызова из HTML
function runProgram() {
    level.runProgram();
}

function resetProgram() {
    level.resetProgram();
}

function goBack() {
    level.goBack();
}

function showHelp() {
    level.showHelp();
}

function goToLevelMap() {
    level.goToLevelMap();
}

document.addEventListener('DOMContentLoaded', initializeLevel);