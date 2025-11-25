const express = require('express');
const app = express();
const path = require('path');

// Раздаем статические файлы из текущей директории
app.use(express.static(__dirname));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🎮 Сервер запущен на http://localhost:${PORT}`);
});