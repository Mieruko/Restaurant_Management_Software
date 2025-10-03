const express = require("express");
const { getRevenue, getTopFoods } = require("../controllers/reportController");
const router = express.Router();

router.get("/revenue", getRevenue);
router.get("/top-foods", getTopFoods);

module.exports = router;