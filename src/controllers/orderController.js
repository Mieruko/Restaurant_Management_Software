let orders = [];
let nextOrderId = 1;

exports.createOrder = (req, res) => {
  const { tableId, items } = req.body;
  const newOrder = {
    id: nextOrderId++,
    tableId,
    items,
    trangThai: "Đang xử lý",
  };
  orders.push(newOrder);
  res.status(201).json(newOrder);
};

exports.getOrderById = (req, res) => {
  const { id } = req.params;
  const order = orders.find((o) => o.id === parseInt(id));
  if (!order) return res.status(404).json({ message: "Không tìm thấy order" });
  res.json(order);
};

exports.updateOrder = (req, res) => {
  const { id } = req.params;
  const order = orders.find((o) => o.id === parseInt(id));
  if (!order) return res.status(404).json({ message: "Không tìm thấy order" });

  order.trangThai = req.body.trangThai || order.trangThai;
  res.json(order);
};
