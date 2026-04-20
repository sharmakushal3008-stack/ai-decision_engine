const express = require('express');
const router = express.Router();
const { generateRecommendation, getHistory, rateRecommendation, toggleTask, sendChatMessage } = require('../controllers/decisionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateRecommendation);
router.get('/history', protect, getHistory);
router.post('/rate/:id', protect, rateRecommendation);
router.post('/task/:id', protect, toggleTask);
router.post('/chat/:id', protect, sendChatMessage);

module.exports = router;
