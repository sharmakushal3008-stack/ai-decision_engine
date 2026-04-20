const Profile = require('../models/Profile');
const Recommendation = require('../models/Recommendation');
const User = require('../models/User');
const { evaluateRules } = require('../services/ruleEngine');
const { generateDecision } = require('../services/aiService');

exports.generateRecommendation = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found. Please complete your profile first.' });
    }

    // 1. Call AI Service directly with Profile
    const aiOutput = await generateDecision(profile);

    // 2. Save directly to execution schema
    const newRecommendation = await Recommendation.create({
      userId: req.user.id,
      masterplanTimeline: aiOutput.masterplanTimeline,
      goal: aiOutput.goal,
      phases: aiOutput.phases,
      weeklyPlan: aiOutput.weeklyPlan,
      dailyPlan: aiOutput.dailyPlan,
      projects: aiOutput.projects,
      progressMetrics: aiOutput.progressMetrics,
      checkedTasks: []
    });

    res.status(201).json({ success: true, data: newRecommendation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await Recommendation.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rateRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const recommendation = await Recommendation.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { rating },
      { new: true }
    );

    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { taskString } = req.body; 
    
    const recommendation = await Recommendation.findOne({ _id: id, userId: req.user.id });
    const user = await User.findById(req.user.id);

    if (!recommendation || !user) return res.status(404).json({ success: false, message: 'Not found' });

    let checkedTasks = recommendation.checkedTasks || [];
    let xpGain = 0;

    if (checkedTasks.includes(taskString)) {
      checkedTasks = checkedTasks.filter(t => t !== taskString);
      user.xp = Math.max(0, user.xp - 10);
    } else {
      checkedTasks.push(taskString);
      user.xp += 10;
      xpGain = 10;
    }

    // Rank Logic
    const oldLevel = user.level;
    if (user.xp >= 500) user.level = "Expert";
    else if (user.xp >= 250) user.level = "Adept";
    else if (user.xp >= 100) user.level = "Apprentice";
    else user.level = "Novice";

    const leveledUp = oldLevel !== user.level && xpGain > 0;

    recommendation.checkedTasks = checkedTasks;
    await recommendation.save();
    await user.save();

    res.status(200).json({ success: true, checkedTasks, xp: user.xp, level: user.level, leveledUp, xpGain });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const recommendation = await Recommendation.findOne({ _id: id, userId: req.user.id });
    if (!recommendation) return res.status(404).json({ success: false, message: 'Not found' });

    if (!recommendation.chatHistory) recommendation.chatHistory = [];

    // Format previous history for Gemini
    const chatContext = recommendation.chatHistory.map(ch => `${ch.sender.toUpperCase()}: ${ch.message}`).join('\n');
    
    recommendation.chatHistory.push({ sender: 'user', message, timestamp: new Date() });

    // Ping Gemini with context
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Pass roadmap data cleanly
    const roadmapContext = `User Roadmap Goal: ${recommendation.goal?.description || 'N/A'}\nPhases: ${recommendation.phases?.map(p => p.name).join(', ') || 'N/A'}\nProjects: ${recommendation.projects?.map(p => p.title).join(', ') || 'N/A'}`;

    const prompt = `You are an AI Career Mentor helping a user with their execution roadmap.
${roadmapContext}

Chat History:
${chatContext}
USER: ${message}

Provide a concise, helpful, and directly actionable response to the USER. Do not use Markdown formatting like **bold** excessively. Return plain text conversational response.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const aiResponseText = response.text || "I'm having trouble analyzing your roadmap right now.";

    recommendation.chatHistory.push({ sender: 'ai', message: aiResponseText, timestamp: new Date() });

    await recommendation.save();

    res.status(200).json({ success: true, chatHistory: recommendation.chatHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
