const Profile = require('../models/Profile');

exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { targetRole, currentLevel, timeAvailableMonths, dailyStudyHours, currentSkills } = req.body;
    let profile = await Profile.findOne({ userId: req.user.id });

    if (profile) {
      profile.targetRole = targetRole || profile.targetRole;
      profile.currentLevel = currentLevel || profile.currentLevel;
      profile.timeAvailableMonths = timeAvailableMonths || profile.timeAvailableMonths;
      profile.dailyStudyHours = dailyStudyHours || profile.dailyStudyHours;
      profile.currentSkills = currentSkills || profile.currentSkills;
      await profile.save();
    } else {
      profile = await Profile.create({
        userId: req.user.id,
        targetRole,
        currentLevel,
        timeAvailableMonths,
        dailyStudyHours,
        currentSkills
      });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
