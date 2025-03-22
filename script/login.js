// script/login.js (giữ nguyên)
export function initLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const usernameError = document.getElementById('username-error');
        const passwordError = document.getElementById('password-error');
        const loginError = document.getElementById('login-error');

        usernameError.textContent = '';
        passwordError.textContent = '';
        loginError.style.display = 'none';

        if (!username) {
            usernameError.textContent = 'Vui lòng nhập tên đăng nhập.';
            return;
        }
        if (!password) {
            passwordError.textContent = 'Vui lòng nhập mật khẩu.';
            return;
        }

        fetch('/truyenviethay/api/api.php?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                if (data.user_id) {
                    localStorage.setItem("user_id", data.user_id); // Lưu user_id
                } else {
                    console.log("API không trả user_id, kiểm tra backend!");
                }
                window.location.href = data.redirect || '/truyenviethay/index.html';
            } else {
                loginError.textContent = data.error || 'Đã xảy ra lỗi';
                loginError.style.display = 'block';
            }
        })
        .catch(() => {
            loginError.textContent = 'Lỗi kết nối server';
            loginError.style.display = 'block';
        });
    });
}