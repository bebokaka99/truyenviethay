export function timeAgo(timestamp) {
  const now = new Date();
  const diff = (now - new Date(timestamp)) / 1000;

  if (diff < 60) return Math.floor(diff) + " giây trước";
  else if (diff < 3600) return Math.floor(diff / 60) + " phút trước";
  else if (diff < 86400) return Math.floor(diff / 3600) + " giờ trước";
  else if (diff < 2592000) return Math.floor(diff / 86400) + " ngày trước";
  else if (diff < 31536000) return Math.floor(diff / 2592000) + " tháng trước";
  else return Math.floor(diff / 31536000) + " năm trước";
}

// Hàm cắt chuỗi chỉ lấy phần "Chương X"
function getChapterNumber(chapter) {
  if (!chapter || chapter === "Chương 1") return "Chương 1";
  // Cắt chuỗi tại dấu ":" và lấy phần đầu
  const parts = chapter.split(":");
  return parts[0].trim(); // Trả về "Chương X"
}

export function initTruyen() {
  // Kiểm tra đăng nhập
  fetch("/truyenviethay/api/api.php?action=profile")
    .then((res) => res.json())
    .then((data) => {
      console.log("Dữ liệu API profile:", data); // Debug
      const loginButtons = document.getElementById("login-buttons");
      const userInfo = document.getElementById("user-info");
      const userAvatar = document.getElementById("user-avatar");

      if (data.success) {
        loginButtons.style.display = "none";
        userInfo.style.display = "block";
        userAvatar.src = "../" + data.data.avatar;
      } else if (data.error) {
        loginButtons.style.display = "block";
        userInfo.style.display = "none";
      } else {
        console.error("Dữ liệu API không hợp lệ:", data);
        loginButtons.style.display = "block";
        userInfo.style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Lỗi khi gọi API profile:", error);
      const loginButtons = document.getElementById("login-buttons");
      const userInfo = document.getElementById("user-info");
      loginButtons.style.display = "block";
      userInfo.style.display = "none";
    });

  // Load thể loại
  fetch("/truyenviethay/api/api.php?action=theloai&subaction=categories")
    .then((res) => res.json())
    .then((data) => {
      const theloaiContainer = document.getElementById("theloai-container");
      if (!data.success || !data.data.length) {
        theloaiContainer.innerHTML = "<p>Chưa có thể loại nào.</p>";
        return;
      }
      data.data.forEach((theloai) => {
        theloaiContainer.innerHTML += `<a href="truyen/the-loai.html?theloai[]=${theloai.id_theloai}" class="theloai-item">${theloai.ten_theloai}</a>`;
      });
      theloaiContainer.innerHTML += `<a href="truyen/the-loai.html" class="theloai-item xem-tat-ca">Xem tất cả thể loại</a>`;
    });

  // Load truyện chính (Tác giả Việt mới cập nhật)
  fetch("/truyenviethay/api/api.php?action=truyen&subaction=new")
    .then((res) => res.json())
    .then((data) => {
      console.log("Dữ liệu Tác giả Việt mới cập nhật:", data); // Debug
      const mainContainer = document.getElementById("main-truyen-container");
      if (!data.success || !data.data.length) {
        mainContainer.innerHTML = "<p>Chưa có truyện nào.</p>";
        return;
      }

      mainContainer.innerHTML = `
                <div class="hien-thi-truyen">
                    <div class="tieu-de-truyen">
                        <i class="fas fa-book"></i>
                        <h2>Truyện Tác giả Việt mới cập nhật</h2>
                    </div>
                    <div class="luoi-truyen">
                        ${data.data
                          .map(
                            (truyen) => `
                            <div class="khoi-truyen">
                                <a href="truyen/chi-tiet-truyen.html?truyen_id=${
                                  truyen.id
                                }">
                                    ${
                                      truyen.anh_bia
                                        ? `<img src="anh/${truyen.anh_bia}" alt="${truyen.ten_truyen}" class="anh-truyen">`
                                        : `<div class="error-image">Không có ảnh</div>`
                                    }
                                    <div class="thong-tin-truyen">
                                        <div class="thoi-gian-danh-gia">
                                            <span class="thoi-gian">${timeAgo(
                                              truyen.thoi_gian_cap_nhat
                                            )}</span>
                                            <span class="danh-gia"><i class="fas fa-star"></i> ${
                                              truyen.rating || 0
                                            }</span>
                                        </div>
                                        <a href="truyen/chi-tiet-truyen.html?truyen_id=${
                                          truyen.id
                                        }">
                                            <h3>${truyen.ten_truyen}</h3>
                                        </a>
                                        <a href="#" class="chuong-moi">${
                                          getChapterNumber(
                                            truyen.chuong_moi_nhat
                                          ) || "Chương 1"
                                        }</a>
                                    </div>
                                </a>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                    <a href="truyen/the-loai.html?sort=thoi_gian_cap_nhat_desc" class="nut_xem_them">Xem thêm...</a>
                </div>`;
    });

  // Load truyện top rating
  fetch("/truyenviethay/api/api.php?action=truyen&subaction=top_rating")
    .then((res) => res.json())
    .then((data) => {
      console.log("Dữ liệu Top Rating:", data); // Debug
      const ratingContainer = document.getElementById(
        "rating-truyen-container"
      );
      if (!data.success || !data.data.length) {
        ratingContainer.innerHTML = "<p>Chưa có truyện nào.</p>";
        return;
      }

      ratingContainer.innerHTML = `
                <div class="binh-chon-truyen">
                    <div class="tieu-de-binh-chon">
                        <div class="flex canh-giua khoang-cach-1">
                            <i class="fas fa-star bieu-tuong-xanh"></i>
                            <h2 class="chu-lon chu-dam">Top Rating</h2>
                        </div>
                        <div class="flex canh-giua khoang-cach-2">
                            <a href="truyen/the-loai.html?sort=lượt_xem_desc" class="lien-ket-do">Xem Nhiều</a>
                            <a href="truyen/the-loai.html?sort=rating_desc" class="lien-ket-xanh">Xem Thêm</a>
                        </div>
                    </div>
                    <div class="luoi-binh-chon">
                        ${data.data
                          .map(
                            (truyen) => `
                            <div class="khoi-truyen-binh-chon">
                                <a href="truyen/chi-tiet-truyen.html?truyen_id=${
                                  truyen.id
                                }">
                                    ${
                                      truyen.anh_bia
                                        ? `<img src="anh/${truyen.anh_bia}" alt="${truyen.ten_truyen}" class="anh-truyen-binh-chon">`
                                        : `<div class="error-image">Không có ảnh</div>`
                                    }
                                </a>
                                <div class="thong-tin-binh-chon">
                                    <a href="truyen/chi-tiet-truyen.html?truyen_id=${
                                      truyen.id
                                    }">
                                        <h3 class="chu-dam">${
                                          truyen.ten_truyen
                                        }</h3>
                                    </a>
                                    <a href="#" class="chuong-moi">${
                                      getChapterNumber(
                                        truyen.chuong_moi_nhat
                                      ) || "Chương 1"
                                    }</a>
                                    <div class="flex canh-giua khoang-cach-2">
                                        <i class="fas fa-star chu-den"></i>
                                        <span>${truyen.rating || 0}</span>
                                    </div>
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                    <a href="truyen/the-loai.html?sort=rating_desc" class="nut_xem_them">Xem thêm...</a>
                </div>`;
    });
}
