const request = require("supertest");
const app = require("../app");

describe("Menu API", () => {
  it("GET /api/menu → trả về danh sách món ăn", async () => {
    const res = await request(app).get("/api/menu");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/menu → thêm món mới", async () => {
    const newItem = { tenMon: "Bún chả", gia: 50000, loai: "Món chính" };
    const res = await request(app).post("/api/menu").send(newItem);
    expect(res.statusCode).toEqual(201);
    expect(res.body.tenMon).toBe("Bún chả");
  });

  it("PUT /api/menu/:id → cập nhật món ăn", async () => {
    const res = await request(app).put("/api/menu/1").send({ gia: 60000 });
    expect(res.statusCode).toEqual(200);
    expect(res.body.gia).toBe(60000);
  });

  it("DELETE /api/menu/:id → xóa món ăn", async () => {
    const res = await request(app).delete("/api/menu/2");
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("Đã xóa món ăn");
  });
});
