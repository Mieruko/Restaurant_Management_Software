const express = require("express");
const router = express.Router();

let orders = [];
let orderId = 1;

// POST new order
router.post("/", (req, res) => {
  const newOrder = {
    id: orderId++,
    tableId: req.body.tableId,
    items: req.body.items,
    trangThai: "Đang xử lý",
  };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// GET order detail
router.get("/:id", (req, res) => {
  const order = orders.find((o) => o.id == req.params.id);
  if (!order) return res.status(404).json({ message: "Không tìm thấy order" });
  res.json(order);
});

// PUT update order
router.put("/:id", (req, res) => {
  const order = orders.find((o) => o.id == req.params.id);
  if (!order) return res.status(404).json({ message: "Không tìm thấy order" });
  Object.assign(order, req.body);
  res.json(order);
});

module.exports = router;
