let registerMode = false;

const form = document.getElementById('authForm');
const errorBox = document.getElementById('error');
const submitButton = document.getElementById('submit');
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');

function setMode(register) {
    registerMode = register;
    tabLogin.classList.toggle('active', !register);
    tabRegister.classList.toggle('active', register);
    submitButton.textContent = register ? 'Создать аккаунт' : 'Войти';
    document.getElementById('password').autocomplete = register ? 'new-password' : 'current-password';
    errorBox.textContent = '';
}

tabLogin.addEventListener('click', () => setMode(false));
tabRegister.addEventListener('click', () => setMode(true));

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.textContent = '';
    submitButton.disabled = true;

    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value;

    try {
        if (registerMode) {
            await AuthService.register(login, password);
        } else {
            await AuthService.login(login, password);
        }
        await LocalStorageService.syncFromServer();
        window.location.href = '../home/index.html';
    } catch (error) {
        errorBox.textContent = error.message;
    } finally {
        submitButton.disabled = false;
    }
});

// уже вошли раньше, сразу в игру
if (Session.isLoggedIn()) {
    window.location.href = '../home/index.html';
}
