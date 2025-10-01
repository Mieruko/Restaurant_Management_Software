const Invoice = require("../models/invoices");

let invoices = [];
let nextInvoiceId = 1;

exports.getAllInvoices = (req, res) => {
  res.json(invoices);
};

exports.createInvoice = (req, res) => {
  const newInvoice = new Invoice(nextInvoiceId++, req.body);
  invoices.push(newInvoice);
  res.status(201).json(newInvoice);
};

exports.getInvoiceById = (req, res) => {
  const invoiceId = parseInt(req.params.id);
  const invoice = invoices.find((o) => o.id === invoiceId);
  if (!invoice) return res.status(404).json({ message: "Không có hoá đơn" });
  res.json(invoice);
};

exports.updateOrder = (req, res) => {
  const invoiceId = parseInt(req.params.id);
  const invoice = invoices.find((o) => o.id === invoiceId);
  if (!invoice) return res.status(404).json({ message: "Không có hoá đơn" });

  invoice.tinhtrangThanhtoan = req.body.tinhtrangThanhtoan || invoice.tinhtrangThanhtoan;
  res.json(invoice);
};
