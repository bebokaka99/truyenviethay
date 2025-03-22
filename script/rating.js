// script/rating.js
export function initRating() {
    console.log("initRating bắt đầu chạy");
    let currentUserRating = 0; // Rating cá nhân
    let avgRating = 0; // Trung bình
    let ratingCount = 0; // Số người vote

    function attachRatingEvents() {
        const ratingStars = document.querySelector('.rating-stars');
        if (!ratingStars) {
            console.log("Không tìm thấy .rating-stars");
            return;
        }

        const starElements = ratingStars.querySelectorAll('.fa-star');
        const ratingValue = document.querySelector('.rating-value');
        avgRating = parseFloat(ratingStars.getAttribute('data-rating')) || 0;
        ratingCount = parseInt(ratingStars.getAttribute('data-rating-count')) || 0;

        // Lấy rating cá nhân của user
        const userId = getCurrentUserId();
        if (userId) {
            fetch(`/truyenviethay/api/api.php?action=get_user_rating&truyen_id=${getQueryParam("truyen_id")}&user_id=${userId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.user_rating) {
                        currentUserRating = data.user_rating;
                        updateStars(starElements, currentUserRating);
                        ratingValue.textContent = `${currentUserRating.toFixed(1)}/5 (${avgRating.toFixed(1)} trên tổng ${ratingCount} người đánh giá)`;
                    } else {
                        updateStars(starElements, 0);
                        ratingValue.textContent = `0/5 (${avgRating.toFixed(1)} trên tổng ${ratingCount} người đánh giá)`;
                    }
                })
                .catch(err => console.log("Lỗi lấy rating cá nhân:", err));
        } else {
            updateStars(starElements, 0);
            ratingValue.textContent = `0/5 (${avgRating.toFixed(1)} trên tổng ${ratingCount} người đánh giá)`;
        }

        console.log("Rating trung bình ban đầu:", avgRating);
        console.log("Số người đánh giá ban đầu:", ratingCount);
        console.log("Số sao tìm thấy:", starElements.length);

        starElements.forEach((star, index) => {
            star.addEventListener('mousemove', (event) => {
                const rect = star.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const starWidth = rect.width;
                const decimal = Math.round((x / starWidth) * 10) / 10;
                const score = index + decimal;
                highlightStars(starElements, score);
            });

            star.addEventListener('mouseleave', () => {
                updateStars(starElements, currentUserRating);
            });

            star.addEventListener('click', (event) => {
                console.log("Nhấn sao thứ:", index + 1);
                const truyenId = getQueryParam("truyen_id");
                if (!truyenId) {
                    alert("Không tìm thấy truyện để đánh giá!");
                    return;
                }
                const rect = star.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const starWidth = rect.width;
                const decimal = Math.round((x / starWidth) * 10) / 10;
                const score = index + decimal;

                if (currentUserRating > 0) {
                    if (!confirm("Bạn đã đánh giá trước đó. Bạn có muốn thay đổi đánh giá không?")) {
                        return;
                    }
                }
                sendRating(truyenId, score);
            });
        });
    }

    setTimeout(attachRatingEvents, 100);
}

function highlightStars(stars, score) {
    stars.forEach((star, i) => {
        if (i + 1 <= Math.floor(score)) {
            star.classList.add('rated');
            star.classList.remove('rated-half');
        } else if (i < score) {
            star.classList.add('rated-half');
            star.classList.remove('rated');
        } else {
            star.classList.remove('rated', 'rated-half');
        }
    });
    const ratingValue = document.querySelector('.rating-value');
    ratingValue.textContent = `${score.toFixed(1)}/5 (${avgRating.toFixed(1)} trên tổng ${ratingCount} người đánh giá)`;
}

function updateStars(stars, rating) {
    stars.forEach((star, i) => {
        if (i + 1 <= Math.floor(rating)) {
            star.classList.add('rated');
            star.classList.remove('rated-half');
        } else if (i < rating) {
            star.classList.add('rated-half');
            star.classList.remove('rated');
        } else {
            star.classList.remove('rated', 'rated-half');
        }
    });
}

function sendRating(truyenId, score) {
    const userId = getCurrentUserId();
    console.log("User ID:", userId);
    if (!userId) {
        alert("Đăng nhập để đánh giá");
        return;
    }

    console.log("Sending rating:", { truyen_id: truyenId, score: score, user_id: userId });
    fetch("/truyenviethay/api/api.php?action=rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ truyen_id: truyenId, score: score, user_id: userId })
    })
    .then(res => {
        if (!res.ok) throw new Error(`API rating lỗi: ${res.status}`);
        return res.json();
    })
    .then(data => {
        console.log("Rating response:", data);
        if (data.success) {
            currentUserRating = score; // Cập nhật rating cá nhân
            avgRating = data.new_rating; // Cập nhật trung bình
            ratingCount = data.rating_count; // Cập nhật số người vote
            const ratingStars = document.querySelector('.rating-stars');
            ratingStars.setAttribute('data-rating', avgRating);
            ratingStars.setAttribute('data-rating-count', ratingCount);
            updateStars(document.querySelectorAll('.fa-star'), currentUserRating);
            const ratingValue = document.querySelector('.rating-value');
            ratingValue.textContent = `${score.toFixed(1)}/5 (${data.new_rating.toFixed(1)} trên tổng ${data.rating_count} người đánh giá)`;
        } else {
            alert(data.message);
        }
    })
    .catch(err => console.log("Lỗi gửi rating:", err));
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function getCurrentUserId() {
    return localStorage.getItem("user_id") || null;
}