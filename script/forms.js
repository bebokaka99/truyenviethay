export function initForms() {
    const addTruyenBtn = document.querySelector('.add-truyen-btn');
    const closeFormBtn = document.querySelector('.close-form-btn');
    const cancelFormBtn = document.querySelector('.cancel-btn');
    const addChapterBtn = document.querySelector('.add-chuong-btn');
    const closeChapterFormBtn = document.querySelector('#addChuongForm .close-form-btn');
    const cancelChapterFormBtn = document.querySelector('#addChuongForm .cancel-btn');
    const addChapterForm = document.querySelector('#addChuongForm form');
    const form = document.getElementById('dang-tai-form');

    if (addTruyenBtn) addTruyenBtn.addEventListener('click', toggleAddForm);
    if (closeFormBtn) closeFormBtn.addEventListener('click', toggleAddForm);
    if (cancelFormBtn) cancelFormBtn.addEventListener('click', toggleAddForm);

    if (addChapterBtn) addChapterBtn.addEventListener('click', () => toggleChapterForm(true));
    if (closeChapterFormBtn) closeChapterFormBtn.addEventListener('click', () => toggleChapterForm(false));
    if (cancelChapterFormBtn) cancelChapterFormBtn.addEventListener('click', () => toggleChapterForm(false));

    if (addChapterForm) {
        addChapterForm.addEventListener('submit', (e) => {
            const soChuong = document.getElementById('so_chuong').value;
            const tieuDe = document.getElementById('tieu_de').value.trim();
            const noiDung = document.getElementById('noi_dung').value.trim();
            if (!soChuong || !tieuDe || !noiDung) {
                e.preventDefault();
                alert('Vui lòng điền đầy đủ các trường!');
            }
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            const tenTruyen = document.getElementById('ten_truyen').value.trim();
            const tacGia = document.getElementById('tac_gia').value.trim();
            const moTa = document.getElementById('mo_ta').value.trim();
            const theLoai = document.getElementById('theloai').selectedOptions;
            if (!tenTruyen || !tacGia || !moTa || theLoai.length === 0) {
                e.preventDefault();
                alert('Vui lòng điền đầy đủ các trường bắt buộc!');
                return;
            }
            if (!confirm('Bạn có chắc chắn muốn đăng tải truyện này không?')) {
                e.preventDefault();
            }
        });
    }
}

function toggleAddForm() {
    const form = document.getElementById('addTruyenForm');
    if (form) form.classList.toggle('active');
}

function toggleChapterForm(show) {
    const form = document.getElementById('addChuongForm');
    if (form) form.classList.toggle('active', show);
}