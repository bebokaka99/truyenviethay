export function initManageUsers(page = 1) {
    fetch('/truyenviethay/api/api.php?action=profile')
        .then(res => res.json())
        .then(data => {
            if (!data.success || data.data.role !== 'admin') {
                window.location.href = data.redirect || '/truyenviethay/users/login.html';
                return;
            }
            loadUsers(page);
        })
        .catch(error => {
            console.error('Lỗi khi kiểm tra quyền admin:', error);
            window.location.href = '/truyenviethay/users/login.html';
        });
}

function loadUsers(page, retryCount = 0) {
    const maxRetries = 3;
    const roleFilter = document.getElementById('filter-role').value;
    const statusFilter = document.getElementById('filter-status').value;
    const searchQuery = document.getElementById('search-input').value;

    fetch(`/truyenviethay/api/api.php?action=manage_users&subaction=list&page=${page}&role=${roleFilter}&status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`)
        .then(res => {
            if (!res.ok) throw new Error('Phản hồi từ server không ổn: ' + res.status);
            return res.text();
        })
        .then(text => {
            try {
                const data = JSON.parse(text);
                if (!data.success) {
                    document.getElementById('users-list').innerHTML = `<tr><td colspan="7">${data.error || 'Không thể tải danh sách người dùng.'}</td></tr>`;
                    return;
                }
                const tbody = document.querySelector('#users-list tbody');
                tbody.innerHTML = data.users.length ? '' : '<tr><td colspan="7">Không có người dùng nào.</td></tr>';
                data.users.forEach(user => {
                    const banUntil = user.ban_until ? new Date(user.ban_until).toLocaleString('vi-VN') : '';
                    tbody.innerHTML += `
                        <tr>
                            <td><img src="../${user.avatar}" alt="${user.username}" class="user-avatar-small" style="width: 30px; height: 30px; object-fit: cover;"></td>
                            <td>${user.username}</td>
                            <td>${user.full_name}</td>
                            <td>${user.role || 'user'}</td>
                            <td>${new Date(user.signup_date).toLocaleDateString('vi-VN')}</td>
                            <td>${user.status === 'active' || !user.status ? 'Active' : `Blocked${banUntil ? ` (đến ${banUntil})` : ' (vĩnh viễn)'}`}</td>
                            <td>
                                <button class="action-btn detail-btn" onclick="showUserDetail(${user.id})">Xem chi tiết</button>
                                ${user.status === 'active' || !user.status ? 
                                    `<select class="ban-duration" onchange="if(this.value) banUser(${user.id}, this.value)"><option value="">Khóa</option><option value="1">1 ngày</option><option value="3">3 ngày</option><option value="7">7 ngày</option><option value="30">1 tháng</option><option value="365">1 năm</option><option value="3650">10 năm</option><option value="forever">Vĩnh viễn</option></select>` : 
                                    `<button class="action-btn unban-btn" onclick="unbanUser(${user.id})">Mở khóa</button>`}
                                <button class="action-btn role-btn"><select onchange="changeRole(${user.id}, this.value)"><option value="${user.role || 'user'}" selected>${user.role || 'user'}</option><option value="user">user</option><option value="author">author</option><option value="admin">admin</option></select></button>
                            </td>
                        </tr>`;
                });

                const pageInfo = document.getElementById('page-info');
                pageInfo.textContent = `Trang ${data.current_page} / ${data.total_pages}`;
                document.getElementById('prev-page').disabled = data.current_page === 1;
                document.getElementById('next-page').disabled = data.current_page === data.total_pages;

                document.getElementById('prev-page').onclick = () => loadUsers(data.current_page - 1);
                document.getElementById('next-page').onclick = () => loadUsers(data.current_page + 1);
            } catch (e) {
                console.error('Response không phải JSON:', text);
                if (retryCount < maxRetries) {
                    console.log(`Thử lại lần ${retryCount + 1}/${maxRetries}...`);
                    setTimeout(() => loadUsers(page, retryCount + 1), 1000);
                    return;
                }
                throw new Error('Parse JSON thất bại: ' + e.message);
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải danh sách người dùng:', error);
            document.getElementById('users-list').innerHTML = '<tr><td colspan="7">Có lỗi xảy ra khi tải dữ liệu.</td></tr>';
        });

    document.getElementById('search-btn').onclick = () => loadUsers(1);
    document.getElementById('search-input').onkeypress = (e) => { if (e.key === 'Enter') loadUsers(1); };
}

window.showUserDetail = function(userId) {
    fetch(`/truyenviethay/api/api.php?action=manage_users&subaction=detail&user_id=${userId}`)
        .then(res => res.json())
        .then(data => {
            if (!data.success) return alert(data.error || 'Không thể tải chi tiết.');
            const user = data.user;
            document.getElementById('user-detail-content').innerHTML = `
                <h3>${user.full_name} (@${user.username})</h3>
                <p>Email: ${user.email}</p>
                <p>Số điện thoại: ${user.phone || 'Chưa cập nhật'}</p>
            `;
            document.getElementById('user-detail-modal').style.display = 'block';
        })
        .catch(error => {
            console.error('Lỗi khi tải chi tiết người dùng:', error);
            alert('Có lỗi xảy ra khi tải chi tiết.');
        });
};

window.closeUserDetailModal = function() {
    document.getElementById('user-detail-modal').style.display = 'none';
};

window.banUser = function(userId, days) {
    const actionText = days === 'forever' ? 'khóa vĩnh viễn' : `khóa ${days} ngày`;
    if (!confirm(`Bạn có chắc muốn ${actionText} tài khoản này không?`)) return;
    fetch('/truyenviethay/api/api.php?action=manage_users&subaction=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `subaction=update&user_id=${userId}&status=blocked&ban_days=${days}`
    })
        .then(res => {
            if (!res.ok) throw new Error('Phản hồi từ server không ổn: ' + res.status);
            return res.json();
        })
        .then(data => {
            alert(data.message || data.error);
            if (data.success) {
                setTimeout(() => loadUsers(1), 1000); // Tăng delay lên 1s và luôn load trang 1
            }
        })
        .catch(error => {
            console.error('Lỗi khi khóa tài khoản:', error);
            alert('Có lỗi xảy ra khi khóa tài khoản.');
        });
};

window.unbanUser = function(userId) {
    if (!confirm('Bạn có chắc muốn mở khóa tài khoản này không?')) return;
    fetch('/truyenviethay/api/api.php?action=manage_users&subaction=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `subaction=update&user_id=${userId}&status=active&ban_days=null`
    })
        .then(res => {
            if (!res.ok) throw new Error('Phản hồi từ server không ổn: ' + res.status);
            return res.json();
        })
        .then(data => {
            alert(data.message || data.error);
            if (data.success) {
                setTimeout(() => loadUsers(1), 1000); // Tăng delay lên 1s và luôn load trang 1
            }
        })
        .catch(error => {
            console.error('Lỗi khi mở khóa tài khoản:', error);
            alert('Có lỗi xảy ra khi mở khóa tài khoản.');
        });
};

window.changeRole = function(userId, role) {
    if (!confirm(`Bạn có chắc muốn thay đổi vai trò thành ${role} không?`)) return;
    fetch('/truyenviethay/api/api.php?action=manage_users&subaction=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `subaction=update&user_id=${userId}&role=${role}`
    })
        .then(res => {
            if (!res.ok) throw new Error('Phản hồi từ server không ổn: ' + res.status);
            return res.json();
        })
        .then(data => {
            alert(data.message || data.error);
            if (data.success) {
                setTimeout(() => loadUsers(1), 1000); // Tăng delay lên 1s và luôn load trang 1
            }
        })
        .catch(error => {
            console.error('Lỗi khi thay đổi vai trò:', error);
            alert('Có lỗi xảy ra khi thay đổi vai trò.');
        });
};