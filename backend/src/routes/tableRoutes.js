const express = require("express");
const router = express.Router();

let tables = [
  { id: 1, tenBan: "Bàn 1", trangThai: "Trống" },
  { id: 2, tenBan: "Bàn 2", trangThai: "Đang phục vụ" },
];

// GET all tables
router.get("/", (req, res) => {
  res.json(tables);
});

// POST new table
router.post("/", (req, res) => {
  const newTable = { id: tables.length + 1, ...req.body };
  tables.push(newTable);
  res.status(201).json(newTable);
});

// PUT update table
router.put("/:id", (req, res) => {
  const table = tables.find((t) => t.id == req.params.id);
  if (!table) return res.status(404).json({ message: "Không tìm thấy bàn" });
  Object.assign(table, req.body);
  res.json(table);
});

// DELETE table
router.delete("/:id", (req, res) => {
  tables = tables.filter((t) => t.id != req.params.id);
  res.json({ message: "Đã xóa bàn" });
});

module.exports = router;
