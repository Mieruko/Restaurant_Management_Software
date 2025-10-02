# Restaurant_Management_Software

<<<<<<< HEAD
<<<<<<< HEAD
# Backend – Tables, Menu, Order Module

## Mục tiêu
Phát triển các API cho:
- **Tables**: quản lý bàn ăn (CRUD, trạng thái bàn).
- **Menu**: quản lý thực đơn (CRUD món ăn).
- **Orders**: quản lý order (tạo order mới, cập nhật, lấy chi tiết).

Nhánh này chỉ phụ trách **Tables + Menu + Orders**, không can thiệp vào Invoice, Staff hay Auth.

---

## Cấu trúc thư mục mẫu có tự thay đổi
backend/src
|
├── models/
│ ├── Table.js # Định nghĩa model Table
│ ├── Menu.js # Định nghĩa model Menu
│ └── Order.js # Định nghĩa model Order
│
├── controllers/
│ ├── tableController.js # Logic cho Tables
│ ├── menuController.js # Logic cho Menu
│ └── orderController.js # Logic cho Orders
│
├── routes/
│ ├── tableRoutes.js # API endpoint cho Tables
│ ├── menuRoutes.js # API endpoint cho Menu
│ └── orderRoutes.js # API endpoint cho Orders
│
├── tests/
│ ├── table.test.js # Test cho Tables
│ ├── menu.test.js # Test cho Menu
│ └── order.test.js # Test cho Orders
│
├── app.js # Express app
└── server.js # Điểm chạy server


---

##  Cách cài đặt & chạy
1. Cài dependencies:
   ```bash
   npm install
2. Chạy server:
    npm start
    Server mặc định chạy tại:
    http://localhost:3000/api


Endpoint API
    Tables
        GET /api/tables → Lấy danh sách bàn.
        POST /api/tables → Thêm bàn mới.
        PUT /api/tables/:id → Cập nhật thông tin bàn.
        DELETE /api/tables/:id → Xóa bàn.

        Ví dụ response(GET /api/tables):

        [
        { "id": 1, "tenBan": "Bàn 1", "trangThai": "Trống" },
        { "id": 2, "tenBan": "Bàn 2", "trangThai": "Đang phục vụ" }
        ]

    Menu
        GET /api/menu → Lấy danh sách món ăn.
        POST /api/menu → Thêm món mới.
        PUT /api/menu/:id → Cập nhật món ăn.
        DELETE /api/menu/:id → Xóa món ăn.

        Ví dụ response (GET /api/menu):
        [
        { "id": 1, "tenMon": "Phở bò", "gia": 45000, "loai": "Món chính" },
        { "id": 2, "tenMon": "Coca-Cola", "gia": 15000, "loai": "Đồ uống" }
        ]

    Orders

        POST /api/orders → Tạo order mới cho bàn.
        GET /api/orders/:id → Lấy chi tiết order.
        PUT /api/orders/:id → Cập nhật trạng thái order.

        Ví dụ request (POST /api/orders):
        {
        "tableId": 1,
        "items": [
            { "monId": 1, "soLuong": 2 },
            { "monId": 2, "soLuong": 1 }
        ]
        }

Test API
Chạy toàn bộ test:
    npm test

Test được viết trong:
    tests/table.test.js
    tests/menu.test.js
    tests/order.test.js

✅ Ghi chú cho team
Đảm bảo trả về đúng JSON format theo docs/api-spec.md.
Có thể dùng dữ liệu mock trong controller trước khi tích hợp database.
Khi FE chưa hoàn thành, test API bằng Postman hoặc npm test.
Sau khi hoàn thành, commit code và tạo Pull Request vào develop.
=======
=======
>>>>>>> feature/backend-invoice
c

r
Sao chép mã

##  Cách chạy
1 Cài dependencies (nếu chưa có):
   ```bash
   npm install
## 2.Chạy server:
npm start
Mặc định server chạy tại: http://localhost:3000/api

Endpoint chính
    Invoice
    GET /api/invoices → Lấy danh sách hóa đơn.
    GET /api/invoices/:id → Lấy chi tiết hóa đơn.
    POST /api/invoices → Tạo hóa đơn mới.

    Staff
    GET /api/staff → Lấy danh sách nhân viên.
    POST /api/staff → Thêm nhân viên.
    PUT /api/staff/:id → Cập nhật nhân viên.
    DELETE /api/staff/:id → Xóa nhân viên.

    Report
    GET /api/reports/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD → Báo cáo doanh thu.
    GET /api/reports/top-foods → Top món ăn bán chạy.

Test
Chạy test cho toàn bộ module:
npm test

Các file test:
    tests/invoice.test.js
    tests/staff.test.js
    tests/report.test.js

Ghi chú cho team
Đảm bảo API trả đúng format như trong docs/api-spec.md.
Có thể dùng dữ liệu mock trong controller trước khi kết nối database.
Test API bằng Postman hoặc file test để chắc chắn chạy đúng.
<<<<<<< HEAD
Sau khi hoàn thiện, commit và tạo Pull Request vào develop.
>>>>>>> feature/backend-invoice
=======
Sau khi hoàn thiện, commit và tạo Pull Request vào develop.
>>>>>>> feature/backend-invoice
