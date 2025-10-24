const express = require('express');
const router = express.Router();
const { initUser, getCharacterForUser, deleteInventoryItem } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/init', initUser);

router.get('/me/character', protect, getCharacterForUser);

router.delete('/inventory/:itemName', protect, deleteInventoryItem);

module.exports = router;
