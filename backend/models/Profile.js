const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  targetRole: { type: String, required: true },
  currentLevel: { type: String, required: true, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  timeAvailableMonths: { type: Number, required: true },
  dailyStudyHours: { type: Number, required: true },
  currentSkills: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
