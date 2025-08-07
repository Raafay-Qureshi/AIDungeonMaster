const express = require('express');
const router = express.Router();
const { createProjectFromGoal, getAllUserProjects } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/projects/generate
router.post('/generate', protect, createProjectFromGoal);

// GET /api/projects/   <-- NEW ROUTE
router.get('/', protect, getAllUserProjects);

module.exports = router;
