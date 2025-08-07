const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Completed'],
    default: 'Active',
  },
  quests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest',
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);