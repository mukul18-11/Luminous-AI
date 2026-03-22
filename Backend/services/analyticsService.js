const Task = require('../models/Task');
const User = require('../models/User');

async function computeAnalyticsSummary(userId) {
  const now = new Date();

  const [total, completed, pending, cancelled, delayed, completedOnTime, completedLate, overdue] =
    await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, status: 'completed' }),
      Task.countDocuments({ user: userId, status: 'pending' }),
      Task.countDocuments({ user: userId, status: 'cancelled' }),
      Task.countDocuments({ user: userId, status: 'delayed' }),
      Task.countDocuments({
        user: userId,
        status: 'completed',
        dueDate: { $ne: null },
        $expr: { $lte: ['$completedAt', '$dueDate'] },
      }),
      Task.countDocuments({
        user: userId,
        status: 'completed',
        dueDate: { $ne: null },
        $expr: { $gt: ['$completedAt', '$dueDate'] },
      }),
      Task.countDocuments({
        user: userId,
        status: { $in: ['pending', 'delayed'] },
        dueDate: { $lt: now, $ne: null },
      }),
    ]);

  return {
    total,
    completed,
    pending,
    cancelled,
    delayed,
    completedOnTime,
    completedLate,
    overdue,
  };
}

async function refreshUserAnalytics(userId) {
  const summary = await computeAnalyticsSummary(userId);

  await User.findByIdAndUpdate(userId, {
    analytics: {
      ...summary,
      lastUpdatedAt: new Date(),
    },
  });

  return summary;
}

module.exports = {
  computeAnalyticsSummary,
  refreshUserAnalytics,
};
