// frontend/level-1-2/level-1-2.js
class Level1_2 extends LevelBase {
    constructor() {
        super({
            id: '1.2',
            title: 'Повороты',
            gridSizeX: 10,
            gridSizeY: 6,
            start: { x: 1, y: 1 },
            finish: { x: 8, y: 4 },
            obstacles: [
                { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 },
                { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 8, y: 3 }
            ]
        });
    }

    initialize() {
        super.initialize();
        this.addConsoleMessage('🎯 Цель: Доберитесь до оранжевой клетки');
        this.addConsoleMessage('⚠️ Обходите красные препятствия с помощью поворотов');
    }

    createGridCell(x, y) {
        const cell = super.createGridCell(x, y);
        
        // Добавляем препятствия
        if (this.config.obstacles.some(obs => obs.x === x && obs.y === y)) {
            cell.classList.add('obstacle');
        }
        
        return cell;
    }

    canMoveTo(x, y) {
        // Проверяем препятствия
        const hasObstacle = this.config.obstacles.some(obs => obs.x === x && obs.y === y);
        return super.canMoveTo(x, y) && !hasObstacle;
    }

    getWelcomeMessage() {
        return 'Используйте повороты для обхода препятствий';
    }

    showHelp() {
        alert('Помощь по уровню 1.2:\n\n' +
              'Цель: Достигните оранжевой клетки\n\n' +
              'Как пройти уровень:\n' +
              '1. Двигайтесь вправо 2 раза\n' +
              '2. Поверните вниз\n' +
              '3. Двигайтесь вниз 3 раза\n' +
              '4. Поверните вправо\n' +
              '5. Двигайтесь вправо 6 раз\n\n' +
              'Пример программы:\n' +
              'ДВИГАТЬСЯ_ВПЕРЕД()\n' +
              'ДВИГАТЬСЯ_ВПЕРЕД()\n' +
              'ПОВЕРНУТЬ_НАЛЕВО()\n' +
              'ДВИГАТЬСЯ_ВПЕРЕД()\n' +
              'ДВИГАТЬСЯ_ВПЕРЕД()\n' +
              'ДВИГАТЬСЯ_ВПЕРЕД()\n' +
              'ПОВЕРНУТЬ_НАПРАВО()\n' +
              'ДВИГАТЬСЯ_ВПЕРЕД()\n' +
              'ДВИГАТЬСЯ_ВПЕРЕД()\n' +
              'ДВИГАТЬСЯ_ВПЕРЕД()\n' +
              'ДВИГАТЬСЯ_ВПЕРЕД()\n' +
              'ДВИГАТЬСЯ_ВПЕРЕД()\n' +
              'ДВИГАТЬСЯ_ВПЕРЕД()');
    }

    async moveForward() {
        let newX = this.drone.x;
        let newY = this.drone.y;

        switch (this.drone.direction) {
            case 'north': newY--; break;
            case 'east': newX++; break;
            case 'south': newY++; break;
            case 'west': newX--; break;
        }

        // Анимация движения с учетом направления
        const droneElement = document.querySelector('.drone');
        if (droneElement) {
            droneElement.classList.add('drone-moving');
            // Устанавливаем CSS переменную для правильного вращения
            const rotation = this.drone.direction === 'north' ? '0deg' :
                           this.drone.direction === 'east' ? '90deg' :
                           this.drone.direction === 'south' ? '180deg' : '270deg';
            droneElement.style.setProperty('--rotation', rotation);
        }

        await new Promise(resolve => setTimeout(resolve, 400));

        if (this.canMoveTo(newX, newY)) {
            this.drone.x = newX;
            this.drone.y = newY;
            this.addConsoleMessage(`✅ Перемещение на (${newX}, ${newY})`);
        } else {
            this.addConsoleMessage('❌ Препятствие или граница поля!');
            // Анимация столкновения
            if (droneElement) {
                droneElement.style.animation = 'none';
                setTimeout(() => {
                    droneElement.style.animation = '';
                }, 100);
            }
        }

        this.updateDronePosition();
        
        if (droneElement) {
            setTimeout(() => {
                droneElement.classList.remove('drone-moving');
            }, 200);
        }
    }

    async completeLevel() {
        this.isExecuting = false;
        
        try {
            await updateProgress(this.config.id);
            this.addConsoleMessage('🎉 Прогресс сохранен!', 'success');
        } catch (error) {
            console.error(`Ошибка обновления прогресса (${this.config.id}):`, error);
            this.addConsoleMessage('⚠️ Не удалось сохранить прогресс, но уровень пройден!', 'player');
        }
        
        if (typeof syncLocalProfileAfterLevel === 'function') {
            syncLocalProfileAfterLevel(this.config.id);
        }
        
        setTimeout(() => {
            alert('🎉 Уровень 1.2 пройден!\n\n' +
                  'Вы освоили повороты дрона!\n' +
                  '✓ Научились использовать ПОВЕРНУТЬ_НАЛЕВО()\n' +
                  '✓ Научились использовать ПОВЕРНУТЬ_НАПРАВО()\n' +
                  '✓ Успешно обошли препятствия\n' +
                  '✓ Составили сложную программу\n\n' +
                  'Готовьтесь к финальной битве с боссом!');
            this.goToLevelMap();
        }, 800);
    }
}

// Глобальная переменная для доступа к экземпляру уровня
let level;

function initializeLevel() {
    level = new Level1_2();
    level.initialize();
}

// Глобальные функции для вызова из HTML
function runProgram() {
    if (level) level.runProgram();
}

function resetProgram() {
    if (level) level.resetProgram();
}

function goBack() {
    if (level) level.goBack();
}

function showHelp() {
    if (level) level.showHelp();
}

function goToLevelMap() {
    if (level) level.goToLevelMap();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeLevel);