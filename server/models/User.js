const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  localUserId: {
    type: String,
    unique: true,
    sparse: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  characterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
  },
  refreshToken: {
    type: String,
  },
  refreshTokenExpiresAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);