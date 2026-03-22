const Task = require('../models/Task');
const { computeAnalyticsSummary, getOverdueTasksForUser } = require('../services/analyticsService');

// @desc    Get overall analytics summary
// @route   GET /api/analytics/summary
const getSummary = async (req, res, next) => {
  try {
    const summary = await computeAnalyticsSummary(req.user._id);
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily completion trend (last N days)
// @route   GET /api/analytics/completion-trend
const getCompletionTrend = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const trend = await Task.aggregate([
      {
        $match: {
          user: userId,
          status: 'completed',
          completedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
        },
      },
    ]);

    res.json({ data: trend });
  } catch (error) {
    next(error);
  }
};

// @desc    Get status breakdown for pie chart
// @route   GET /api/analytics/status-breakdown
const getStatusBreakdown = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const breakdown = await Task.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
    ]);

    res.json({ data: breakdown });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently overdue tasks
// @route   GET /api/analytics/overdue
const getOverdueTasks = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const tasks = await getOverdueTasksForUser(userId);

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getCompletionTrend, getStatusBreakdown, getOverdueTasks };
