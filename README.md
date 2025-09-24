# Restaurant_Management_Software

# Frontend – Login, Dashboard, Tables Module

##  Mục tiêu
Xây dựng giao diện cho:
- **Login**: đăng nhập hệ thống.
- **Dashboard**: trang chính sau khi đăng nhập, hiển thị thống kê nhanh.
- **Tables**: quản lý bàn ăn (xem danh sách bàn, thêm/sửa/xóa bàn).

## 📂 Cấu trúc thư mục đây là ví dụ
frontend/
├── assets/
│ ├── css/style.css
│ ├── js/main.js
│ └── img/
├── components/
│ ├── navbar.html
│ ├── tableComponent.html
│ └── modalTable.html
├── pages/
│ ├── login.html
│ ├── dashboard.html
│ └── tables.html
└── services/
    ├── apiAuth.js
    └── apiTables.js



## 🚀 Cách chạy
1. Mở `pages/login.html` trên trình duyệt để test giao diện login.  
2. Sau khi login → redirect sang `dashboard.html`.  
3. Từ **Dashboard**, có thể điều hướng đến **Tables**.  

Nếu Backend (BE) đã chạy, mặc định API URL là:
http://localhost:3000/api

##  Kết nối với Backend
### Auth
- `POST /api/auth/login` → Đăng nhập, trả về token + role.

### Tables
- `GET /api/tables` → Lấy danh sách bàn.
- `POST /api/tables` → Thêm bàn mới.
- `PUT /api/tables/:id` → Cập nhật thông tin bàn.
- `DELETE /api/tables/:id` → Xóa bàn.

##  Ghi chú cho team
- Có thể dùng dữ liệu mock trong `main.js` để dựng UI khi BE chưa xong.  
- Đảm bảo **tên field** (id, tenBan, trangThai, username, password) giống với `docs/api-spec.md`.  
- Các component (navbar, modal) nên tách riêng trong thư mục `components/` để tái sử dụng.  
- Sau khi xong, commit code vào branch này rồi tạo Pull Request vào `develop`.