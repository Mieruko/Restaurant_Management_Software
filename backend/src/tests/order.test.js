const request = require("supertest");
const app = require("../app");

let orderId; // lưu lại để test GET và PUT

describe("Orders API", () => {
  it("POST /api/orders → tạo order mới", async () => {
    const newOrder = {
      tableId: 1,
      items: [
        { monId: 1, soLuong: 2 },
        { monId: 2, soLuong: 1 },
      ],
    };
    const res = await request(app).post("/api/orders").send(newOrder);
    expect(res.statusCode).toEqual(201);
    expect(res.body.tableId).toBe(1);
    orderId = res.body.id; // lưu id để test tiếp
  });

  it("GET /api/orders/:id → lấy chi tiết order", async () => {
    const res = await request(app).get(`/api/orders/${orderId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toBe(orderId);
  });

  it("PUT /api/orders/:id → cập nhật trạng thái order", async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}`)
      .send({ trangThai: "Hoàn thành" });
    expect(res.statusCode).toEqual(200);
    expect(res.body.trangThai).toBe("Hoàn thành");
  });
});
