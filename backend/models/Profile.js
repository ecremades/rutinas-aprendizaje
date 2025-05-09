const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interests: [{
    name: String,
    hoursPerWeek: Number
  }],
  goals: [{
    description: String,
    targetHours: Number
  }],
  availability: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', ProfileSchema);