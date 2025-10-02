const request = require("supertest");
const express = require("express");
const invoiceRoutes = require("../routes/invoiceRoutes");
const invoicesController = require("../controllers/invoicesController");

const app = express();
app.use(express.json());
app.use("/invoices", invoiceRoutes);


describe("API Hoá đơn", () => {
  it("GET /invoices → trả về [] khi chưa có hóa đơn", async () => {
    const res = await request(app).get("/invoices");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("POST /invoices → tạo hóa đơn mới", async () => {
    const res = await request(app).post("/invoices").send({
      tableId: 1,
      items: [{ name: "Phở", price: 50000, quantity: 2 }],
      orderId: 99,
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id", 1);
    expect(res.body).toHaveProperty("tinhtrangThanhtoan", "Chuẩn bị hoá đơn");
  });

  it("GET /invoices/:id → lấy hóa đơn theo id", async () => {
    await request(app).post("/invoices").send({
      tableId: 1,
      items: [{ name: "Phở", price: 50000, quantity: 2 }],
      orderId: 99,
    });

    const res = await request(app).get("/invoices/1");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", 1);
  });

  it("PUT /invoices/:id → cập nhật tình trạng thanh toán", async () => {
    await request(app).post("/invoices").send({
      tableId: 1,
      items: [{ name: "Phở", price: 50000, quantity: 2 }],
      orderId: 99,
    });

    const res = await request(app).put("/invoices/1").send({
      tinhtrangThanhtoan: "Đã thanh toán",
    });

    expect(res.status).toBe(200);
    expect(res.body.tinhtrangThanhtoan).toBe("Đã thanh toán");
  });
});

