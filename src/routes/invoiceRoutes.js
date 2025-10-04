const express = require("express");
const invoiceController = require("../controllers/invoicesController");
const router = express.Router();

// Printer endpoint (server-side print mock)
const printer = require('../services/printer');
router.post('/print', async (req, res) => {
	const html = req.body && (req.body.html || req.body.content);
	if (!html) return res.status(400).json({ error: 'Missing html content' });
	try {
		const out = await printer.printHtml(html);
		return res.json({ success: true, savedPath: out.path, publicUrl: out.publicUrl });
	} catch (err) {
		console.error('Print error', err);
		return res.status(500).json({ error: 'Print failed' });
	}
});

router.get("/", invoiceController.getAllInvoices);
router.get("/:id", invoiceController.getInvoiceById);
router.post("/", invoiceController.createInvoice);
router.post('/:id/pay', invoiceController.payInvoice);
router.put("/:id", invoiceController.updateOrder);
router.delete("/:id", invoiceController.deleteInvoice);

module.exports = router;
