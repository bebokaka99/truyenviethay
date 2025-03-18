console.log('chapter.js loaded');

export function initChapter() {
    console.log('initChapter started, pathname:', window.location.pathname);

    // Kiểm tra đăng nhập (giữ nguyên)
    fetch('http://localhost:888/truyenviethay/api/api.php?action=profile')
        .then(res => res.json())
        .then(data => {
            console.log('Profile response:', data);
            if (!data.success) {
                window.location.href = data.redirect || '/truyenviethay/users/login.html';
                return;
            }
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('register-btn').style.display = 'none';
            document.getElementById('user-info').style.display = 'block';
            document.getElementById('user-avatar').src = '../' + data.data.avatar;
        })
        .catch(err => console.error('Profile error:', err));

    // Load thể loại (giữ nguyên)
    fetch('http://localhost:888/truyenviethay/api/api.php?action=theloai&subaction=categories')
        .then(res => res.json())
        .then(data => {
            console.log('Theloai response:', data);
            const theloaiContainer = document.getElementById('theloai-container');
            data.data.forEach(theloai => {
                theloaiContainer.innerHTML += `<a href="../truyen/the-loai.html?theloai[]=${theloai.id_theloai}" class="theloai-item">${theloai.ten_theloai}</a>`;
            });
            theloaiContainer.innerHTML += `<a href="../truyen/the-loai.html" class="theloai-item xem-tat-ca">Xem tất cả thể loại</a>`;
        })
        .catch(err => console.error('Theloai error:', err));

    const urlParams = new URLSearchParams(window.location.search);
    const truyenId = urlParams.get('truyen_id');
    if (!truyenId || isNaN(truyenId) || truyenId <= 0) {
        console.log('Invalid truyenId:', truyenId);
        document.getElementById('error-message').textContent = 'Thiếu hoặc sai ID truyện.';
        document.getElementById('error-message').style.display = 'block';
        return;
    }
    console.log('truyenId:', truyenId);

    function loadChapters() {
        console.log('Loading chapters for truyenId:', truyenId);
        fetch(`http://localhost:888/truyenviethay/api/api.php?action=chapter&truyen_id=${truyenId}`)
            .then(res => {
                console.log('Chapters fetch status:', res.status);
                return res.json();
            })
            .then(data => {
                console.log('Chapters data:', data);
                if (!data.success) {
                    document.getElementById('error-message').textContent = data.error;
                    document.getElementById('error-message').style.display = 'block';
                    return;
                }

                document.getElementById('truyen-title').textContent = `QUẢN LÝ CHƯƠNG - ${data.ten_truyen}`;
                const actionsContainer = document.getElementById('chapter-actions');
                actionsContainer.innerHTML = data.is_author
                    ? `<button class="add-chuong-btn"><i class="fas fa-plus"></i> Thêm chương mới</button>
                       <div class="add-chuong-form" id="addChuongForm" style="display: none;">
                           <form id="addChapterForm">
                               <div class="form-header"><h3>Thêm chương mới</h3><button type="button" class="close-form-btn"><i class="fas fa-times"></i></button></div>
                               <div class="form-group"><label for="so_chuong">Số chương:</label><input type="number" name="so_chuong" id="so_chuong" min="1" required></div>
                               <div class="form-group"><label for="tieu_de">Tiêu đề:</label><input type="text" name="tieu_de" id="tieu_de" required></div>
                               <div class="form-group"><label for="noi_dung">Nội dung:</label><textarea name="noi_dung" id="noi_dung" required></textarea></div>
                               <div class="form-actions"><button type="submit" class="submit-btn"><i class="fas fa-plus"></i> Thêm chương</button><button type="button" class="cancel-btn"><i class="fas fa-times"></i> Hủy</button></div>
                           </form>
                       </div>`
                    : '';

                if (data.is_author) {
                    const addBtn = document.querySelector('.add-chuong-btn');
                    const formContainer = document.getElementById('addChuongForm');
                    const closeBtn = formContainer.querySelector('.close-form-btn');
                    const cancelBtn = formContainer.querySelector('.cancel-btn');
                    const form = document.getElementById('addChapterForm');

                    addBtn.addEventListener('click', () => formContainer.style.display = 'block');
                    closeBtn.addEventListener('click', () => formContainer.style.display = 'none');
                    cancelBtn.addEventListener('click', () => formContainer.style.display = 'none');

                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const formData = new FormData(form);
                        formData.append('action', 'add');
                        formData.append('truyen_id', truyenId);
                        fetch('http://localhost:888/truyenviethay/api/api.php?action=chapter', {
                            method: 'POST',
                            body: formData
                        })
                        .then(res => res.json())
                        .then(data => handleResponse(data, form, formContainer))
                        .catch(err => console.error('Add error:', err));
                    });
                }

                const tableContainer = document.getElementById('chuong-table-container');
                if (!tableContainer) {
                    console.error('Table container not found');
                    return;
                }

                if (!data.data.length) {
                    tableContainer.innerHTML = '<p class="no-data">Chưa có chương nào.</p>';
                } else {
                    tableContainer.innerHTML = `
                        <table class="chuong-table">
                            <thead><tr><th>Số chương</th><th>Tiêu đề</th><th>Ngày đăng</th><th>Trạng thái</th><th>Lượt xem</th><th>Hành động</th></tr></thead>
                            <tbody>
                                ${data.data.map(chuong => `
                                    <tr>
                                        <td>${chuong.so_chuong}</td>
                                        <td>${chuong.tieu_de}</td>
                                        <td>${chuong.thoi_gian_dang}</td>
                                        <td class="status-${chuong.trang_thai}">
                                            ${chuong.trang_thai === 'cho_duyet' ? 'Chờ duyệt' : 
                                              chuong.trang_thai === 'da_duyet' ? 'Đã duyệt' : 
                                              chuong.trang_thai === 'tu_choi' ? 'Từ chối' : 'Không xác định'}
                                            ${data.is_author && chuong.trang_thai === 'tu_choi' && chuong.ly_do_tu_choi ? `<div>Lý do: ${chuong.ly_do_tu_choi}</div>` : ''}
                                        </td>
                                        <td>${chuong.luot_xem}</td>
                                        <td>
                                            ${data.is_admin && chuong.trang_thai === 'cho_duyet' ? `
                                                <button class="action-btn approve-btn" data-id="${chuong.id}">Phê duyệt</button>
                                                <button class="action-btn reject-btn" data-id="${chuong.id}">Từ chối</button>
                                                <a href="../truyen/chi-tiet-chuong.html?truyen_id=${truyenId}&chapter_id=${chuong.id}" class="action-btn view-btn">Xem chi tiết</a>
                                                <button class="action-btn delete-btn" data-id="${chuong.id}">Xóa</button>
                                            ` : ''}
                                            ${data.is_admin && chuong.trang_thai === 'tu_choi' ? `
                                                <button class="action-btn reason-btn" data-reason="${chuong.ly_do_tu_choi}">Xem lý do</button>
                                                <a href="../truyen/chi-tiet-chuong.html?truyen_id=${truyenId}&chapter_id=${chuong.id}" class="action-btn view-btn">Xem chi tiết</a>
                                                <button class="action-btn delete-btn" data-id="${chuong.id}">Xóa</button>
                                            ` : ''}
                                            ${data.is_admin && chuong.trang_thai === 'da_duyet' ? `
                                                <a href="../truyen/chi-tiet-chuong.html?truyen_id=${truyenId}&chapter_id=${chuong.id}" class="action-btn view-btn">Xem chi tiết</a>
                                            ` : ''}
                                            ${data.is_author && ['cho_duyet', 'tu_choi'].includes(chuong.trang_thai) ? `
                                                <button class="action-btn edit-btn" data-id="${chuong.id}" data-so="${chuong.so_chuong}" data-tieu_de="${chuong.tieu_de}" data-noi_dung="${chuong.noi_dung}">Chỉnh sửa</button>
                                                <button class="action-btn delete-btn" data-id="${chuong.id}">Xóa</button>
                                            ` : ''}
                                            ${data.is_author && chuong.trang_thai === 'da_duyet' ? `
                                                <a href="../truyen/chi-tiet-chuong.html?truyen_id=${truyenId}&chapter_id=${chuong.id}" class="action-btn view-btn">Xem chi tiết</a>
                                            ` : ''}
                                        </td>
                                    </tr>
                                    ${data.is_author && ['cho_duyet', 'tu_choi'].includes(chuong.trang_thai) ? `
                                        <div class="edit-chuong-form" id="edit-chuong-form-${chuong.id}" style="display: none;">
                                            <form class="edit-form" data-id="${chuong.id}">
                                                <div class="form-header"><h3>Chỉnh sửa chương</h3><button type="button" class="close-form-btn"><i class="fas fa-times"></i></button></div>
                                                <div class="form-group"><label>Số chương:</label><input type="number" name="so_chuong" value="${chuong.so_chuong}" min="1" required></div>
                                                <div class="form-group"><label>Tiêu đề:</label><input type="text" name="tieu_de" value="${chuong.tieu_de}" required></div>
                                                <div class="form-group"><label>Nội dung:</label><textarea name="noi_dung" required>${chuong.noi_dung}</textarea></div>
                                                <div class="form-actions"><button type="submit" class="submit-btn"><i class="fas fa-save"></i> Cập nhật</button><button type="button" class="cancel-btn"><i class="fas fa-times"></i> Hủy</button></div>
                                            </form>
                                        </div>
                                    ` : ''}
                                `).join('')}
                            </tbody>
                        </table>`;

                    // Gắn sự kiện
                    tableContainer.querySelectorAll('.approve-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const formData = new FormData();
                            formData.append('action', 'approve');
                            formData.append('chapter_id', btn.dataset.id);
                            formData.append('truyen_id', truyenId);
                            fetch('http://localhost:888/truyenviethay/api/api.php?action=chapter', {
                                method: 'POST',
                                body: formData
                            })
                            .then(res => res.json())
                            .then(data => handleResponse(data))
                            .catch(err => console.error('Approve error:', err));
                        });
                    });

                    tableContainer.querySelectorAll('.reject-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            console.log('Opening reject form for chapter:', btn.dataset.id);
                            openRejectForm(btn.dataset.id);
                        });
                    });

                    tableContainer.querySelectorAll('.delete-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            if (confirm('Bạn có chắc chắn muốn xóa chương này?')) {
                                const formData = new FormData();
                                formData.append('action', 'delete');
                                formData.append('chapter_id', btn.dataset.id);
                                formData.append('truyen_id', truyenId);
                                fetch('http://localhost:888/truyenviethay/api/api.php?action=chapter', {
                                    method: 'POST',
                                    body: formData
                                })
                                .then(res => res.json())
                                .then(data => handleResponse(data))
                                .catch(err => console.error('Delete error:', err));
                            }
                        });
                    });

                    tableContainer.querySelectorAll('.edit-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const form = document.getElementById(`edit-chuong-form-${btn.dataset.id}`);
                            if (form) form.style.display = 'block';
                        });
                    });

                    tableContainer.querySelectorAll('.edit-chuong-form .close-form-btn, .edit-chuong-form .cancel-btn').forEach(btn => {
                        btn.addEventListener('click', () => btn.closest('.edit-chuong-form').style.display = 'none');
                    });

                    tableContainer.querySelectorAll('.edit-form').forEach(form => {
                        form.addEventListener('submit', (e) => {
                            e.preventDefault();
                            const formData = new FormData(form);
                            formData.append('action', 'update');
                            formData.append('chapter_id', form.dataset.id);
                            formData.append('truyen_id', truyenId);
                            fetch('http://localhost:888/truyenviethay/api/api.php?action=chapter', {
                                method: 'POST',
                                body: formData
                            })
                            .then(res => res.json())
                            .then(data => handleResponse(data, null, form.closest('.edit-chuong-form')))
                            .catch(err => console.error('Update error:', err));
                        });
                    });

                    tableContainer.querySelectorAll('.reason-btn').forEach(btn => {
                        btn.addEventListener('click', () => alert(`Lý do từ chối: ${btn.dataset.reason}`));
                    });
                }
            })
            .catch(err => {
                console.error('Chapters fetch error:', err);
                document.getElementById('error-message').textContent = 'Lỗi tải danh sách chương.';
                document.getElementById('error-message').style.display = 'block';
            });
    }

    // Hàm mở form từ chối
    function openRejectForm(chapterId) {
        // Xóa form cũ nếu tồn tại
        const existingForm = document.querySelector(`.reject-form`);
        if (existingForm) {
            console.log('Removing existing reject form');
            existingForm.remove();
        }

        const template = document.getElementById('reject-form-template');
        if (!template) {
            console.error('Reject form template not found');
            return;
        }

        const formClone = template.content.cloneNode(true).querySelector('.reject-form');
        const form = formClone.querySelector('.reject-form-submit');
        form.dataset.id = chapterId;

        const closeBtn = formClone.querySelector('.close-form-btn');
        const cancelBtn = formClone.querySelector('.cancel-btn');
        const submitBtn = formClone.querySelector('.submit-btn');

        closeBtn.addEventListener('click', () => {
            console.log('Closing reject form');
            formClone.remove();
        });
        cancelBtn.addEventListener('click', () => {
            console.log('Canceling reject form');
            formClone.remove();
        });
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const lyDo = form.querySelector('textarea[name="ly_do_tu_choi"]').value;
            if (!lyDo) {
                alert('Vui lòng nhập lý do từ chối!');
                return;
            }
            console.log('Submitting reject for chapter:', chapterId, 'with reason:', lyDo);
            submitReject(chapterId, lyDo, formClone);
        });

        document.body.appendChild(formClone);
        formClone.style.display = 'block'; // Hiển thị form
        console.log('Reject form opened for chapter:', chapterId);
    }

    // Hàm gửi request từ chối
    function submitReject(chapterId, lyDo, formElement) {
        const formData = new FormData();
        formData.append('action', 'reject');
        formData.append('chapter_id', chapterId);
        formData.append('truyen_id', truyenId);
        formData.append('ly_do_tu_choi', lyDo);

        fetch('http://localhost:888/truyenviethay/api/api.php?action=chapter', {
            method: 'POST',
            body: formData
        })
        .then(res => {
            console.log('Reject fetch status:', res.status);
            return res.json();
        })
        .then(data => {
            console.log('Reject response:', data);
            handleResponse(data, null, formElement);
        })
        .catch(err => console.error('Reject fetch error:', err));
    }

    // Hàm xử lý response
    function handleResponse(data, form = null, formContainer = null) {
        console.log('Handling response:', data);
        const errorDiv = document.getElementById('error-message');
        const successDiv = document.getElementById('success-message');
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        if (data.success) {
            successDiv.textContent = data.message || 'Thành công';
            successDiv.style.display = 'block';
            if (form) form.reset();
            if (formContainer) formContainer.remove();
            loadChapters();
        } else {
            errorDiv.textContent = data.error || 'Lỗi không xác định';
            errorDiv.style.display = 'block';
        }
    }

    loadChapters();
    console.log('initChapter finished');
}