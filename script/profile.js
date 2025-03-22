// script/profile.js

export function initProfile() {
    fetch('/truyenviethay/api/api.php?action=profile')
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                window.location.href = data.redirect || '/truyenviethay/users/login.html';
                return;
            }
            const user = data.data;
            const role = user.role;

            document.getElementById('login-link').style.display = 'none';
            document.getElementById('register-link').style.display = 'none';
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('register-btn').style.display = 'none';
            const userInfo = document.getElementById('user-info');
            userInfo.style.display = 'block';
            document.getElementById('user-avatar').src = '../' + user.avatar;
            document.getElementById('large-avatar').src = '../' + user.avatar;
            document.getElementById('signup-date').textContent = `THAM GIA: ${user.signup_date}`;
            document.getElementById('signup-name').textContent = user.full_name || 'Chưa cập nhật';
            const roleBadge = document.getElementById('role-badge');
            roleBadge.className = `role-badge role-${role}`;
            roleBadge.innerHTML = `<i class="fas fa-${role === 'admin' ? 'crown' : (role === 'author' ? 'pen' : 'user')} role-icon"></i><span>${role === 'admin' ? 'Admin' : (role === 'author' ? 'Tác giả' : 'User')}</span>`;

            const levelSection = document.getElementById('level-section');
            const statsSection = document.getElementById('stats-section');
            const toolsSection = document.getElementById('tools-section');
            const nextLevelExp = Math.ceil(100 * (role === 'user' ? 1 : 2) * Math.pow(user.level + 1, 1.5));
            const progress = (user.exp / nextLevelExp) * 100;

            if (role === 'user') {
                document.getElementById('task-btn').style.display = 'inline-block';
                levelSection.innerHTML = `
                    <div class="user-level">
                        <div class="level-text"><i class="fas fa-star level-icon"></i> Cấp ${user.level}</div>
                        <span class="user-title">${user.title}</span>
                        <div class="exp-container">
                            <i class="fas fa-gem exp-icon-left"></i>
                            <div class="exp-bar"><div class="exp-progress ${progress >= 90 ? 'exp-glow' : ''}" style="width: ${progress}%"></div></div>
                            <i class="fas fa-gem exp-icon-right"></i>
                        </div>
                        <span class="exp-info">${user.exp}/${nextLevelExp} EXP</span>
                    </div>`;
                statsSection.innerHTML = `
                    <h3>Thống kê & Thông tin</h3>
                    <div class="stat-item"><span class="stat-label"><i class="fas fa-clock"></i> Thời gian tham gia:</span><span class="stat-value">${user.days_joined} ngày</span></div>
                    <div class="stat-item"><span class="stat-label"><i class="fas fa-book-open"></i> Số truyện đã đọc:</span><span class="stat-value">0 (Chưa thống kê)</span></div>
                    <div class="stat-item"><span class="stat-label"><i class="fas fa-trophy"></i> Thành tựu:</span><span class="stat-value">Thành viên mới</span></div>
                    <div class="stat-item"><span class="stat-label"><i class="fas fa-quote-left"></i> Trích dẫn ngẫu nhiên:</span><span class="stat-value">"Hãy để câu chuyện dẫn lối bạn!"</span></div>`;
                toolsSection.innerHTML = `<button class="tool-btn tool-request-author" onclick="alert('Tính năng yêu cầu quyền tác giả đang được phát triển!')"><i class="fas fa-pen"></i> Yêu cầu quyền Tác giả</button>`;
                initTasks();
            } else if (role === 'author') {
                levelSection.innerHTML = `
                    <div class="author-level">
                        <div class="level-text"><i class="fas fa-star level-icon"></i> Cấp ${user.level}</div>
                        <span class="author-title">${user.title}</span>
                        <div class="exp-container">
                            <i class="fas fa-gem exp-icon-left"></i>
                            <div class="exp-bar"><div class="exp-progress ${progress >= 90 ? 'exp-glow' : ''}" style="width: ${progress}%"></div></div>
                            <i class="fas fa-gem exp-icon-right"></i>
                        </div>
                        <span class="exp-info">${user.exp}/${nextLevelExp} EXP</span>
                    </div>`;
                statsSection.innerHTML = `
                    <h3>Thống kê & Thông tin</h3>
                    <div class="stat-item"><span class="stat-label"><i class="fas fa-clock"></i> Thời gian tham gia:</span><span class="stat-value">${user.days_joined} ngày</span></div>
                    <div class="stat-item"><span class="stat-label"><i class="fas fa-eye"></i> Tổng lượt xem:</span><span class="stat-value">${user.stats.total_views.toLocaleString()}</span></div>
                    <div class="stat-item"><span class="stat-label"><i class="fas fa-book"></i> Số chương đã đăng:</span><span class="stat-value">${user.stats.total_chapters}</span></div>
                    <div class="stat-item"><span class="stat-label"><i class="fas fa-star"></i> Truyện nổi bật:</span><span class="stat-value">${user.stats.top_story}</span></div>
                    <div class="stat-item"><span class="stat-label"><i class="fas fa-quote-left"></i> Trích dẫn ngẫu nhiên:</span><span class="stat-value">"Hãy để câu chuyện dẫn lối bạn!"</span></div>`;
                toolsSection.innerHTML = `
                    <button class="tool-btn tool-manage-truyen-author" onclick="window.location.href='../truyen/quan-ly-truyen-tac-gia.html'"><i class="fas fa-book"></i> Quản lý truyện</button>
                    <button class="tool-btn tool-upload-story" onclick="window.location.href='../truyen/dang-tai-truyen.html'"><i class="fas fa-upload"></i> Đăng tải truyện</button>`;
            } else { // admin
                document.getElementById('moderation-tab').style.display = 'block';
                statsSection.innerHTML = `
                    <h3>Thống kê & Thông tin</h3>
                    <div class="stat-item"><span class="stat-label"><i class="fas fa-clock"></i> Thời gian tham gia:</span><span class="stat-value">${user.days_joined} ngày</span></div>
                    <div class="stat-item"><span class="stat-label"><i class="fas fa-check-circle"></i> Truyện đã duyệt tháng này:</span><span class="stat-value">0 (Chưa thống kê)</span></div>
                    <div class="stat-item"><span class="stat-label"><i class="fas fa-hourglass-half"></i> Số truyện chờ duyệt:</span><span class="stat-value">${user.stats.truyen_cho_duyet}</span></div>
                    <div class="stat-item"><span class="stat-label"><i class="fas fa-quote-left"></i> Trích dẫn ngẫu nhiên:</span><span class="stat-value">"Hãy để câu chuyện dẫn lối bạn!"</span></div>`;
                toolsSection.innerHTML = `
                    <button class="tool-btn tool-manage-truyen" onclick="window.location.href='../truyen/quan-ly-truyen.html'"><i class="fas fa-book"></i> Quản lý truyện</button>
<button class="tool-btn tool-manage-users" onclick="window.location.href='../users/manage-users.html'"><i class="fas fa-users"></i> Quản lý người dùng</button>`;                initModeration();
            }
        });

    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (!tab.dataset.tab) return;
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.style.display = 'none');
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).style.display = 'block';

            if (tab.dataset.tab === 'moderation') {
                initModeration();
            }
        });
    });
}

function initTasks() {
    const taskBtn = document.getElementById('task-btn');
    const modal = document.getElementById('task-modal');
    const closeBtn = document.getElementById('task-modal-close');
    taskBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        fetch('/truyenviethay/api/api.php?action=tasks')
            .then(res => res.json())
            .then(data => {
                const taskList = document.getElementById('task-list');
                taskList.innerHTML = data.tasks.length ? '' : '<p>Không có nhiệm vụ nào hôm nay.</p>';
                let incomplete = 0;
                data.tasks.forEach(task => {
                    if (!task.is_completed && !task.is_rewarded && task.task_type !== 'login') incomplete++;
                    taskList.innerHTML += `
                        <div class="task-item ${task.is_completed ? 'completed' : ''}">
                            <div class="task-info">
                                <h3>${task.task_name}</h3>
                                <p>${task.description}</p>
                                <p>Phần thưởng: <strong>${task.exp_reward} EXP</strong></p>
                                <div class="task-progress-bar"><div class="task-progress" style="width: ${(task.progress / task.target) * 100}%"></div></div>
                                <p>Tiến trình: ${task.progress}/${task.target}</p>
                            </div>
                            <div class="task-action">
                                ${task.is_completed && !task.is_rewarded ? `<button class="claim-btn" onclick="claimReward(${task.task_id})">Nhận thưởng</button>` : (task.is_rewarded ? '<span class="completed-text">Đã hoàn thành</span>' : '<span class="not-completed">Chưa hoàn thành</span>')}
                            </div>
                        </div>`;
                });
                const badge = document.getElementById('task-badge');
                badge.textContent = incomplete;
                badge.style.display = incomplete > 0 ? 'inline' : 'none';
            });
    });
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
}

function initModeration() {
    const list = document.getElementById('moderation-list');
    fetch('/truyenviethay/api/api.php?action=moderation')
        .then(res => {
            if (!res.ok) {
                throw new Error('Lỗi khi tải dữ liệu: ' + res.status + ' - ' + res.statusText);
            }
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return res.text().then(text => {
                    throw new Error('Phản hồi không phải JSON: ' + text);
                });
            }
            return res.json();
        })
        .then(data => {
            if (!data.success) {
                list.innerHTML = `<p>${data.error || 'Không thể tải danh sách truyện.'}</p>`;
                console.log('API Response:', data);
                return;
            }
            list.innerHTML = data.truyen_list.length ? '<table class="moderation-table"><thead><tr><th>Tên truyện</th><th>Ảnh bìa</th><th>Tác giả</th><th>Thời gian gửi</th><th>Hành động</th></tr></thead><tbody>' : '<p>Không có truyện nào chờ duyệt.</p>';
            data.truyen_list.forEach(truyen => {
                list.innerHTML += `
                    <tr>
                        <td>${truyen.ten_truyen}</td>
                        <td><img src="${truyen.anh_bia}" alt="${truyen.ten_truyen}" class="truyen-cover" style="width: 50px; height: 70px; object-fit: cover;"></td>
                        <td>${truyen.tac_gia_name}</td>
                        <td>${new Date(truyen.thoi_gian_cap_nhat).toLocaleString('vi-VN')}</td>
                        <td>
                            <button class="action-btn detail-btn" onclick="showTruyenDetail(${truyen.id})">Xem chi tiết</button>
                            <button class="action-btn approve-btn" onclick="moderate(${truyen.id}, 'approve')">Phê duyệt</button>
                            <button class="action-btn reject-btn" onclick="if(confirm('Bạn có chắc muốn từ chối truyện này?')) moderate(${truyen.id}, 'reject')">Từ chối</button>
                        </td>
                    </tr>`;
            });
            if (data.truyen_list.length) list.innerHTML += '</tbody></table>';
        })
        .catch(error => {
            console.error('Lỗi chi tiết:', error.message);
            list.innerHTML = '<p>Có lỗi xảy ra khi tải dữ liệu. Vui lòng kiểm tra console để biết thêm chi tiết.</p>';
        });
}

window.showTruyenDetail = function (truyenId) {
    fetch('/truyenviethay/api/api.php?action=moderation_detail&truyen_id=' + truyenId)
        .then(res => {
            if (!res.ok) throw new Error('Lỗi khi tải chi tiết truyện: ' + res.status);
            return res.json();
        })
        .then(data => {
            if (!data.success) {
                alert('Lỗi: ' + (data.error || 'Không thể tải chi tiết truyện.'));
                return;
            }
            const truyen = data.truyen;
            console.log('Dữ liệu truyen:', truyen);
            const modal = document.getElementById('truyen-detail-modal');
            const content = document.getElementById('truyen-detail-content');
            content.innerHTML = `
                <div class="truyen-detail-header">
                    <h3>${truyen.ten_truyen || 'Tên truyện không xác định'}</h3>
                    <img src="${truyen.anh_bia}" alt="${truyen.ten_truyen || 'Truyện'}" class="truyen-detail-cover">
                </div>
                <div class="truyen-detail-info">
                    <div class="info-row"><span class="info-label">Tác giả:</span> ${truyen.tac_gia_name || 'Không xác định'}</div>
                    <div class="info-row"><span class="info-label">Mô tả:</span> ${truyen.mo_ta || 'Chưa có mô tả'}</div>
                    <div class="info-row"><span class="info-label">Thể loại:</span> ${truyen.the_loai || 'Chưa có thể loại'}</div>
                    <div class="info-row"><span class="info-label">Tình trạng truyện:</span> ${truyen.trang_thai_viet || 'Chưa có thông tin'}</div>
                    <div class="info-row"><span class="info-label">Số chương hiện có:</span> Chưa có chương chính thức</div>
                    <div class="info-row">
                        <span class="info-label">Chương mẫu:</span> 
                        <div class="chuong-mau-content">
                            <p>${truyen.chuong_mau || 'Không có nội dung chương mẫu'}</p>
                        </div>
                    </div>
                    <div class="info-row"><span class="info-label">Ghi chú gửi admin:</span> ${truyen.ghi_chu_admin || 'Chưa có ghi chú'}</div>
                    <div class="info-row"><span class="info-label">Nguồn truyện:</span> ${truyen.nguon_truyen || 'Chưa có nguồn'}</div>
                    <div class="info-row"><span class="info-label">Cảnh báo nội dung:</span> ${truyen.canh_bao_noi_dung || 'Chưa có thông tin'}</div>
                    <div class="info-row"><span class="info-label">Yếu tố nhạy cảm:</span> ${truyen.yeu_to_nhay_cam || 'Không có'}</div>
                    <div class="info-row"><span class="info-label">Mục tiêu của truyện:</span> ${truyen.muc_tieu || 'Chưa có thông tin'}</div>
                    <div class="info-row"><span class="info-label">Đánh giá ban đầu:</span> ${truyen.danh_gia || 'Chưa có đánh giá'}</div>
                    <div class="info-row"><span class="info-label">Thời gian gửi:</span> ${new Date(truyen.thoi_gian_cap_nhat).toLocaleString('vi-VN')}</div>
                </div>
            `;
            modal.style.display = 'block';
        })
        .catch(error => {
            console.error('Lỗi khi lấy chi tiết truyện:', error);
            alert('Có lỗi xảy ra khi tải chi tiết truyện.');
        });
};

window.closeTruyenDetailModal = function () {
    const modal = document.getElementById('truyen-detail-modal');
    modal.style.display = 'none';
};

window.addEventListener('click', (event) => {
    const modal = document.getElementById('truyen-detail-modal');
    if (event.target === modal) {
        closeTruyenDetailModal();
    }
});

window.claimReward = function (taskId) {
    fetch('/truyenviethay/api/api.php?action=tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `claim_reward=1&task_id=${taskId}`
    })
        .then(res => {
            if (!res.ok) {
                throw new Error('Lỗi server: ' + res.status);
            }
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return res.text().then(text => {
                    console.error('Response không phải JSON:', text);
                    throw new Error('Response không phải JSON');
                });
            }
            return res.json();
        })
        .then(data => {
            alert(data.message || data.error);
            if (data.success) {
                // Cập nhật giao diện ngay lập tức cho nhiệm vụ vừa nhận thưởng
                const taskAction = document.querySelector(`.task-item .task-action button[onclick="claimReward(${taskId})"]`)?.parentElement;
                if (taskAction) {
                    taskAction.innerHTML = '<span class="completed-text">Đã hoàn thành</span>';
                    // Cập nhật badge
                    const badge = document.getElementById('task-badge');
                    let incomplete = parseInt(badge.textContent) || 0;
                    if (incomplete > 0) {
                        incomplete--;
                        badge.textContent = incomplete;
                        badge.style.display = incomplete > 0 ? 'inline' : 'none';
                    }
                }
            }
        })
        .catch(error => {
            console.error('Lỗi khi nhận thưởng:', error);
            alert('Có lỗi xảy ra khi nhận thưởng.');
        });
};

window.moderate = function (truyenId, action) {
    fetch('/truyenviethay/api/api.php?action=moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `truyen_id=${truyenId}&action=${action}`
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) initModeration();
        });
};