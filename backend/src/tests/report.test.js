const request = require("supertest");
const express = require("express");
const reportRoutes = require("../routes/reportRoutes");

// Mock invoices model
jest.mock("../models/invoices", () => {
  return {
    getAll: jest.fn(() => [
      {
        id: 1,
        ngayTao: "2025-09-25",
        items: [
          { name: "Phở bò", price: 30000, quantity: 2 },
          { name: "Cà phê", price: 20000, quantity: 1 },
        ],
      },
      {
        id: 2,
        ngayTao: "2025-09-27",
        items: [
          { name: "Phở bò", price: 30000, quantity: 1 },
          { name: "Trà sữa", price: 40000, quantity: 2 },
        ],
      },
    ]),
  };
});

const app = express();
app.use("/reports", reportRoutes);

describe("Report API", () => {
  describe("GET /reports/revenue", () => {
    it("should calculate revenue between dates", async () => {
      const res = await request(app).get(
        "/reports/revenue?from=2025-09-24&to=2025-09-28"
      );
      expect(res.statusCode).toBe(200);
      // doanh thu = (2*30000 + 20000) + (1*30000 + 2*40000) = 80000 + 110000 = 190000
      expect(res.body.tongDoanhThu).toBe(190000);
    });

    it("should return error if missing params", async () => {
      const res = await request(app).get("/reports/revenue?from=2025-09-24");
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "Thiếu tham số from/to");
    });
  });

  describe("GET /reports/top-foods", () => {
    it("should return top foods sorted by quantity", async () => {
      const res = await request(app).get("/reports/top-foods");
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([
        { tenMon: "Phở bò", soLuong: 3 },
        { tenMon: "Trà sữa", soLuong: 2 },
        { tenMon: "Cà phê", soLuong: 1 },
      ]);
    });
  });
});

