const express = require('express');
const router = express.Router();
const { registerUser, loginUser, refreshToken, getCharacterForUser, logoutUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/refresh-token', refreshToken);

router.post('/logout', protect, logoutUser);

router.get('/me/character', protect, getCharacterForUser);


module.exports = router;
