# Truyenviethay

## Giới thiệu
Truyenviethay là một nền tảng đọc và đăng tải truyện trực tuyến, tập trung vào truyện Việt. Mục đích chính là:
- Cung cấp nơi để người dùng đọc truyện, khám phá truyện mới, theo dõi truyện yêu thích, và tương tác thông qua bình luận hoặc thích truyện.
- Cho phép tác giả đăng tải truyện của mình, quản lý truyện và chương, đồng thời nhận phản hồi từ độc giả.
- Admin có thể quản lý toàn bộ nội dung (truyện, chương, người dùng) và phê duyệt các chương do tác giả đăng tải.
- Hỗ trợ độc giả tìm kiếm nội dung nhanh chóng, lưu lại lịch sử đọc và đề xuất truyện phù hợp.
- Tạo một cộng đồng yêu thích truyện Việt, nơi tác giả và độc giả có thể kết nối với nhau.

## Các chức năng hiện có

### Đối với độc giả
- Đọc truyện (chuong.php), xem chi tiết truyện (chi-tiet-truyen.php), khám phá truyện (kham-pha-ngay.php).
- Tìm kiếm truyện, lọc theo thể loại (the-loai.php), theo dõi truyện, xem lịch sử đọc (lich_su_doc).
- Đăng ký (register.php), đăng nhập (login.php), xem và chỉnh sửa thông tin cá nhân (profile.php).

### Đối với tác giả
- Đăng tải truyện mới (quan-ly-truyen.php, quan-ly-truyen-tac-gia.php), thêm chương (them-chuong.php).
- Quản lý truyện và chương của mình (quan-ly-chuong.php).
- Theo dõi phản hồi của độc giả thông qua bình luận và số lượt thích.

### Đối với admin
- Quản lý toàn bộ truyện (quan-ly-truyen.php), phê duyệt chương, chỉnh sửa hoặc xóa truyện (edit-truyen.php).
- Theo dõi hoạt động người dùng, kiểm soát bình luận và xử lý vi phạm.

### Chức năng chung
- Hiển thị trang chủ (index.php), điều hướng chương, tìm kiếm truyện, và các tính năng tương tác (thích, theo dõi, bình luận).
- Hệ thống gợi ý truyện dựa trên sở thích và lịch sử đọc của người dùng.

## Cấu trúc thư mục
```
truyenviethay/
│-- anh/                # Chứa ảnh bìa truyện, avatar, logo
│-- css/                # Chứa các file CSS thiết kế giao diện
│-- truyen/             # Chứa các file PHP liên quan đến truyện
│-- users/              # Chứa các file PHP liên quan đến người dùng
│-- index.php           # Trang chủ
│-- config.php          # Cấu hình database
│-- script.js           # JavaScript chính của website
```

## Database
Sử dụng MySQL với database `truyenviethay`, bao gồm các bảng:
- `chuong` - Thông tin chương truyện.
- `comments` - Bình luận của người dùng.
- `lich_su_doc` - Lịch sử đọc của người dùng.
- `theloai` - Danh sách thể loại truyện.
- `theo_doi` - Danh sách truyện được theo dõi.
- `thich` - Danh sách truyện được thích.
- `truyen` - Thông tin truyện.
- `truyen_theloai` - Liên kết truyện với thể loại.
- `users` - Thông tin người dùng.

## Các chức năng dự kiến trong tương lai
- **Chế độ đọc ban đêm** - Giúp bảo vệ mắt khi đọc truyện vào ban đêm.
- **Thông báo đẩy** - Cập nhật chương mới cho truyện theo dõi.
- **Hệ thống huy hiệu & thành tựu** - Độc giả có thể nhận huy hiệu khi đọc truyện nhiều.
- **Bảng xếp hạng truyện** - Hiển thị truyện phổ biến theo tuần, tháng, năm.
- **Chế độ tải xuống** - Cho phép người dùng tải chương về để đọc offline.
- **Hỗ trợ API** - Cung cấp API để tích hợp với ứng dụng mobile.
- **Hệ thống donate** - Độc giả có thể ủng hộ tác giả yêu thích.
- **Chế độ đọc offline** - Lưu trữ các chương đã đọc để có thể xem lại khi không có mạng.
- **Giao diện cá nhân hóa** - Cho phép người dùng tùy chỉnh màu sắc, font chữ, và bố cục trang đọc.
- **Tích hợp AI gợi ý truyện** - Đề xuất truyện dựa trên sở thích và hành vi đọc của người dùng.

## Cài đặt và chạy dự án
1. **Clone project về máy**:
   ```sh
   git clone https://github.com/username/truyenviethay.git
   ```
2. **Chạy XAMPP và import database**:
   - Khởi động Apache và MySQL trong XAMPP.
   - Import file SQL vào MySQL.
3. **Mở trang web**:
   - Truy cập `http://localhost/truyenviethay`

---
© 2025 Truyenviethay - Nền tảng đọc và chia sẻ truyện Việt.
