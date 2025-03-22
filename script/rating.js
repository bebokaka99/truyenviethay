export function initRating() {
    const ratingStars = document.querySelectorAll('.rating-stars');
    ratingStars.forEach(stars => {
        const rating = parseFloat(stars.getAttribute('data-rating'));
        const starElements = stars.querySelectorAll('.fa-star');
        for (let i = 0; i < starElements.length; i++) {
            if (i + 1 <= Math.floor(rating)) starElements[i].classList.add('rated');
            else if (i < rating) starElements[i].classList.add('rated-half');
        }
        starElements.forEach((star, index) => {
            star.addEventListener('click', () => {
                const newRating = index + 1;
                starElements.forEach((s, i) => {
                    if (i < newRating) s.classList.add('rated', 'rated-half');
                    else s.classList.remove('rated', 'rated-half');
                });
                stars.parentElement.querySelector('.rating-value').textContent = `${newRating}.0 / 5`;
            });
            star.addEventListener('mouseover', () => {
                starElements.forEach((s, i) => {
                    if (i <= index) s.classList.add('rated');
                    else s.classList.remove('rated', 'rated-half');
                });
            });
            star.addEventListener('mouseout', () => {
                starElements.forEach((s, i) => {
                    if (i + 1 <= Math.floor(rating)) s.classList.add('rated');
                    else if (i < rating) s.classList.remove('rated', 'rated-half');
                    else s.classList.remove('rated', 'rated-half');
                });
            });
        });
    });
}