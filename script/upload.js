// script/upload.js
export function initUpload() {
    const form = document.getElementById('upload-form');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const nguonTruyen = document.getElementById('nguon_truyen');
    const linkNguonGroup = document.getElementById('link-nguon-group');

    // Lấy danh sách thể loại và điền vào dropdown
    fetch('/truyenviethay/api/upload.php', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        if (data.success) {
            const theloaiSelect = document.getElementById('theloai');
            data.theloai_list.forEach(theloai => {
                const option = document.createElement('option');
                option.value = theloai.id_theloai;
                option.textContent = theloai.ten_theloai;
                theloaiSelect.appendChild(option);
            });

            // Điền tên tác giả
            document.getElementById('tac_gia').value = data.tac_gia;
        } else {
            errorMessage.style.display = 'block';
            errorMessage.textContent = data.error || 'Không thể tải danh sách thể loại';
        }
    })
    .catch(err => {
        console.error('Lỗi khi fetch GET:', err);
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Lỗi khi tải dữ liệu: ' + err.message;
    });

    // Toggle hiển thị link_nguon dựa trên nguon_truyen
    nguonTruyen.addEventListener('change', () => {
        linkNguonGroup.style.display = ['dich_thuat', 'chuyen_the'].includes(nguonTruyen.value) ? 'block' : 'none';
    });

    // Xử lý submit form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';

        // Validate số từ trong chương mẫu
        const chuongMau = document.getElementById('chuong_mau').value;
        const wordCount = chuongMau.trim().split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount < 50) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Chương mẫu phải có ít nhất 50 từ (hiện tại: ' + wordCount + ' từ)';
            return;
        }

        const formData = new FormData(form);
        try {
            const response = await fetch('/truyenviethay/api/upload.php', {
                method: 'POST',
                body: formData,
            });

            // Kiểm tra Content-Type của phản hồi
            const contentType = response.headers.get('Content-Type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Phản hồi không phải JSON:', text);
                throw new Error('Phản hồi từ server không phải JSON: ' + text);
            }

            const result = await response.json();

            if (result.success) {
                alert('Đăng tải truyện thành công, chờ admin phê duyệt');
                form.reset();
                successMessage.style.display = 'block';
                successMessage.textContent = 'Đăng tải thành công! Đang chờ admin kiểm duyệt.';
            } else if (result.errors) {
                errorMessage.style.display = 'block';
                errorMessage.textContent = Object.values(result.errors).join(', ');
            } else {
                errorMessage.style.display = 'block';
                errorMessage.textContent = result.error || 'Lỗi không xác định';
            }
        } catch (err) {
            console.error('Lỗi khi gửi POST:', err);
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Lỗi khi gửi dữ liệu: ' + err.message;
        }
    });
}