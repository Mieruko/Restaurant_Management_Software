const express = require("express");
const router = express.Router();

let menu = [
  { id: 1, tenMon: "Phở bò", gia: 45000, loai: "Món chính" },
  { id: 2, tenMon: "Coca-Cola", gia: 15000, loai: "Đồ uống" },
];

// GET all
router.get("/", (req, res) => {
  res.json(menu);
});

// POST new
router.post("/", (req, res) => {
  const newItem = { id: menu.length + 1, ...req.body };
  menu.push(newItem);
  res.status(201).json(newItem);
});

// PUT update
router.put("/:id", (req, res) => {
  const item = menu.find((m) => m.id == req.params.id);
  if (!item) return res.status(404).json({ message: "Không tìm thấy món ăn" });
  Object.assign(item, req.body);
  res.json(item);
});

// DELETE
router.delete("/:id", (req, res) => {
  menu = menu.filter((m) => m.id != req.params.id);
  res.json({ message: "Đã xóa món ăn" });
});

module.exports = router;
