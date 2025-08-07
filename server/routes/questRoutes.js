const express = require('express');
const router = express.Router();
const { completeQuest, uncompleteQuest } = require('../controllers/questController');
const { protect } = require('../middleware/authMiddleware');

router.put('/:id/complete', protect, completeQuest);

router.put('/:id/uncomplete', protect, uncompleteQuest);

module.exports = router;
