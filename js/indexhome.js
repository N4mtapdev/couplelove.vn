// Hàm lấy cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Kiểm tra trạng thái đăng nhập khi tải trang
window.onload = () => {
    const loggedInUser = getCookie('loggedInUser');
    const userType = getCookie('userType');

    if (loggedInUser && userType) {
        document.getElementById('hero').style.display = 'block';
        document.getElementById('services').style.display = 'block';
        document.getElementById('welcome').style.display = 'block';
        document.getElementById('welcome-message').textContent = `Chào mừng ${loggedInUser}! Loại tài khoản: ${userType}`;
    } else {
        document.getElementById('hero').style.display = 'block';
        document.getElementById('services').style.display = 'block';
        showAuthModal(); // Mở modal mặc định nếu chưa đăng nhập
    }
    toggleProCode();
};

// Hiển thị/ẩn modal
function showAuthModal() {
    document.getElementById('auth-overlay').style.display = 'block';
    document.getElementById('auth-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('auth-modal').style.display = 'none';
}

// Chuyển đổi giữa đăng ký và đăng nhập
function toggleAuthForm() {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const authTitle = document.getElementById('auth-title');
    const toggleText = document.getElementById('toggle-text');

    if (signupForm.style.display === 'block') {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        authTitle.textContent = 'Đăng Nhập';
        toggleText.textContent = 'Đăng Ký';
    } else {
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
        authTitle.textContent = 'Đăng Ký';
        toggleText.textContent = 'Đăng Nhập';
    }
}

// Hiển thị/ẩn input mã Pro dựa trên lựa chọn
function toggleProCode() {
    const accountType = document.getElementById('signup-account-type').value;
    const proCodeDiv = document.querySelector('.pro-code');
    if (accountType === 'Pro') {
        proCodeDiv.style.display = 'block';
    } else {
        proCodeDiv.style.display = 'none';
        document.getElementById('pro-code').value = '';
    }
}

// Xử lý khi reCAPTCHA được xác minh
let captchaToken = null;
function onCaptchaVerified(token) {
    captchaToken = token;
    document.getElementById('signup-button').disabled = false;
}

async function handleSignup() {
    if (!captchaToken) {
        alert('Vui lòng hoàn tất xác minh reCAPTCHA!');
        return;
    }

    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const accountType = document.getElementById('signup-account-type').value;
    let proCode = '';

    if (!username || !password || !accountType) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    if (accountType === 'Pro') {
        proCode = document.getElementById('pro-code').value;
        if (!proCode) {
            alert('Vui lòng nhập mã Pro từ admin!');
            return;
        }
    }

    const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, accountType, proCode, captchaToken })
    });

    const result = await response.json();
    alert(result.message);
    if (result.success) {
        document.getElementById('signup-username').value = '';
        document.getElementById('signup-password').value = '';
        document.getElementById('signup-account-type').value = '';
        document.getElementById('pro-code').value = '';
        captchaToken = null;
        document.getElementById('signup-button').disabled = true;
        closeModal();
        window.location.reload();
    }
}

async function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    alert(result.message);
    if (result.success) {
        document.cookie = `loggedInUser=${username}; path=/`;
        document.cookie = `userType=${result.userType}; path=/`;
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        closeModal();
        window.location.reload();
    }
}

function handleLogout() {
    document.cookie = 'loggedInUser=; Max-Age=-1; path=/';
    document.cookie = 'userType=; Max-Age=-1; path=/';
    window.location.reload();
}

// Xử lý toggle card
let activeCard = null;

function toggleCard(card) {
    const isExpanded = card.classList.contains('expanded');

    if (isExpanded) {
        card.classList.remove('expanded');
        card.querySelector('button').style.display = 'none';
        card.querySelector('.experience-btn').style.display = 'none';
        activeCard = null;
    } else {
        card.classList.add('expanded');
        card.querySelector('button').style.display = 'inline-block';
        card.querySelector('.experience-btn').style.display = 'inline-block';
        activeCard = card;
    }
}

// Thu nhỏ card khi nhấp ra ngoài
document.addEventListener('click', (event) => {
    const services = document.getElementById('services');
    const isClickInside = services.contains(event.target);

    if (!isClickInside && activeCard) {
        activeCard.classList.remove('expanded');
        activeCard.querySelector('button').style.display = 'none';
        activeCard.querySelector('.experience-btn').style.display = 'none';
        activeCard = null;
    }
});