document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const tg = window.Telegram.WebApp;
    
    // Инициализация Telegram Web App
    tg.expand();
    tg.setHeaderColor('#667eea');
    tg.setBackgroundColor('#667eea');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;
        
        if (!login || !password) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        // Отправляем данные в бот
        const data = {
            login: login,
            password: password
        };
        
        tg.sendData(JSON.stringify(data));
        tg.close();
    });
    
    // Автозаполнение для демо
    const demoButtons = `
        <div class="demo-buttons" style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button type="button" class="demo-btn" data-login="admin" data-password="admin123" style="flex: 1; padding: 8px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Admin</button>
            <button type="button" class="demo-btn" data-login="student" data-password="student123" style="flex: 1; padding: 8px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;">Student</button>
        </div>
    `;
    
    loginForm.insertAdjacentHTML('beforeend', demoButtons);
    
    // Обработка кликов по демо кнопкам
    document.querySelectorAll('.demo-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.getElementById('login').value = this.dataset.login;
            document.getElementById('password').value = this.dataset.password;
        });
    });
});