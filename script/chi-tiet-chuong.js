export function initChiTietChuong() {
  const state = {
    truyenId: new URLSearchParams(window.location.search).get("truyen_id"),
    chapterId: new URLSearchParams(window.location.search).get("chapter_id"),
  };

  if (!state.truyenId || !state.chapterId) {
    console.error("Lỗi: Không có ID truyện hoặc chương!");
    return;
  }

  handleUserProfile();
  loadCategories();
  loadChapterDetails(state);
}

// Xử lý thông tin người dùng
function handleUserProfile() {
  fetch("/truyenviethay/api/api.php?action=profile")
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        window.location.href =
          data.redirect || "/truyenviethay/users/login.html";
        return;
      }
      updateUserInterface(data.data);
    })
    .catch((error) => console.error("Lỗi khi tải thông tin người dùng", error));
}

function updateUserInterface(userData) {
  const elements = {
    loginBtn: document.getElementById("login-btn"),
    registerBtn: document.getElementById("register-btn"),
    userInfo: document.getElementById("user-info"),
    userAvatar: document.getElementById("user-avatar"),
  };

  if (elements.loginBtn) elements.loginBtn.style.display = "none";
  if (elements.registerBtn) elements.registerBtn.style.display = "none";
  if (elements.userInfo) elements.userInfo.style.display = "block";
  if (elements.userAvatar && userData.avatar) {
    elements.userAvatar.src = "../" + userData.avatar;
  }
}

// Tải danh sách thể loại
function loadCategories() {
  fetch("/truyenviethay/api/api.php?action=theloai&subaction=categories")
    .then((res) => res.json())
    .then((data) => {
      const theloaiContainer = document.getElementById("theloai-container");
      if (!theloaiContainer) return;

      if (data.success && Array.isArray(data.data)) {
        theloaiContainer.innerHTML =
          data.data
            .map(
              (theloai) =>
                `<a href="../truyen/the-loai.html?theloai[]=${theloai.id_theloai}" class="theloai-item">${theloai.ten_theloai}</a>`
            )
            .join("") +
          `<a href="../truyen/the-loai.html" class="theloai-item xem-tat-ca">Xem tất cả thể loại</a>`;
      } else {
        theloaiContainer.innerHTML = "<p>Chưa có thể loại nào.</p>";
      }
    })
    .catch((error) => console.error("Lỗi khi tải thể loại", error));
}

// Tải chi tiết chương
function loadChapterDetails(state) {
  fetch(
    `/truyenviethay/api/chi-tiet-chuong.php?truyen_id=${state.truyenId}&chapter_id=${state.chapterId}`
  )
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        console.error("Lỗi khi tải chi tiết chương:", data.error);
        return;
      }
      renderChapterDetails(data, state);
    })
    .catch((error) => console.error("Lỗi khi tải chi tiết chương", error));
}

function renderChapterDetails(data, state) {
  const chapterTitle = document.getElementById("chapter-title");
  const details = document.getElementById("chapter-details");

  if (!chapterTitle || !details) return;

  chapterTitle.textContent = `CHI TIẾT CHƯƠNG - ${data.ten_truyen}`;

  details.innerHTML = `
    <h3>Chương ${data.chapter.so_chuong}: ${data.chapter.tieu_de}</h3>
    <p><strong>Ngày đăng:</strong> ${data.chapter.thoi_gian_dang}</p>
    <p><strong>Lượt xem:</strong> ${data.chapter.luot_xem}</p>
    <p><strong>Trạng thái:</strong> ${getChapterStatus(data.chapter)}</p>
    <div class="noi-dung-chuong">
      <h4>Nội Dung</h4>
      <div id="chapter-content" class="chapter-content">${
        data.chapter.noi_dung
      }</div>
    </div>
    <div class="action-buttons">
      ${
        data.is_admin || data.is_author
          ? `<button class="save-btn" id="save-btn">Lưu</button>`
          : ""
      }
      <a href="quan-ly-chuong.html?truyen_id=${
        state.truyenId
      }" class="back-btn">Quay lại</a>
    </div>
  `;

  setTimeout(() => {
    initializeTinyMCE();
  }, 500);

  attachSaveEventListener(data, state);
}

function getChapterStatus(chapter) {
  switch (chapter.trang_thai) {
    case "cho_duyet":
      return '<span style="color: orange;">Chờ duyệt</span>';
    case "da_duyet":
      return '<span style="color: green;">Đã duyệt</span>';
    case "tu_choi":
      return `<span style="color: red;">Từ chối${
        chapter.ly_do_tu_choi
          ? ` (Lý do: ${chapter.ly_do_tu_choi})`
          : " (Không có lý do cụ thể)"
      }</span>`;
    default:
      return `<span style="color: gray;">Không rõ</span>`;
  }
}

function initializeTinyMCE() {
  tinymce.init({
    selector: "#chapter-content",
    inline: true,
    height: 500,
    menubar: false,
    plugins:
      "advlist autolink lists link charmap preview searchreplace fullscreen code help",
    toolbar:
      "undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link code",
    content_style: "body { font-size:14px; line-height:1.6; }",
  });
}

function attachSaveEventListener(data, state) {
  const saveBtn = document.getElementById("save-btn");
  if (!saveBtn) return;

  saveBtn.addEventListener("click", () => {
    if (!confirm("Bạn có chắc chắn muốn lưu thay đổi không?")) return;

    const editor = tinymce.get("chapter-content");
    if (!editor) {
      alert("Lỗi: Trình soạn thảo chưa được tải.");
      return;
    }

    const noiDung = editor.getContent();
    if (!noiDung.trim()) {
      alert("Nội dung không được để trống!");
      return;
    }

    const formData = new FormData();
    formData.append("action", "update");
    formData.append("truyen_id", state.truyenId);
    formData.append("chapter_id", state.chapterId);
    formData.append("noi_dung", noiDung);

    fetch("/truyenviethay/api/chi-tiet-chuong.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((response) => {
        if (!response.success) throw new Error(response.error);
        alert(response.message);
      })
      .catch((error) => alert(`Lỗi khi lưu: ${error.message || error}`));
    //vô hiệu hóa TinyMCE sau khi lưu
    tinymce.remove("#chapter-content");
    document.getElementById("chapter-content").contentEditable = false;
  });
}
