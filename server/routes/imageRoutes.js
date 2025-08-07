const express = require('express');
const router = express.Router();
const { generateImageFromPrompt } = require('../controllers/imageController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/images/generate
// This route is protected to prevent unauthorized use of the image generation API.
router.post('/generate', protect, generateImageFromPrompt);

module.exports = router;
