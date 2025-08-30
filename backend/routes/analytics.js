const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authenticateToken = require('../middleware/auth');

router.get('/summary', authenticateToken, analyticsController.getSummary);
router.get('/categories', authenticateToken, analyticsController.getCategories);
router.get('/trends', authenticateToken, analyticsController.getTrends);

module.exports = router;
