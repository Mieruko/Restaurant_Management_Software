const express = require("express");
const invoiceController = require("../controllers/invoicesController");
const router = express.Router();

router.get("/", invoiceController.getAllInvoices);
router.get("/:id", invoiceController.getInvoiceById);
router.post("/", invoiceController.createInvoice);
router.put("/:id", invoiceController.updateOrder);

module.exports = router;
