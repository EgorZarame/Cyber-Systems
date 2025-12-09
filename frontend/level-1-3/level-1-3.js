// frontend/level-1-3/level-1-3.js
class Level1_3 extends LevelBase {
    constructor() {
        super({
            id: '1.boss',
            title: 'Босс - Сбойный дрон',
            gridSizeX: 10,
            gridSizeY: 6,
            start: { x: 1, y: 3 },
            finish: { x: 8, y: 3 },
            bossPosition: { x: 8, y: 3 },
            bossHealth: 100,
            obstacles: [
                { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, 
                { x: 3, y: 4 }, { x: 3, y: 5 },
                { x: 4, y: 3 }, { x: 5, y: 3 }, 
                { x: 6, y: 3 }, { x: 7, y: 3 }
            ]
        });

        this.boss = {
            health: this.config.bossHealth,
            position: this.config.bossPosition,
            isActive: true
        };
        
        this.drone.hasAttacked = false;
        this.bossAttacks = 0;
        this.maxBossAttacks = 3;
    }

    initialize() {
        super.initialize();
        this.addConsoleMessage('⚔️ ФИНАЛЬНАЯ БИТВА', 'boss');
        this.addConsoleMessage('Босс: Сбойный дрон', 'boss');
        this.addConsoleMessage('Здоровье босса: 100 HP', 'boss');
        this.updateBossHealth();
        this.addBossToGrid();
    }

    createGridCell(x, y) {
        const cell = super.createGridCell(x, y);
        
        if (x === this.config.bossPosition.x && y === this.config.bossPosition.y) {
            cell.classList.add('finish', 'boss-area');
            cell.id = 'bossCell';
        } else if (this.config.obstacles.some(obs => obs.x === x && obs.y === y)) {
            cell.classList.add('obstacle');
        }
        
        return cell;
    }

    addBossToGrid() {
        const bossCell = document.getElementById('bossCell');
        if (bossCell) {
            const bossElement = document.createElement('div');
            bossElement.className = 'boss-drone';
            bossElement.id = 'bossDrone';
            bossCell.appendChild(bossElement);
        }
    }

    canMoveTo(x, y) {
        const hasObstacle = this.config.obstacles.some(obs => obs.x === x && obs.y === y);
        return super.canMoveTo(x, y) && !hasObstacle;
    }

    async runProgram() {
        if (this.isExecuting) return;
        
        if (this.programBlocks.length === 0) {
            this.addConsoleMessage('❌ Ошибка: программа пуста!', 'player');
            return;
        }

        this.isExecuting = true;
        this.resetDrone();
        this.addConsoleMessage('⚡ Запуск боевой программы...', 'player');

        for (const block of this.programBlocks) {
            if (!this.isExecuting || !this.boss.isActive) break;
            
            await this.executeAction(block);
            await new Promise(resolve => setTimeout(resolve, 600));
            
            // Случайная атака босса (реже, чтобы не перегружать игрока)
            if (this.boss.isActive && Math.random() < 0.3 && this.bossAttacks < this.maxBossAttacks) {
                await this.bossAttack();
                this.bossAttacks++;
            }
        }
        
        if (this.isExecuting && this.boss.isActive) {
            this.addConsoleMessage('🛑 Программа завершена', 'player');
            this.addConsoleMessage('💀 Босс все еще жив!', 'boss');
            this.isExecuting = false;
            
            setTimeout(() => {
                alert('❌ Босс не побежден!\n\nПопробуйте другую тактику.');
                this.resetProgram();
            }, 1000);
        }
    }

    async attackBoss() {
        // Проверяем, находится ли дрон рядом с боссом
        const distance = Math.abs(this.drone.x - this.boss.position.x) + 
                        Math.abs(this.drone.y - this.boss.position.y);
        
        if (distance <= 1) {
            const damage = 25 + Math.floor(Math.random() * 15); // 25-40 урона
            this.boss.health = Math.max(0, this.boss.health - damage);
            this.drone.hasAttacked = true;
            
            this.updateBossHealth();
            this.addConsoleMessage(`💥 Атака! Нанесено ${damage} урона!`, 'player');
            
            // Анимация атаки
            const bossElement = document.getElementById('bossDrone');
            if (bossElement) {
                bossElement.style.animation = 'none';
                bossElement.style.filter = 'brightness(2)';
                setTimeout(() => {
                    if (this.boss.isActive) {
                        bossElement.style.animation = 'bossFloat 3s infinite ease-in-out';
                        bossElement.style.filter = '';
                    }
                }, 200);
            }
            
            if (this.boss.health <= 0) {
                await this.defeatBoss();
            }
        } else {
            this.addConsoleMessage('❌ Босс слишком далеко!', 'player');
            this.addConsoleMessage('😈 Не достанешь!', 'boss');
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async bossAttack() {
        if (!this.boss.isActive) return;
        
        const attacks = [
            '🔄 Босс создает помехи!',
            '⚡ Сбойный дрон активирует защиту!',
            '💢 Атака босса!',
            '🔴 Босс вызывает подкрепление!'
        ];
        
        const attackText = attacks[Math.floor(Math.random() * attacks.length)];
        this.addConsoleMessage(attackText, 'boss');
        
        // Простое сообщение для игрока
        this.addConsoleMessage('⚠️ Внимание! Атака босса!', 'player');
        
        // Визуальный эффект атаки босса
        const gameGrid = document.getElementById('gameGrid');
        if (gameGrid) {
            gameGrid.style.borderColor = '#ff0000';
            gameGrid.style.boxShadow = '0 0 20px #ff0000';
            setTimeout(() => {
                if (this.boss.isActive) {
                    gameGrid.style.borderColor = '';
                    gameGrid.style.boxShadow = '';
                }
            }, 500);
        }
        
        await new Promise(resolve => setTimeout(resolve, 700));
    }

    async defeatBoss() {
        this.boss.isActive = false;
        this.boss.health = 0;
        this.updateBossHealth();
        
        this.addConsoleMessage('🎉 БОСС ПОБЕЖДЁН!', 'success');
        this.addConsoleMessage('✨ СИСТЕМА ВОССТАНОВЛЕНА!', 'success');
        
        // Анимация победы
        const bossElement = document.getElementById('bossDrone');
        if (bossElement) {
            bossElement.style.animation = 'none';
            bossElement.style.background = '#4CAF50';
            bossElement.style.boxShadow = '0 0 20px #4CAF50';
            bossElement.innerHTML = '✅';
            bossElement.style.fontSize = '16px';
        }
        
        this.isExecuting = false;
        
        setTimeout(() => {
            this.completeLevel();
        }, 2000);
    }

    updateBossHealth() {
        const healthBar = document.getElementById('bossHealth');
        const healthText = document.getElementById('healthText');
        const healthPercent = this.boss.health;
        
        if (healthBar) {
            healthBar.style.width = `${healthPercent}%`;
            
            // Изменяем цвет в зависимости от здоровья
            if (healthPercent <= 25) {
                healthBar.style.background = 'linear-gradient(90deg, #ff0000, #ff4444)';
            } else if (healthPercent <= 50) {
                healthBar.style.background = 'linear-gradient(90deg, #ff8800, #ffaa44)';
            } else {
                healthBar.style.background = 'linear-gradient(90deg, #ff0000, #ff4444)';
            }
        }
        
        if (healthText) {
            healthText.textContent = `${healthPercent}%`;
            
            if (healthPercent <= 25) {
                healthText.style.color = '#ff0000';
                healthText.style.fontWeight = 'bold';
            } else if (healthPercent <= 50) {
                healthText.style.color = '#ff8800';
            } else {
                healthText.style.color = '#ffffff';
            }
        }
    }

    resetDrone() {
        super.resetDrone();
        this.drone.hasAttacked = false;
        this.bossAttacks = 0;
    }

    resetProgram() {
        super.resetProgram();
        this.resetBoss();
    }

    resetBoss() {
        this.boss.health = this.config.bossHealth;
        this.boss.isActive = true;
        this.updateBossHealth();
        this.bossAttacks = 0;
        
        const bossElement = document.getElementById('bossDrone');
        if (bossElement) {
            bossElement.style.background = '#ff4444';
            bossElement.style.boxShadow = '0 0 15px #ff0000';
            bossElement.style.animation = 'bossFloat 3s infinite ease-in-out';
            bossElement.style.filter = '';
            bossElement.innerHTML = '☠️';
            bossElement.style.fontSize = '12px';
        }
    }

    checkLevelComplete() {
        return !this.boss.isActive;
    }

    getWelcomeMessage() {
        return '⚠️ Обнаружен сбойный дрон!';
    }

    showHelp() {
        alert('🏆 УРОВЕНЬ БОССА: Сбойный дрон\n\n' +
              'Цель: Уничтожьте босса (100 HP)\n\n' +
              'Как победить:\n' +
              '1. Доберитесь до красной клетки с боссом\n' +
              '2. Используйте АТАКОВАТЬ_БОССА() когда рядом\n' +
              '3. Атакуйте 4 раза (по 25-40 урона за раз)\n\n' +
              'Советы:\n' +
              '• Обходите красные препятствия\n' +
              '• Босс может атаковать в ответ\n' +
              '• Используйте 7 раз ДВИГАТЬСЯ_ВПЕРЕД() чтобы добраться до босса\n\n' +
              'Оптимальная программа:\n' +
              'ДВИГАТЬСЯ_ВПЕРЕД() ×7\n' +
              'АТАКОВАТЬ_БОССА() ×4');
    }

    async completeLevel() {
        this.isExecuting = false;
        
        try {
            await updateProgress(this.config.id);
            this.addConsoleMessage('⭐ Прогресс сохранен!', 'success');
        } catch (error) {
            console.error(`Ошибка обновления прогресса (${this.config.id}):`, error);
            this.addConsoleMessage('⚠️ Прогресс сохранен локально', 'player');
        }
        
        if (typeof syncLocalProfileAfterLevel === 'function') {
            syncLocalProfileAfterLevel(this.config.id);
        }
        
        setTimeout(() => {
            alert('🎊 ПОБЕДА!\n\n' +
                  'Вы победили сбойного дрона!\n' +
                  'Киберсистема восстановлена!\n\n' +
                  '🏆 ПОВЫШЕНИЕ ДО JUNIOR-ПРОГРАММИСТА!');
            this.goToLevelMap();
        }, 1000);
    }
}

// Глобальная переменная для доступа к экземпляру уровня
let level;

function initializeLevel() {
    level = new Level1_3();
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