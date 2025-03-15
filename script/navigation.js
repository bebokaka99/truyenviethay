export function initNavigation() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.classList.toggle('show', window.scrollY > 300);
        });
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const chapterSelector = document.getElementById('chapterSelector');

    if (prevBtn && window.truyenId) {
        const prevChuongId = prevBtn.getAttribute('data-chuong-id');
        if (prevChuongId && prevChuongId !== 'null') {
            prevBtn.addEventListener('click', () => {
                window.location.href = `/truyenviethay/truyen/chuong.html?truyen_id=${truyenId}&chuong_id=${prevChuongId}`;
            });
        }
    }

    if (nextBtn && window.truyenId) {
        const nextChuongId = nextBtn.getAttribute('data-chuong-id');
        if (nextChuongId && nextChuongId !== 'null') {
            nextBtn.addEventListener('click', () => {
                window.location.href = `/truyenviethay/truyen/chuong.html?truyen_id=${truyenId}&chuong_id=${nextChuongId}`;
            });
        }
    }

    if (chapterSelector && window.truyenId) {
        chapterSelector.addEventListener('change', () => {
            const selectedChapterId = chapterSelector.value;
            if (selectedChapterId) {
                window.location.href = `/truyenviethay/truyen/chuong.html?truyen_id=${truyenId}&chuong_id=${selectedChapterId}`;
            }
        });
    }
}