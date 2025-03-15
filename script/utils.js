export function reportError() {
    alert('Chức năng báo lỗi đang được phát triển!');
}

export function debugTextarea() {
    const textarea = document.querySelector('.comment-input textarea');
    if (textarea) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style') {
                    console.log('Style của textarea đã thay đổi:', textarea.style);
                    console.log('Nguồn thay đổi:', mutation);
                }
            });
        });
        observer.observe(textarea, { attributes: true });
    }
}

export function showEditForm(chapterId, soChuong, tieuDe, noiDung) {
    const form = document.getElementById(`edit-chuong-form-${chapterId}`);
    if (form) {
        form.style.display = 'block';
        document.getElementById(`so_chuong_${chapterId}`).value = soChuong || '';
        document.getElementById(`tieu_de_${chapterId}`).value = tieuDe || '';
        document.getElementById(`noi_dung_${chapterId}`).value = noiDung || '';
    }
}

export function hideEditForm(chapterId) {
    const form = document.getElementById(`edit-chuong-form-${chapterId}`);
    if (form) form.style.display = 'none';
}

export function showRejectForm(chapterId) {
    const form = document.getElementById(`reject-form-${chapterId}`);
    if (form) form.style.display = 'block';
}

export function hideRejectForm(chapterId) {
    const form = document.getElementById(`reject-form-${chapterId}`);
    if (form) form.style.display = 'none';
}

export function showReason(reason) {
    alert("Lý do từ chối: " + (reason || 'Không có lý do'));
}

export function hideChapterDetail() {
    const modal = document.getElementById('chapter-detail-modal');
    if (modal) modal.style.display = 'none';
}