let menu = [
  { id: 1, tenMon: "Phở bò", gia: 45000, loai: "Món chính" },
  { id: 2, tenMon: "Coca-Cola", gia: 15000, loai: "Đồ uống" },
];

exports.getMenu = (req, res) => {
  res.json(menu);
};

exports.createMenu = (req, res) => {
  const newItem = {
    id: menu.length + 1,
    tenMon: req.body.tenMon,
    gia: req.body.gia,
    loai: req.body.loai,
  };
  menu.push(newItem);
  res.status(201).json(newItem);
};

exports.updateMenu = (req, res) => {
  const { id } = req.params;
  const item = menu.find((m) => m.id === parseInt(id));
  if (!item) return res.status(404).json({ message: "Không tìm thấy món" });

  item.tenMon = req.body.tenMon || item.tenMon;
  item.gia = req.body.gia || item.gia;
  item.loai = req.body.loai || item.loai;
  res.json(item);
};

exports.deleteMenu = (req, res) => {
  const { id } = req.params;
  menu = menu.filter((m) => m.id !== parseInt(id));
  res.json({ message: "Đã xóa món ăn" });
};
