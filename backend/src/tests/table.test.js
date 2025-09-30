const request = require("supertest");
const app = require("../app");

describe("Tables API", () => {
  it("GET /api/tables → trả về danh sách bàn", async () => {
    const res = await request(app).get("/api/tables");
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("POST /api/tables → thêm bàn mới", async () => {
    const newTable = { tenBan: "Bàn 3", trangThai: "Trống" };
    const res = await request(app).post("/api/tables").send(newTable);
    expect(res.statusCode).toEqual(201);
    expect(res.body.tenBan).toBe("Bàn 3");
  });

  it("PUT /api/tables/:id → cập nhật thông tin bàn", async () => {
    const res = await request(app)
      .put("/api/tables/1")
      .send({ trangThai: "Đang phục vụ" });
    expect(res.statusCode).toEqual(200);
    expect(res.body.trangThai).toBe("Đang phục vụ");
  });

  it("DELETE /api/tables/:id → xóa bàn", async () => {
    const res = await request(app).delete("/api/tables/2");
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("Đã xóa bàn");
  });
});
