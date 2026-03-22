const Task = require('../models/Task');
const User = require('../models/User');

function getTaskDeadline(task) {
  if (!task.dueDate) {
    return null;
  }

  const dueDate = new Date(task.dueDate);
  const year = dueDate.getUTCFullYear();
  const month = dueDate.getUTCMonth();
  const day = dueDate.getUTCDate();

  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(':').map(Number);
    return new Date(year, month, day, hours || 0, minutes || 0, 0, 0);
  }

  return new Date(year, month, day, 23, 59, 59, 999);
}

function isTaskOverdue(task, now = new Date()) {
  const deadline = getTaskDeadline(task);

  if (!deadline) {
    return false;
  }

  return deadline.getTime() < now.getTime();
}

async function getOverdueTasksForUser(userId) {
  const candidateTasks = await Task.find({
    user: userId,
    status: { $in: ['pending', 'delayed'] },
    dueDate: { $ne: null },
  }).sort({ dueDate: 1 });

  const now = new Date();
  return candidateTasks.filter((task) => isTaskOverdue(task, now));
}

async function computeAnalyticsSummary(userId) {
  const [total, completed, pending, cancelled, delayed, completedTasksWithDeadline, overdueTasks] =
    await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, status: 'completed' }),
      Task.countDocuments({ user: userId, status: 'pending' }),
      Task.countDocuments({ user: userId, status: 'cancelled' }),
      Task.countDocuments({ user: userId, status: 'delayed' }),
      Task.find({
        user: userId,
        status: 'completed',
        dueDate: { $ne: null },
        completedAt: { $ne: null },
      }).select('dueDate dueTime completedAt'),
      getOverdueTasksForUser(userId),
    ]);

  let completedOnTime = 0;
  let completedLate = 0;

  completedTasksWithDeadline.forEach((task) => {
    const deadline = getTaskDeadline(task);

    if (!deadline || !task.completedAt) {
      return;
    }

    if (new Date(task.completedAt).getTime() <= deadline.getTime()) {
      completedOnTime += 1;
    } else {
      completedLate += 1;
    }
  });

  return {
    total,
    completed,
    pending,
    cancelled,
    delayed,
    completedOnTime,
    completedLate,
    overdue: overdueTasks.length,
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
  getOverdueTasksForUser,
  getTaskDeadline,
  isTaskOverdue,
  refreshUserAnalytics,
};
