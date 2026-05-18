const express = require('express');
const app = express();
const path = require('path');

// Раздаем статические файлы из корня frontend
app.use(express.static(__dirname));

// Раздаем статические файлы из всех подпапок
app.use('/home', express.static(path.join(__dirname, 'home')));
app.use('/level-map', express.static(path.join(__dirname, 'level-map')));
app.use('/level-1-1', express.static(path.join(__dirname, 'level-1-1')));
//app.use('/sandbox', express.static(path.join(__dirname, 'sandbox')));

// Главная: редирект на /home/, чтобы относительные пути (main-page.js, assets) работали
app.get('/', (req, res) => {
    res.redirect('/home/index.html');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});