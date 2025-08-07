const mongoose = require('mongoose');
const { lootItemSchema } = require('./Character');

const questSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Completed'],
    default: 'Pending',
  },
  xpReward: {
    type: Number,
    default: 20,
  },
  generatedLoot: lootItemSchema,
});

module.exports = mongoose.model('Quest', questSchema);
