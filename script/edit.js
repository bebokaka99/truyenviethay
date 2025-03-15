export function initEdit() {
    fetch('/truyenviethay/api/api.php?action=profile')
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                window.location.href = data.redirect || '/truyenviethay/users/login.html';
                return;
            }
            document.getElementById('login-link').style.display = 'none';
            document.getElementById('register-link').style.display = 'none';
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('register-btn').style.display = 'none';
            const userInfo = document.getElementById('user-info');
            userInfo.style.display = 'block';
            document.getElementById('user-avatar').src = '../' + data.data.avatar;
        });

    fetch('/truyenviethay/api/api.php?action=theloai&subaction=categories')
        .then(res => res.json())
        .then(data => {
            const theloaiContainer = document.getElementById('theloai-container');
            if (data.success && data.data.length > 0) {
                data.data.forEach(theloai => {
                    theloaiContainer.innerHTML += `<a href="../truyen/the-loai.html?theloai[]=${theloai.id_theloai}" class="theloai-item">${theloai.ten_theloai}</a>`;
                });
                theloaiContainer.innerHTML += `<a href="../truyen/the-loai.html" class="theloai-item xem-tat-ca">Xem tất cả thể loại</a>`;
            } else {
                theloaiContainer.innerHTML = '<p>Chưa có thể loại nào.</p>';
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải thể loại:', error);
            document.getElementById('theloai-container').innerHTML = '<p>Lỗi khi tải thể loại. Vui lòng thử lại.</p>';
        });

    const urlParams = new URLSearchParams(window.location.search);
    const truyenId = urlParams.get('truyen_id');
    if (!truyenId) {
        document.querySelector('.edit-truyen-container').innerHTML = '<p>Truyện không hợp lệ.</p>';
        return;
    }

    fetch(`/truyenviethay/api/api.php?action=edit&truyen_id=${truyenId}`) // Sửa từ 'id' thành 'truyen_id'
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                document.querySelector('.edit-truyen-container').innerHTML = `<p>${data.error}</p>`;
                return;
            }

            const truyen = data.truyen;
            document.getElementById('truyen-title').textContent = `Chỉnh sửa truyện: ${truyen.ten_truyen}`;
            document.getElementById('truyen-id').value = truyen.id;
            document.getElementById('ten_truyen').value = truyen.ten_truyen;
            document.getElementById('tac_gia').value = truyen.tac_gia || '';
            document.getElementById('mo_ta').value = truyen.mo_ta || '';
            document.getElementById('trang_thai').value = truyen.trang_thai;

            const theloaiSelect = document.getElementById('theloai');
            data.theloai_list.forEach(theloai => {
                const option = document.createElement('option');
                option.value = theloai.id_theloai;
                option.textContent = theloai.ten_theloai;
                if (truyen.theloai.includes(parseInt(theloai.id_theloai))) {
                    option.selected = true;
                }
                theloaiSelect.appendChild(option);
            });

            const currentImage = document.getElementById('current-image');
            currentImage.innerHTML = truyen.anh_bia ? `<img src="${truyen.anh_bia}" alt="Ảnh bìa hiện tại">` : '<p>Chưa có ảnh bìa.</p>';
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu truyện:', error);
            document.querySelector('.edit-truyen-container').innerHTML = '<p>Lỗi khi tải dữ liệu. Vui lòng thử lại.</p>';
        });

    const form = document.getElementById('edit-truyen-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        fetch('/truyenviethay/api/api.php?action=edit', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            const errorDiv = document.getElementById('error-message');
            const successDiv = document.getElementById('success-message');
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';

            if (data.success) {
                successDiv.textContent = data.message;
                successDiv.style.display = 'block';
                setTimeout(() => window.location.reload(), 2000);
            } else {
                errorDiv.textContent = data.errors ? Object.values(data.errors)[0] : data.error;
                errorDiv.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Lỗi khi gửi form:', error);
            document.getElementById('error-message').textContent = 'Lỗi khi gửi dữ liệu. Vui lòng thử lại.';
            document.getElementById('error-message').style.display = 'block';
        });
    });
}