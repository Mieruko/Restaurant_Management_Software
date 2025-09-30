const express = require("express");
const app = express();

app.use(express.json());

// Route mặc định
app.get("/api", (req, res) => {
  res.json({ message: "Chào mừng đến với API Nhà hàng" });
});

// Import các routes
const tableRoutes = require("./routes/tableRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");

app.use("/api/tables", tableRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);

module.exports = app;
