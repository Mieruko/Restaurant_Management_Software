# Restaurant_Management_Software

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
Sau khi hoàn thiện, commit và tạo Pull Request vào develop.