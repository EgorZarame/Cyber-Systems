// Логика главного меню
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Главное меню загружено');
    
    // Загрузка прогресса игрока
    const progress = JSON.parse(localStorage.getItem('gameProgress') || '{}');
    
    // Обновление индикатора карьеры
    updateCareerProgress(progress.currentLevel || '1.1');
});

function updateCareerProgress(currentLevel) {
    const stages = document.querySelectorAll('.career-stage');
    const levelNum = parseInt(currentLevel);
    
    stages.forEach((stage, index) => {
        stage.classList.remove('active');
        if (index < levelNum) {
            stage.classList.add('active');
        }
    });
}