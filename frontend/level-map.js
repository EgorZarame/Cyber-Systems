// Логика карты уровней
document.addEventListener('DOMContentLoaded', function() {
    console.log('🗺️ Карта уровней загружена');
    
    // Загрузка прогресса
    const progress = localStorage.getItem('cyberSystemsProgress');
    const currentLevel = progress ? JSON.parse(progress).currentLevel : '1.1';
    
    console.log('Текущий прогресс:', currentLevel);
    
    // Разблокировка уровней на основе прогресса
    unlockLevels(currentLevel);
    
    // Установка фонов для отделов
    setDepartmentBackgrounds();
});

function unlockLevels(currentLevel) {
    const levels = document.querySelectorAll('.level');
    const currentLevelNum = parseFloat(currentLevel);
    
    console.log('Разблокировка уровней до:', currentLevelNum);
    
    levels.forEach(level => {
        const levelNum = parseFloat(level.dataset.level);
        
        if (levelNum <= currentLevelNum) {
            level.classList.remove('locked');
            level.classList.add('unlocked');
        } else {
            level.classList.remove('unlocked');
            level.classList.add('locked');
        }
    });
    
    // Разблокировка отделов
    if (currentLevelNum >= 1.3) {
        document.getElementById('security-department')?.classList.remove('locked');
    }
    if (currentLevelNum >= 2.3) {
        document.getElementById('core-department')?.classList.remove('locked');
    }
}

// === ФУНКЦИЯ ДЛЯ ФОНОВ ОТДЕЛОВ ===
function setDepartmentBackgrounds() {
    const progress = JSON.parse(localStorage.getItem('cyberSystemsProgress') || '{}');
    const currentLevel = progress.currentLevel || '1.1';
    
    console.log('🎨 Установка фонов для уровня:', currentLevel);
    
    // Устанавливаем разные фоны для отделов
    const dronesDept = document.getElementById('drones-department');
    const securityDept = document.getElementById('security-department'); 
    const coreDept = document.getElementById('core-department');
    
    // Фон отдела дронов (всегда активен)
    if (dronesDept) {
        dronesDept.style.backgroundImage = "url('assets/images/backgrounds/drones-department-bg.png')";
        dronesDept.style.backgroundSize = "cover";
        dronesDept.style.backgroundPosition = "center";
    }
    
    // Фон охранных систем (разблокируется с уровня 2.1)
    if (securityDept && parseFloat(currentLevel) >= 2.1) {
        securityDept.style.backgroundImage = "url('assets/images/backgrounds/security-department-bg.png')";
        securityDept.style.backgroundSize = "cover";
        securityDept.style.backgroundPosition = "center";
    }
    
    // Фон центрального ядра (разблокируется с уровня 3.1)
    if (coreDept && parseFloat(currentLevel) >= 3.1) {
        coreDept.style.backgroundImage = "url('assets/images/backgrounds/core-department-bg.png')";
        coreDept.style.backgroundSize = "cover";
        coreDept.style.backgroundPosition = "center";
    }
}

function startLevel(levelId) {
    const level = document.querySelector(`[data-level="${levelId}"]`);
    
    if (level.classList.contains('locked')) {
        alert('Уровень заблокирован! Пройди предыдущие уровни.');
        return;
    }
    
    console.log('🚀 Запуск уровня:', levelId);
    
    // Сохраняем выбранный уровень
    localStorage.setItem('currentLevel', levelId);
    
    // Переход к игре
    window.location.href = 'level-1.1.html'; // Пока все ведут на 1.1
}