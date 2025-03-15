export function initSettings() {
    // Lấy thông tin người dùng khi trang tải
    fetch('/truyenviethay/api/settings.php?action=settings')
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                window.location.href = data.redirect || '/truyenviethay/users/login.html';
                return;
            }
            const user = data.data;

            // Ẩn các nút đăng nhập/đăng ký, hiển thị user info
            const loginLink = document.getElementById('login-link');
            const registerLink = document.getElementById('register-link');
            const loginBtn = document.getElementById('login-btn');
            const registerBtn = document.getElementById('register-btn');
            const userInfo = document.getElementById('user-info');
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'block';

            // Cập nhật avatar
            const userAvatar = document.getElementById('user-avatar');
            const profileAvatar = document.getElementById('user-profile-avatar');
            if (userAvatar) userAvatar.src = '../' + (user.avatar || 'anh/avatar-default.jpg');
            if (profileAvatar) profileAvatar.src = '../' + (user.avatar || 'anh/avatar-default.jpg');

            // Điền thông tin vào form
            const form = document.getElementById('settings-form');
            if (form) {
                form.elements['email'].value = user.email || '';
                form.elements['username'].value = user.username || '';
                form.elements['full_name'].value = user.full_name || '';
                form.elements['phone'].value = user.phone || '';

                // Xử lý radio giới tính
                const genderInputs = form.querySelectorAll('input[name="gender"]');
                if (genderInputs) {
                    genderInputs.forEach(input => {
                        if (input.value === user.gender) {
                            input.checked = true;
                        }
                    });
                }
            }
        })
        .catch(error => {
            console.error('Lỗi khi gọi API settings:', error);
        });

    // Xử lý preview avatar khi chọn file
    const avatarInput = document.getElementById('avatar');
    const fileNameSpan = document.getElementById('file-name');
    const previewImage = document.getElementById('user-profile-avatar');
    if (avatarInput && fileNameSpan && previewImage) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileNameSpan.textContent = file.name;

                // Preview ảnh
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    previewImage.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                fileNameSpan.textContent = 'Chưa có tệp nào được chọn';
            }
        });
    }

    // Xử lý nút "Đổi mật khẩu" và modal
    const changePasswordBtn = document.getElementById('change-password-btn');
    const changePasswordModal = document.getElementById('change-password-modal');
    const closeModalBtn = document.getElementById('close-password-modal');

    if (changePasswordBtn && changePasswordModal) {
        changePasswordBtn.addEventListener('click', () => {
            changePasswordModal.style.display = 'flex'; // Hiển thị modal
        });
    }

    if (closeModalBtn && changePasswordModal) {
        closeModalBtn.addEventListener('click', () => {
            changePasswordModal.style.display = 'none'; // Đóng modal
            // Reset thông báo và input
            const modalError = document.getElementById('modal-error');
            const modalSuccess = document.getElementById('modal-message');
            if (modalError) modalError.style.display = 'none';
            if (modalSuccess) modalSuccess.style.display = 'none';
            document.getElementsByName('current_password')[0].value = '';
            document.getElementsByName('new_password')[0].value = '';
            document.getElementsByName('confirm_password')[0].value = '';
        });
    }

    // Đóng modal khi bấm bên ngoài
    if (changePasswordModal) {
        changePasswordModal.addEventListener('click', (e) => {
            if (e.target === changePasswordModal) {
                changePasswordModal.style.display = 'none';
                // Reset thông báo và input
                const modalError = document.getElementById('modal-error');
                const modalSuccess = document.getElementById('modal-message');
                if (modalError) modalError.style.display = 'none';
                if (modalSuccess) modalSuccess.style.display = 'none';
                document.getElementsByName('current_password')[0].value = '';
                document.getElementsByName('new_password')[0].value = '';
                document.getElementsByName('confirm_password')[0].value = '';
            }
        });
    }

    // Xử lý nút "Lưu mật khẩu"
    const savePasswordBtn = document.getElementById('save-password-btn');
    if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', () => {
            const currentPassword = document.getElementsByName('current_password')[0].value;
            const newPassword = document.getElementsByName('new_password')[0].value;
            const confirmPassword = document.getElementsByName('confirm_password')[0].value;
            const modalError = document.getElementById('modal-error');
            const modalSuccess = document.getElementById('modal-message');

            // Reset thông báo
            if (modalError) modalError.style.display = 'none';
            if (modalSuccess) modalSuccess.style.display = 'none';

            // Kiểm tra các trường trống
            if (!currentPassword) {
                if (modalError) {
                    modalError.textContent = 'Vui lòng nhập mật khẩu hiện tại!';
                    modalError.style.display = 'block';
                }
                return;
            }
            if (!newPassword) {
                if (modalError) {
                    modalError.textContent = 'Vui lòng nhập mật khẩu mới!';
                    modalError.style.display = 'block';
                }
                return;
            }
            if (!confirmPassword) {
                if (modalError) {
                    modalError.textContent = 'Vui lòng nhập xác nhận mật khẩu!';
                    modalError.style.display = 'block';
                }
                return;
            }

            // Kiểm tra mật khẩu xác nhận
            if (newPassword !== confirmPassword) {
                if (modalError) {
                    modalError.textContent = 'Mật khẩu xác nhận không khớp!';
                    modalError.style.display = 'block';
                }
                return;
            }

            const formData = new FormData();
            formData.append('current_password', currentPassword);
            formData.append('new_password', newPassword);

            console.log('Sending request to API with data:', {
                current_password: currentPassword,
                new_password: newPassword
            });

            fetch('/truyenviethay/api/settings.php?action=change_password', {
                method: 'POST',
                body: formData
            })
            .then(res => {
                console.log('Response status:', res.status);
                return res.json();
            })
            .then(data => {
                console.log('API Response:', data);
                if (modalError && modalSuccess) {
                    modalError.style.display = 'none';
                    modalSuccess.style.display = 'none';

                    if (data.success) {
                        modalSuccess.textContent = 'Đổi mật khẩu thành công!';
                        modalSuccess.style.display = 'block';
                        // Thêm alert thông báo chuyển hướng
                        alert('Tự động chuyển hướng về đăng nhập trong 3 giây tới');
                        // Chuyển hướng sau 3 giây
                        setTimeout(() => {
                            window.location.href = '/truyenviethay/users/login.html';
                        }, 3000);
                    } else {
                        modalError.textContent = data.error || 'Lỗi không xác định';
                        modalError.style.display = 'block';
                    }
                }
            })
            .catch(error => {
                console.error('Lỗi khi đổi mật khẩu:', error);
                if (modalError) {
                    modalError.textContent = 'Lỗi khi gửi dữ liệu. Vui lòng thử lại.';
                    modalError.style.display = 'block';
                }
            });
        });
    }

    // Xử lý submit form
    const form = document.getElementById('settings-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            fetch('/truyenviethay/api/settings.php?action=settings', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                const messageDiv = document.getElementById('message');
                const errorDiv = document.getElementById('error');
                if (messageDiv) messageDiv.style.display = 'none';
                if (errorDiv) errorDiv.style.display = 'none';

                if (data.success) {
                    if (messageDiv) {
                        messageDiv.textContent = data.message;
                        messageDiv.style.display = 'block';
                    }
                    const user = data.data;
                    if (form) {
                        form.elements['email'].value = user.email || '';
                        form.elements['full_name'].value = user.full_name || '';
                        form.elements['phone'].value = user.phone || '';
                        const genderInputs = form.querySelectorAll('input[name="gender"]');
                        if (genderInputs) {
                            genderInputs.forEach(input => {
                                input.checked = (input.value === user.gender);
                            });
                        }
                    }
                    const userAvatar = document.getElementById('user-avatar');
                    const profileAvatar = document.getElementById('user-profile-avatar');
                    if (userAvatar) userAvatar.src = '../' + (user.avatar || 'anh/avatar-default.jpg');
                    if (profileAvatar) profileAvatar.src = '../' + (user.avatar || 'anh/avatar-default.jpg');
                    if (fileNameSpan) fileNameSpan.textContent = 'Chưa có tệp nào được chọn';
                } else if (data.errors) {
                    if (errorDiv) {
                        errorDiv.textContent = Object.values(data.errors)[0];
                        errorDiv.style.display = 'block';
                    }
                } else {
                    if (errorDiv) {
                        errorDiv.textContent = data.error || 'Lỗi không xác định';
                        errorDiv.style.display = 'block';
                    }
                }
            })
            .catch(error => {
                console.error('Lỗi khi gửi form:', error);
                const errorDiv = document.getElementById('error');
                if (errorDiv) {
                    errorDiv.textContent = 'Lỗi khi gửi dữ liệu. Vui lòng thử lại.';
                    errorDiv.style.display = 'block';
                }
            });
        });
    }
}