export function initTruyenTheoDoi() {
  const followedList = document.getElementById("followed-truyen-list");
  const noFollowed = document.getElementById("no-followed");

  if (!followedList || !noFollowed) {
    console.error("Không tìm thấy #followed-truyen-list hoặc #no-followed");
    return;
  }

  fetch("/truyenviethay/api/api.php?action=followed_truyen")
    .then((res) => res.json())
    .then((data) => {
      console.log("Danh sách truyện theo dõi:", data);
      if (data.error) {
        noFollowed.textContent = data.error;
        noFollowed.style.display = "block";
        return;
      }

      if (data.length === 0) {
        noFollowed.style.display = "block";
        return;
      }

      followedList.innerHTML = data
        .map((truyen) => {
          // Dùng time_ago từ API
          const timeAgo = truyen.time_ago;
          // Chapter mới nhất
          const hasChapter = truyen.chuong_moi_nhat_so_chuong && truyen.chuong_moi_nhat !== "Chưa có chương";
          const chapterLink = hasChapter
            ? `<a href="../truyen/chuong.html?truyen_id=${truyen.id}&chuong_id=${truyen.chuong_moi_nhat_so_chuong}">Đọc tiếp ${truyen.chuong_moi_nhat}</a>`
            : `<span>Chưa có chương</span>`;

          return `
            <div class="truyen-item">
                <div class="truyen-image">
                    <a href="../truyen/chi-tiet-truyen.html?truyen_id=${truyen.id}">
                        <img src="${
                          truyen.anh_bia_url || "/truyenviethay/anh/default.jpg"
                        }" alt="${truyen.ten_truyen}">
                    </a>
                    <span class="truyen-status">${timeAgo}</span>
                    <button class="unfollow-btn" data-truyen-id="${
                      truyen.id
                    }" title="Hủy theo dõi">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <h3>
                    <a href="../truyen/chi-tiet-truyen.html?truyen_id=${
                      truyen.id
                    }">${truyen.ten_truyen}</a>
                </h3>
                <p class="truyen-chapter">
                    ${chapterLink}
                </p>
            </div>
          `;
        })
        .join("");

      document.querySelectorAll(".unfollow-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const truyenId = btn.getAttribute("data-truyen-id");
          fetch("/truyenviethay/api/api.php?action=follow", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `truyen_id=${truyenId}`,
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.success && !res.followed) {
                btn.parentElement.parentElement.remove();
                if (!followedList.children.length)
                  noFollowed.style.display = "block";
              } else {
                alert(res.error || "Lỗi khi hủy theo dõi");
              }
            })
            .catch((err) => console.error("Lỗi khi hủy theo dõi:", err));
        });
      });
    })
    .catch((error) => {
      console.error("Lỗi khi tải truyện theo dõi:", error);
      noFollowed.textContent = "Lỗi khi tải danh sách. Vui lòng thử lại.";
      noFollowed.style.display = "block";
    });
}