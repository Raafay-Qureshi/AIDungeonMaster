const User = require('../models/User');
const { Character } = require('../models/Character');
const bcrypt = require('bcryptjs');

// Initialize or get user by local ID
const initUser = async (req, res) => {
  const { localUserId } = req.body;
  
  if (!localUserId) {
    return res.status(400).json({ message: 'Local user ID required' });
  }
  
  try {
    // Check if user already exists
    let user = await User.findOne({ localUserId });
    let character;
    
    if (!user) {
      // Create new user
      user = new User({
        localUserId,
        username: `Adventurer_${localUserId.split('_')[1]}`,
        email: `${localUserId}@local.app`,
        passwordHash: 'local_auth_not_required'
      });
      await user.save();
      
      // Create new character
      character = new Character({
        userId: user._id,
        name: user.username,
      });
      await character.save();
      
      user.characterId = character._id;
      await user.save();
    } else {
      // Get existing character
      character = await Character.findOne({ userId: user._id });
      if (!character) {
        // Create character if somehow missing
        character = new Character({
          userId: user._id,
          name: user.username,
        });
        await character.save();
        user.characterId = character._id;
        await user.save();
      }
    }
    
    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        localUserId: user.localUserId
      },
      character
    });
  } catch (error) {
    console.error('Init user error:', error);
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

const deleteInventoryItem = async (req, res) => {
  try {
    const { itemName } = req.params;
    const character = await Character.findOne({ userId: req.user.id });
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found.' });
    }
    
    // Find the item in inventory
    const itemIndex = character.inventory.findIndex(item => item.itemName === itemName);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in inventory.' });
    }
    
    // Remove the item from inventory
    character.inventory.splice(itemIndex, 1);
    await character.save();
    
    res.status(200).json({
      message: 'Item deleted successfully',
      character
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { initUser, getCharacterForUser, deleteInventoryItem };
