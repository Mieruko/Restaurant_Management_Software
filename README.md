# Restaurant Management Software

Hướng dẫn (Tiếng Việt) để chạy project trên máy local.

Mô tả ngắn:
- Backend: Node.js + Express (thư mục `src/`)
- Giao diện quản trị: tệp tĩnh trong `public/dashboard/` (CSS: `public/css/`, JS: `public/js/`)
- Tệp SQL mẫu cho schema tiếng Việt: `db/quanlynhahang.sql`

Yêu cầu trước khi chạy
- Node.js (>=16) và npm
- (Tùy chọn) MySQL/MariaDB nếu bạn muốn bật chế độ sử dụng DB thật

1) Clone và cài phụ thuộc
```powershell
git clone <repo-url>
cd Restaurant_Management_Software
npm install
```

2) Cấu hình database (tùy chọn)
- Biến môi trường để kết nối MySQL (nếu bạn muốn dùng DB thật):
  - `DB_NAME` (mặc định: `quanlynhahang`)
  - `DB_USER` (mặc định: `root`)
  - `DB_PASS` (mặc định: ``)
  - `DB_HOST` (mặc định: `127.0.0.1`)
- Nếu dùng schema mẫu, import `db/quanlynhahang.sql` vào MySQL/MariaDB trước.

3) Chạy ứng dụng
```powershell
# Chạy với DB (khi bạn đã import schema và muốn dùng DB)
$env:USE_DB='true'; npm start

# Hoặc chạy chế độ demo (không cần DB; dùng dữ liệu in-memory)
npm start
```

4) Mở giao diện quản trị
- Mở `public/dashboard/report.html` hoặc trang khác trong folder `public/dashboard/` trực tiếp.
- Nếu server phục vụ thư mục `public`, truy cập `http://localhost:3000/`.

5) Chạy test
```powershell
npm test
```

Kiểm tra nhanh và debug
- Nếu gặp lỗi: `Port 3000 is already in use`:
  - Tìm process: `netstat -ano | findstr :3000`
  - Dừng process: `taskkill /PID <pid> /F`
- Nếu MySQL không kết nối: kiểm tra MySQL đang chạy và thông tin biến môi trường.
- Nếu "Top món"/báo cáo không có dữ liệu:
  1) Chắc chắn bạn đang chạy server với `USE_DB='true'` nếu muốn lấy từ DB thật.
  2) Kiểm tra DB đã có dữ liệu trong các bảng `hoa_don`, `chi_tiet_order`, `mon_an` (nếu dùng schema VN).
  3) Kiểm tra endpoint trực tiếp (PowerShell):
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/reports/top-foods?from=2025-10-01&to=2025-10-05" -Method Get
```
- Nếu endpoint trả về rỗng nhưng server log cho biết có rows:
  - Mở DevTools Console trên trình duyệt để kiểm tra client JS (các script trong `public/js/`).
  - Một số trình duyệt/HTTP cache có thể trả 304; dùng cache-buster hoặc `curl`/`Invoke-RestMethod` để kiểm tra.

Gợi ý nâng cấp (nếu cần)
- Tôi có thể thêm:
  - `.env.example` cho biến môi trường,
  - `docker-compose.yml` để dựng MySQL + app dễ dàng,
  - script seed DB để tạo dữ liệu mẫu.

Vị trí code quan trọng
- `src/controllers/` — các handler HTTP (reports, orders, invoices, customers, staff, tables).
- `src/config/db.js` — cấu hình Sequelize/MySQL.
- `src/services/` và `src/db_models/` — helper và mô hình DB.
- `public/dashboard/` — HTML trang admin; `public/js/` chứa logic client.

Nếu bạn muốn, tôi sẽ tiếp tục:
- Viết file `.env.example` và hướng dẫn chi tiết,
- Tạo `docker-compose.yml` + seed script để chạy nhanh trên máy mới,
- Hoặc thêm ghi chú chi tiết từng file controller (comment) bằng tiếng Việt.

---
README tạo bằng tiếng Việt — nếu muốn bổ sung chi tiết nào nữa, nói tôi sẽ cập nhật.