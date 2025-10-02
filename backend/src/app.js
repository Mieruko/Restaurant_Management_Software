const express = require('express');
const app = express();

const invoiceRoutes = require("./routes/invoiceRoutes");
const reportRoutes = require("./routes/reportRoutes");
const staffRoutes = require("./routes/staffRoutes");

app.use("/api/invoices", invoiceRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/staff", staffRoutes);

module.exports = app; // export app để server.js dùng
