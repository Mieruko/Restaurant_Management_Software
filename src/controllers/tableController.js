let tables = [
  { id: 1, tenBan: "Bàn 1", trangThai: "Trống" },
  { id: 2, tenBan: "Bàn 2", trangThai: "Đang phục vụ" },
];

exports.getTables = (req, res) => {
  res.json(tables);
};

exports.createTable = (req, res) => {
  const newTable = {
    id: tables.length + 1,
    tenBan: req.body.tenBan,
    trangThai: req.body.trangThai || "Trống",
  };
  tables.push(newTable);
  res.status(201).json(newTable);
};

exports.updateTable = (req, res) => {
  const { id } = req.params;
  const table = tables.find((t) => t.id === parseInt(id));
  if (!table) return res.status(404).json({ message: "Không tìm thấy bàn" });

  table.tenBan = req.body.tenBan || table.tenBan;
  table.trangThai = req.body.trangThai || table.trangThai;
  res.json(table);
};

exports.deleteTable = (req, res) => {
  const { id } = req.params;
  tables = tables.filter((t) => t.id !== parseInt(id));
  res.json({ message: "Đã xóa bàn" });
};
