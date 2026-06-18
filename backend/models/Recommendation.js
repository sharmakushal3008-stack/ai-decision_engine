const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  masterplanTimeline: { type: String, default: "" },
  goal: {
    description: String,
    expectedOutcomes: [String]
  },
  phases: [{
    name: String,
    duration: String,
    focusAreas: [String],
    skillsToLearn: [String],
    expectedOutput: String
  }],
  weeklyPlan: [{
    week: Number,
    focus: String,
    practiceTasks: [String],
    smallDeliverables: [String]
  }],
  dailyPlan: {
    learning: String,
    practice: String,
    revision: String
  },
  projects: [{
    title: String,
    techStack: [String],
    applicationDemonstration: String
  }],
  progressMetrics: {
    problemsToSolve: Number,
    projectsToComplete: Number,
    skillsToAchieve: Number
  },
  checkedTasks: { type: [String], default: [] },
  skillRoadmap: [{
    skill: { type: String, required: true },
    resources: [{ type: String }]
  }],
  chatHistory: [{
    sender: { type: String, enum: ['user', 'ai'] },
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  rating: { type: Number, min: 1, max: 5, default: null },
  historyNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Recommendation', recommendationSchema);
