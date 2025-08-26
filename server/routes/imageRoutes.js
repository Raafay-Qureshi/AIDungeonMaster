const express = require('express');
const router = express.Router();
const { generateImageFromPrompt, getImageByUrl } = require('../controllers/imageController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/images/generate
// This route is protected to prevent unauthorized use of the image generation API.
router.post('/generate', (req, res, next) => {
  console.log("=== IMAGE ROUTE HIT ===");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
}, protect, generateImageFromPrompt);

// GET /api/images/:filename - serve cached images (no auth required for serving images)
router.get('/:filename', getImageByUrl);

module.exports = router;
