const express = require("express");
const router = express.Router();
const menuController = require('../controllers/menuController');

// GET all
router.get('/', menuController.getMenu);

// POST new
router.post('/', menuController.createMenu);

// PUT update
router.put('/:id', menuController.updateMenu);

// DELETE
router.delete('/:id', menuController.deleteMenu);

module.exports = router;
