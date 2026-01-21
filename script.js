// Глобальные переменные
let currentUser = null;
let usersData = null;
let testData = null;
let currentSection = null;
let currentStep = 0;
let userAnswers = [];

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'index.html' || currentPage === '') {
        initLoginPage();
    } else if (currentPage === 'main.html') {
        initMainPage();
    } else if (currentPage === 'section.html') {
        initSectionPage();
    } else if (currentPage === 'learning.html') {
        initLearningPage();
    }
});

// Загрузка JSON данных
async function loadData() {
    try {
        const usersResponse = await fetch('users.json');
        const initialUsersData = await usersResponse.json();
        
        // Проверяем, есть ли сохраненные данные в localStorage
        const savedUsersData = localStorage.getItem('usersData');
        if (savedUsersData) {
            usersData = JSON.parse(savedUsersData);
        } else {
            usersData = initialUsersData;
            localStorage.setItem('usersData', JSON.stringify(usersData));
        }
        
        const testResponse = await fetch('test.json');
        testData = await testResponse.json();
        
        // Восстановление текущего пользователя из sessionStorage
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            // Обновляем данные пользователя из актуальных данных
            const userIndex = usersData.users.findIndex(u => u.login === parsedUser.login);
            if (userIndex !== -1) {
                currentUser = usersData.users[userIndex];
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            } else {
                currentUser = parsedUser;
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

// Сохранение данных пользователей
async function saveUsersData() {
    // В реальном приложении здесь был бы запрос к серверу
    // Для локального использования сохраняем в localStorage
    localStorage.setItem('usersData', JSON.stringify(usersData));
}

// Инициализация страницы входа
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;
        
        const user = usersData.users.find(u => u.login === login && u.password === password);
        
        if (user) {
            currentUser = user;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'main.html';
        } else {
            errorMessage.textContent = 'Неверный логин или пароль';
            errorMessage.classList.add('show');
        }
    });
}

// Инициализация главной страницы
function initMainPage() {
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Обновление данных пользователя из актуальных данных
    const userIndex = usersData.users.findIndex(u => u.login === currentUser.login);
    if (userIndex !== -1) {
        currentUser = usersData.users[userIndex];
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    const sectionButtons = document.querySelectorAll('.section-btn');
    
    sectionButtons.forEach(btn => {
        const sectionName = btn.getAttribute('data-section');
        const checkmark = document.getElementById(`check-${sectionName}`);
        
        if (currentUser.sections[sectionName] && currentUser.sections[sectionName].completed) {
            checkmark.style.display = 'inline';
        }
        
        btn.addEventListener('click', () => {
            sessionStorage.setItem('currentSection', sectionName);
            window.location.href = 'section.html';
        });
    });
}

// Инициализация страницы раздела
function initSectionPage() {
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Обновление данных пользователя из актуальных данных
    const userIndex = usersData.users.findIndex(u => u.login === currentUser.login);
    if (userIndex !== -1) {
        currentUser = usersData.users[userIndex];
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    currentSection = sessionStorage.getItem('currentSection') || 'участок 1';
    
    const sectionData = currentUser.sections[currentSection];
    
    document.getElementById('sectionTitle').textContent = currentSection;
    document.getElementById('attemptsCount').textContent = sectionData.attempts || 0;
    document.getElementById('completedStatus').textContent = sectionData.completed ? 'Да' : 'Нет';
    
    const startLearningBtn = document.getElementById('startLearningBtn');
    const sendCertificateBtn = document.getElementById('sendCertificateBtn');
    
    if (sectionData.completed) {
        startLearningBtn.disabled = true;
        sendCertificateBtn.disabled = false;
    } else {
        startLearningBtn.disabled = false;
        sendCertificateBtn.disabled = true;
    }
    
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'main.html';
    });
    
    startLearningBtn.addEventListener('click', () => {
        sessionStorage.setItem('currentSection', currentSection);
        window.location.href = 'learning.html';
    });
    
    sendCertificateBtn.addEventListener('click', () => {
        alert('Сертификат отправлен');
    });
}

// Инициализация страницы обучения
function initLearningPage() {
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    currentSection = sessionStorage.getItem('currentSection') || 'участок 1';
    currentStep = 0;
    userAnswers = [];
    
    document.getElementById('learningTitle').textContent = currentSection;
    
    const continueBtn = document.getElementById('continueBtn');
    continueBtn.disabled = false;
    
    continueBtn.addEventListener('click', () => {
        handleContinue();
    });
    
    // Обработка просмотра видео
    document.addEventListener('play', (e) => {
        if (e.target.tagName === 'VIDEO') {
            const video = e.target;
            video.addEventListener('ended', () => {
                continueBtn.disabled = false;
            });
        }
    }, true);
}

// Обработка нажатия кнопки "Продолжить"
function handleContinue() {
    const continueBtn = document.getElementById('continueBtn');
    const workArea = document.getElementById('workArea');
    
    if (currentStep === 0) {
        // Шаг 1: Видео video.mp4
        currentStep = 1;
        updateProgressCircle(1);
        continueBtn.disabled = true;
        workArea.innerHTML = `
            <h2>Пункт 1</h2>
            <video controls>
                <source src="video.mp4" type="video/mp4">
                Ваш браузер не поддерживает видео.
            </video>
        `;
    } else if (currentStep === 1) {
        // Шаг 2: Картинка picture1.jpg
        currentStep = 2;
        updateProgressCircle(2);
        workArea.innerHTML = `
            <img src="picture1.jpg" alt="Изображение" id="zoomableImage">
            <p>Второй этап</p>
        `;
        setupImageZoom();
    } else if (currentStep === 2) {
        // Шаг 3: Картинка picture1.jpg (повтор)
        currentStep = 3;
        updateProgressCircle(3);
        workArea.innerHTML = `
            <img src="picture1.jpg" alt="Изображение" id="zoomableImage">
            <p>Второй этап</p>
        `;
        setupImageZoom();
    } else if (currentStep === 3) {
        // Шаг 4: Видео video2.mp4
        currentStep = 4;
        updateProgressCircle(4);
        continueBtn.disabled = true;
        workArea.innerHTML = `
            <h2>Пункт 4</h2>
            <video controls>
                <source src="video2.mp4" type="video/mp4">
                Ваш браузер не поддерживает видео.
            </video>
        `;
    } else if (currentStep === 4) {
        // Шаг 5: Вопрос 1
        currentStep = 5;
        updateProgressCircle(5);
        continueBtn.disabled = true;
        showQuestion(1);
    } else if (currentStep === 5) {
        // Переход к вопросу 2
        currentStep = 6;
        continueBtn.disabled = true;
        showQuestion(2);
    } else if (currentStep === 6) {
        // Проверка ответов
        checkAnswers();
    }
}

// Обновление индикатора прогресса
function updateProgressCircle(step) {
    for (let i = 1; i <= step; i++) {
        const circle = document.getElementById(`circle${i}`);
        circle.classList.add('completed');
    }
}

// Настройка увеличения изображения
function setupImageZoom() {
    const image = document.getElementById('zoomableImage');
    if (image) {
        image.addEventListener('click', () => {
            if (image.classList.contains('fullscreen')) {
                image.classList.remove('fullscreen');
            } else {
                image.classList.add('fullscreen');
            }
        });
    }
}

// Показ вопроса
function showQuestion(questionNum) {
    const workArea = document.getElementById('workArea');
    const continueBtn = document.getElementById('continueBtn');
    
    workArea.innerHTML = `
        <div class="question-container">
            <h3>Вопрос ${questionNum}</h3>
            <div class="options">
                <button class="option-btn" data-option="1">Вариант 1</button>
                <button class="option-btn" data-option="2">Вариант 2</button>
                <button class="option-btn" data-option="3">Вариант 3</button>
                <button class="option-btn" data-option="4">Вариант 4</button>
            </div>
        </div>
    `;
    
    const optionButtons = workArea.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            optionButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            userAnswers[questionNum - 1] = parseInt(btn.getAttribute('data-option'));
            continueBtn.disabled = false;
        });
    });
}

// Проверка ответов
function checkAnswers() {
    const sectionTests = testData[currentSection];
    const questions = sectionTests.questions;
    
    let correctCount = 0;
    const totalQuestions = questions.length;
    
    for (let i = 0; i < totalQuestions; i++) {
        if (userAnswers[i] === questions[i].correct) {
            correctCount++;
        }
    }
    
    const modal = document.getElementById('resultModal');
    const resultText = document.getElementById('resultText');
    const resultTitle = document.getElementById('resultTitle');
    const certificateButtons = document.getElementById('certificateButtons');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    resultText.textContent = `Количество вопросов: ${totalQuestions}\nКоличество правильных ответов: ${correctCount}`;
    
    // Обновление данных пользователя
    const userIndex = usersData.users.findIndex(u => u.login === currentUser.login);
    if (userIndex !== -1) {
        usersData.users[userIndex].sections[currentSection].attempts++;
        
        if (correctCount === totalQuestions) {
            usersData.users[userIndex].sections[currentSection].completed = true;
            certificateButtons.style.display = 'block';
            closeModalBtn.style.display = 'none';
        } else {
            certificateButtons.style.display = 'none';
            closeModalBtn.style.display = 'block';
        }
        
        currentUser = usersData.users[userIndex];
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        saveUsersData();
    }
    
    modal.style.display = 'flex';
    
    // Обработка кнопок модального окна
    document.getElementById('yesBtn').onclick = () => {
        alert('Сертификат отправлен');
        modal.style.display = 'none';
        window.location.href = 'section.html';
    };
    
    document.getElementById('noBtn').onclick = () => {
        modal.style.display = 'none';
        window.location.href = 'section.html';
    };
    
    closeModalBtn.onclick = () => {
        modal.style.display = 'none';
        window.location.href = 'section.html';
    };
}
