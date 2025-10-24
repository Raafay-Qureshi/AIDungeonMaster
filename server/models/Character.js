const mongoose = require('mongoose');

// The lootItemSchema now includes a place to store the image prompt.
const lootItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String },
  type: { type: String },
  rarity: { type: String, enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'], default: 'Common' },
  imagePrompt: { type: String },
  imageUrl: { type: String }, // Store the generated image URL/path
  questName: { type: String }, // Store which quest this item came from
  projectName: { type: String }, // Store which project the quest belonged to
  completedAt: { type: Date, default: Date.now }, // When the item was obtained
}, { _id: false });

const characterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    default: 1,
  },
  xp: {
    type: Number,
    default: 0,
  },
  max_xp: {
    type: Number,
    default: 100,
  },
  health: {
    type: Number,
    default: 100,
  },
  max_health: {
    type: Number,
    default: 100,
  },
  inventory: [lootItemSchema],
});

const Character = mongoose.model('Character', characterSchema);

module.exports = { Character, lootItemSchema };
