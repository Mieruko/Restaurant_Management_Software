const request = require("supertest");
const app = require("../app"); // đúng đường dẫn

describe("API Cơ bản", () => {
  it("GET /api - trả về chào mừng", async () => {
    const res = await request(app).get("/api");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty(
      "message",
      "Chào mừng đến với API Nhà hàng"
    );
  });
});
