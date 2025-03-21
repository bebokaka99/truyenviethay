📖 Giới thiệu
Truyenviethay là nơi kết nối cộng đồng yêu truyện Việt:

Độc giả: Đọc, tìm kiếm, theo dõi, thích, bình luận truyện.
Tác giả: Đăng truyện, quản lý chương, nhận phản hồi.
Admin: Quản lý nội dung, duyệt chương, giám sát hệ thống.
Mục tiêu: Mang đến trải nghiệm đọc truyện mượt mà và xây dựng cộng đồng sáng tạo truyện Việt.

✨ Tính năng
Đọc truyện, lọc thể loại, theo dõi, xem lịch sử đọc.
Đăng/quản lý truyện và chương (tác giả).
Duyệt nội dung, kiểm soát người dùng (admin).
Tương tác: Thích, bình luận, tìm kiếm nhanh.
Đã phát triển thêm: Quản lý chương chi tiết, chỉnh/xóa truyện, gợi ý truyện.

🚀 Tính năng sắp tới
Chế độ đọc ban đêm, thông báo đẩy.
Bảng xếp hạng, tải offline, donate tác giả.
AI gợi ý truyện, app mobile (Android/iOS).
🛠 Cài đặt
Clone repo:
bash

Collapse

Wrap

Copy
git clone https://github.com/bebokaka99/truyenviethay.git
Chạy XAMPP, import file SQL vào MySQL.
Truy cập: http://localhost/truyenviethay.
📂 Cấu trúc
text

Collapse

Wrap

Copy
truyenviethay/
├── api/          # API xử lý (login, truyen,...)
├── anh/          # Ảnh bìa, avatar, logo
├── css/          # CSS giao diện
├── script/       # JS logic
├── truyen/       # File truyện (PHP/HTML)
├── users/        # File người dùng (PHP/HTML)
├── config.php    # Cấu hình DB
├── index.html    # Trang chủ
💾 Database
Công nghệ: MySQL (truyenviethay_new).
Bảng chính: truyen_new, chuong, users_new, comments, thich, theo_doi,... (15 bảng).
🧰 Công nghệ
Backend: PHP, MySQL.
Frontend: HTML, CSS, JavaScript.
Server: XAMPP.
🤝 Đóng góp
Fork và gửi pull request.
Báo lỗi/góp ý qua Issues.
📜 Giấy phép
© 2025 Truyenviethay.
