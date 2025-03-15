export function initUpload() {
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
            data.data.forEach(theloai => {
                theloaiContainer.innerHTML += `<a href="../truyen/the-loai.html?theloai[]=${theloai.id_theloai}" class="theloai-item">${theloai.ten_theloai}</a>`;
            });
            theloaiContainer.innerHTML += `<a href="../truyen/the-loai.html" class="theloai-item xem-tat-ca">Xem tất cả thể loại</a>`;
        });

    fetch('/truyenviethay/api/api.php?action=upload')
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                document.querySelector('.upload-story-container').innerHTML = `<p>${data.error}</p>`;
                return;
            }

            const theloaiSelect = document.getElementById('theloai');
            data.theloai_list.forEach(theloai => {
                const option = document.createElement('option');
                option.value = theloai.id_theloai;
                option.textContent = theloai.ten_theloai;
                theloaiSelect.appendChild(option);
            });

            document.getElementById('tac_gia').value = data.tac_gia;
        });

    const form = document.getElementById('upload-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        fetch('/truyenviethay/api/api.php?action=upload', {
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
                form.reset();
                setTimeout(() => window.location.href = '../users/profile.html', 3000);
            } else {
                errorDiv.textContent = data.errors ? Object.values(data.errors)[0] : data.error;
                errorDiv.style.display = 'block';
            }
        });
    });
}