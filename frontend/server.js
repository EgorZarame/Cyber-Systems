const express = require('express');
const app = express();
const path = require('path');

// Раздаем статические файлы
app.use(express.static(__dirname));

// Все маршруты ведут на главную страницу
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'home', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});