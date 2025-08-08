// --- ADDED FOR DEBUGGING ---
console.log("--- userController.js file has been loaded by the server ---");

const User = require('../models/User');
const { Character } = require('../models/Character');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- ADDED FOR DEBUGGING ---
console.log("--- All dependencies for userController.js loaded successfully ---");


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
    await newUser.save();
    
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    // --- ADDED FOR DEBUGGING ---
    console.log("--- REGISTER function successful ---");
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      token,
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // --- ADDED FOR DEBUGGING ---
    console.log("--- LOGIN function successful ---");
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    // --- ADDED FOR DEBUGGING ---
    console.error("---!!! ERROR IN LOGIN FUNCTION !!!---");
    console.error(error);
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


module.exports = { registerUser, loginUser, getCharacterForUser };
