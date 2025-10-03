
const request = require("supertest");
const express = require("express");
const staffRoutes = require("../routes/staffRoutes")

const app = express()
app.use(express.json());
app.use("/staff", staffRoutes);

describe("API Nhân viên", () => {

  it("GET /staffs → trả về danh sách nhân viên", async () => {
    const res = await request(app).get("/staff");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("POST /staffs → thêm nhân viên mới", async () => {
    const newStaff = {
      tenNhanVien: "Phùng Thanh Độ",
      gioiTinh: "nam",
      chucVu: "Đầu bếp",
      trangThaiNV: "Đang thử việc"
    };

    const res = await request(app).post("/staff").send(newStaff);
    expect(res.status).toEqual(201);
    expect(res.body.tenNhanVien).toBe("Phùng Thanh Độ")
  });

  it("POST /staffs → trả lỗi khi thiếu thông tin bắt buộc", async () => {
    const res = await request(app).post("/staff").send({
      gioiTinh: "nữ"
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Thiếu thông tin bắt buộc");
  });

  it("PUT /staffs/:id → cập nhật nhân viên", async () => {
    const updateData = { chucVu: "Quản lý ca" };

    const res = await request(app)
      .put("/staff/101")
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.chucVu).toBe("Quản lý ca");
  });

  it("PUT /staffs/:id → trả lỗi khi nhân viên không tồn tại", async () => {
    const res = await request(app).put("/staff/99999").send({
      chucVu: "Không tồn tại"
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Không tìm thấy nhân viên");
  });

  it("DELETE /staffs/:id → xóa nhân viên", async () => {
    const res = await request(app).delete("/staff/102");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Đã xóa nhân viên");
  });

  it("DELETE /staffs/:id → trả lỗi khi nhân viên không tồn tại", async () => {
    const res = await request(app).delete("/staff/99999");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Không tìm thấy nhân viên");
  });
});