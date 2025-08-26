const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const Project = require('../models/Project');
const Quest = require('../models/Quest');
const { Character } = require('../models/Character');

const resetCollections = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear all inventory items from characters
    const inventoryResult = await Character.updateMany(
      {}, // Update all characters
      { $set: { inventory: [] } } // Set inventory to empty array
    );
    console.log(`Cleared inventory from ${inventoryResult.modifiedCount} characters`);

    // Delete all quests
    const questResult = await Quest.deleteMany({});
    console.log(`Deleted ${questResult.deletedCount} quests`);

    // Delete all projects
    const projectResult = await Project.deleteMany({});
    console.log(`Deleted ${projectResult.deletedCount} projects`);

    console.log('Collections reset successfully!');
    console.log('User accounts and character data preserved.');
    console.log('All character inventories cleared.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting collections:', error);
    process.exit(1);
  }
};

resetCollections();