const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getSummary,
  getCompletionTrend,
  getStatusBreakdown,
  getOverdueTasks,
} = require('../controllers/analyticsController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/analytics/summary
router.get('/summary', getSummary);

// GET /api/analytics/completion-trend
router.get('/completion-trend', getCompletionTrend);

// GET /api/analytics/status-breakdown
router.get('/status-breakdown', getStatusBreakdown);

// GET /api/analytics/overdue
router.get('/overdue', getOverdueTasks);

module.exports = router;
