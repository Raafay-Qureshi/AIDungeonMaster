// --- ADDED FOR DEBUGGING ---
console.log("--- userController.js file has been loaded by the server ---");

const User = require('../models/User');
const { Character } = require('../models/Character');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// --- ADDED FOR DEBUGGING ---
console.log("--- All dependencies for userController.js loaded successfully ---");

// Helper function to generate tokens
const generateTokens = async (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  return { accessToken, refreshToken, refreshTokenExpiresAt };
};

const registerUser = async (req, res) => {
  // --- ADDED FOR DEBUGGING ---
  console.log("--- REGISTER function started ---");
  
  const { username, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = new User({ username, email, passwordHash });
    await newUser.save();
    const newCharacter = new Character({
      userId: newUser._id,
      name: newUser.username,
    });
    await newCharacter.save();
    
    newUser.characterId = newCharacter._id;
    
    // Generate tokens
    const { accessToken, refreshToken, refreshTokenExpiresAt } = await generateTokens(newUser._id);
    
    // Save refresh token to user
    newUser.refreshToken = refreshToken;
    newUser.refreshTokenExpiresAt = refreshTokenExpiresAt;
    await newUser.save();
    
    // --- ADDED FOR DEBUGGING ---
    console.log("--- REGISTER function successful ---");
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    // --- ADDED FOR DEBUGGING ---
    console.error("---!!! ERROR IN REGISTER FUNCTION !!!---");
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  // --- ADDED FOR DEBUGGING ---
  console.log("--- LOGIN function started ---");

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Generate tokens
    const { accessToken, refreshToken, refreshTokenExpiresAt } = await generateTokens(user._id);
    
    // Save refresh token to user
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = refreshTokenExpiresAt;
    await user.save();

    // --- ADDED FOR DEBUGGING ---
    console.log("--- LOGIN function successful ---");
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    // --- ADDED FOR DEBUGGING ---
    console.error("---!!! ERROR IN LOGIN FUNCTION !!!---");
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    // Find user with this refresh token
    const user = await User.findOne({
      refreshToken,
      refreshTokenExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken, refreshTokenExpiresAt } = await generateTokens(user._id);

    // Update user's refresh token
    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiresAt = refreshTokenExpiresAt;
    await user.save();

    res.status(200).json({
      token: accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getCharacterForUser = async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.user.id });
    if (!character) {
      return res.status(404).json({ message: 'Character not found.' });
    }
    res.status(200).json(character);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    // Clear the refresh token from the database
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = null;
      user.refreshTokenExpiresAt = null;
      await user.save();
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


module.exports = { registerUser, loginUser, refreshToken, getCharacterForUser, logoutUser };
