export function initFollow() {
    let isFollowing = false;
    const followBtn = document.querySelector('.follow-btn');
    if (followBtn) {
        followBtn.addEventListener('click', () => {
            isFollowing = !isFollowing;
            if (isFollowing) {
                followBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Đã Theo Dõi';
                followBtn.style.backgroundColor = '#45a049';
            } else {
                followBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Theo Dõi';
                followBtn.style.backgroundColor = '#4CAF50';
            }
            alert('Chức năng theo dõi truyện đang được phát triển!');
        });
    }
}