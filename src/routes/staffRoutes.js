const express = require("express");
const staffController = require("../controllers/staffController");
const router = express.Router();

router.get("/", staffController.getStaff);
router.post("/", staffController.createStaff);
router.put("/:id", staffController.updateStaff);
router.delete("/:id", staffController.deleteStaff);

module.exports = router;
