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
- Đọc truyện (chuong.html), xem chi tiết truyện (chi-tiet-truyen.html), khám phá truyện (kham-pha-ngay.html).
- Tìm kiếm truyện, lọc theo thể loại (the-loai.html), theo dõi truyện, xem lịch sử đọc (lich_su_doc_new).
- Đăng ký (register.html), đăng nhập (login.html), xem và chỉnh sửa thông tin cá nhân (profile.html).

### Đối với tác giả
- Đăng tải truyện mới (quan-ly-truyen.html, quan-ly-truyen-tac-gia.html), thêm chương (tính năng chưa phát triển cần hỗ trợ).
- Quản lý truyện và chương của mình (tính năng chưa phát triển cần hỗ trợ).
- Theo dõi phản hồi của độc giả thông qua bình luận và số lượt thích.

### Đối với admin
- Quản lý toàn bộ truyện (quan-ly-truyen.html), phê duyệt chương, chỉnh sửa hoặc xóa truyện (chưa phát triển cần hỗ trợ).
- Theo dõi hoạt động người dùng, kiểm soát bình luận và xử lý vi phạm.

### Chức năng chung
- Hiển thị trang chủ (index.html), điều hướng chương, tìm kiếm truyện, và các tính năng tương tác (thích, theo dõi, bình luận).
- Hệ thống gợi ý truyện dựa trên sở thích và lịch sử đọc của người dùng (chưa phát triển).

## Các chức năng dự kiến trong tương lai
- **Chế độ đọc ban đêm** - Giúp bảo vệ mắt khi đọc truyện vào ban đêm.
- **Thông báo đẩy** - Cập nhật chương mới cho truyện theo dõi.
- **Hệ thống huy hiệu & thành tựu** - Độc giả có thể nhận huy hiệu khi đọc truyện nhiều.
- **Bảng xếp hạng truyện** - Hiển thị truyện phổ biến theo tuần, tháng, năm.
- **Chế độ tải xuống** - Cho phép người dùng tải chương về để đọc offline.
- **Hỗ trợ API** - Cung cấp API để tích hợp với ứng dụng mobile.
- **Hệ thống donate** - Độc giả có thể ủng hộ tác giả yêu thích.
- **Giao diện cá nhân hóa** - Cho phép người dùng tùy chỉnh màu sắc, font chữ, và bố cục trang đọc.
- **Tích hợp AI gợi ý truyện** - Đề xuất truyện dựa trên sở thích và hành vi đọc của người dùng.
- **Phát triển thành app mobile** - Tích hợp thành app trên mobile hỗ trợ cả android và IOS.
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
Cụ thể
Thư mục anh (D:\xampp\htdocs\truyenviethay\anh)
Chứa các file ảnh như ảnh bìa truyện, avatar người dùng, logo website, v.v.
Thư mục css (D:\xampp\htdocs\truyenviethay\css)
Chứa các file CSS thiết kế giao diện:
chuong.css: Thiết kế giao diện đọc truyện trong chuong.html.
index.css: Thiết kế trang chủ index.html.
login.css: Thiết kế trang đăng nhập login.html.
register.css: Thiết kế trang đăng ký register.html.
profile.css: Thiết kế trang thông tin người dùng profile.html.
quan-ly-truyen.css: Thiết kế trang quản lý truyện cho admin và tác giả quan-ly-truyen.html và quan-ly-truyen-tac-gia.html.
styles.css: Thiết kế tổng thể (header, footer, bố cục chính của website).
truyen.css: Thiết kế trang chi tiết truyện chi-tiet-truyen.html.
user.css: Thiết kế chung cho các trang liên quan đến người dùng.
dang-tai-truyen.css: Thiết kế giao diện đăng tải truyện.
the-loai.css: Thiết kế giao diện trang thể loại.
quan-ly-chuong.css: Thiết kế giao diện quản lý chương.
Thư mục truyen (D:\xampp\htdocs\truyenviethay\truyen)
Chứa các file html liên quan đến truyện:

chi-tiet-truyen.html: Hiển thị chi tiết một truyện.
dang-tai-truyen.html: Giao diện đăng tải truyện.
the-loai.html: Hiển thị danh sách truyện theo thể loại.
chuong.html: Hiển thị nội dung chương để đọc.
quan-ly-truyen.html: Quản lý truyện (dành cho admin).
quan-ly-truyen-tac-gia.html: Quản lý truyện (dành cho tác giả).
them-chuong.html: Thêm chương mới.
tim-kiem.html: trang trả kết quả sau khi tìm kiếm
Thư mục users (D:\xampp\htdocs\truyenviethay\users)
Chứa các file PHP liên quan đến người dùng:
logout.php: Đăng xuất.
login.html: Đăng nhập.
profile.html: Hiển thị thông tin người dùng.
register.html: Đăng ký tài khoản.
cai-dat-thong-tin.html: cài đặt thông tin người dùng.
Thư mục gốc (D:\xampp\htdocs\truyenviethay)
config.php: Cấu hình kết nối database.
index.html: Trang chủ.
Thư mục script (D:\xampp\htdocs\truyenviethay\script)
- chapter.js
- chi-tiet.js (js cho phần chi-tiet-truyen.html)
- chuong.js (js cho phần chuong.html)
- follow.js 
- forms.js 
- header.js (js dùng chung cho header)
- login.js (js cho login.html)
- manage-author.js (js cho phần quan-ly-truyen-tac-gia.html)
- manage.js (js cho phần quan-ly-truyen.html)
- navgation.js (js cho các nút chức năng chung)
- profile.js (js của phần profile.html)
- rating.js
- register.js (js cho phần register.html)
- script.js (các import và if chung của toàn bộ trang)
- search.js (js của thanh tìm kiếm và trang tim-kiem.html)
- settings.js (js cho cai-dat-thong-tin.html)
- slider.js (js cho phần thanh trượt truyện ở index)
- tasks.js (nhiệm vụ)
- theloai.js (js cho thể loại)
- truyen.js (js cho các gói truyện,...)
- upload.js (đăng tải truyện)
- utils.js
Thư mục api (D:\xampp\htdocs\truyenviethay\api)
api.php (các switch case cho các file api khác)
captcha.php (api cho phần captcha tự động ở register)
chapter.php
chi-tiet.php (api cho phần chi tiết truyện)
chuong.php (api cho phần trang đọc truyện)
comment.php (api cho comment hiện bị lỗi)
db.php (api cho các database chung)
follow.php (api cho follow hiện đang bị lỗi)
like.php (api cho like hiện đang bị lỗi)
manage-author.php (api cho quản lý truyện tác giả)
manager.php (api cho quản lý truyện)
moderation.php (api cho phần duyệt truyện)
profile.php (api cho phần profile)
register.php
login.php
search.php (api cho phần tìm kiếm)
settings.php (api cho phần cài đặt thông tin)
tasks.php (api nhiệm vụ)
theloai.php (api cho thể loại)
truyen.php (api truyện)
upload.php
user.php
## Database
Sử dụng MySQL với database `truyenviethay_new`, bao gồm các bảng:
- `author_level` - 
- `chuong` - Thông tin chương truyện.
- `comments ` - Bình luận của người dùng.
- `daily_tasks` - 
- `lich_su_doc_new` - Lịch sử đọc của người dùng.
- `theloai_new` - Danh sách thể loại truyện.
- `theo_doi_new` - Danh sách truyện được theo dõi.
- `thich` - Danh sách truyện được thích.
- `truyen_new` - Thông tin truyện.
- `truyen_theloai ` - Liên kết truyện với thể loại.
- `users_new` - Thông tin người dùng.
- `user_level` - 
- `user_tasks` - 

Hệ sinh thái hiện tại:
Frontend: HTML, CSS, JS
Backend: PHP sử dụng JS để gọi API xử lý HTML
Sử dụng phần mềm xampp để truy cập localhost và phpmyadmin để quản lý file

## Cài đặt và chạy dự án
1. **Clone project về máy**:
   ```sh
   git clone https://github.com/bebokaka99/truyenviethay.git (chưa up)
   ```
2. **Chạy XAMPP và import database**:
   - Khởi động Apache và MySQL trong XAMPP.
   - Import file SQL vào MySQL.
3. **Mở trang web**:
   - Truy cập `http://localhost/truyenviethay`

---
© 2025 Truyenviethay - Nền tảng đọc và chia sẻ truyện Việt.
