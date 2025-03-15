export function initTasks() {
    const taskBtn = document.getElementById('task-btn');
    const taskModal = document.getElementById('task-modal');
    const closeModal = document.getElementById('task-modal-close');

    if (taskBtn && taskModal) {
        taskBtn.addEventListener('click', () => taskModal.style.display = 'block');
        closeModal.addEventListener('click', () => taskModal.style.display = 'none');
        window.addEventListener('click', (event) => {
            if (event.target === taskModal) taskModal.style.display = 'none';
        });
    }
}

export function claimReward(taskId) {
    const form = document.getElementById(`claim-form-${taskId}`);
    if (!form) {
        console.error(`Form với ID claim-form-${taskId} không tồn tại`);
        alert('Có lỗi xảy ra khi nhận thưởng');
        return;
    }
    const formData = new FormData(form);

    fetch(window.location.href, { method: 'POST', body: formData })
        .then(response => {
            if (!response.ok) throw new Error(`Lỗi kết nối server: ${response.statusText}`);
            return response.json();
        })
        .then(data => {
            console.log('Phản hồi từ server:', data);
            if (data.success) {
                const button = document.querySelector(`#claim-form-${taskId} .claim-btn`);
                if (button) {
                    button.parentElement.innerHTML = '<span class="completed-text">Đã hoàn thành</span>';
                    const badge = document.querySelector('.task-badge');
                    if (badge) {
                        let currentCount = parseInt(badge.textContent) || 0;
                        if (currentCount > 0) badge.textContent = currentCount - 1;
                    }
                }
            } else {
                alert('Lỗi: ' + (data.error || 'Không thể nhận thưởng'));
            }
        })
        .catch(error => {
            console.error('Lỗi AJAX:', error);
            alert('Có lỗi xảy ra khi nhận thưởng.');
        });
}