
const Report = require("../models/report");

const getRevenue = (req, res) => {
  const { from, to } = req.query;
  try {
    const tongDoanhThu = Report.calculateRevenue(from, to);
    res.json({ tongDoanhThu });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getTopFoods = (req, res) => {
  try {
    const topFoods = Report.getTopFoods();
    res.json(topFoods);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy top món ăn" });
  }
};


module.exports = {
  getRevenue,
  getTopFoods,
};