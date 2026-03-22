const Task = require('../models/Task');
const { parseVoiceText } = require('../services/openaiService');
const { refreshUserAnalytics } = require('../services/analyticsService');

// @desc    Get all tasks for logged-in user
// @route   GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const { status, sort } = req.query;
    const query = { user: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const sortOption = sort || '-createdAt';
    const tasks = await Task.find(query).sort(sortOption);

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, dueTime, priority, voiceInput } = req.body;

    const task = await Task.create({
      user: req.user._id,
      title,
      description: description || '',
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      priority: priority || 'medium',
      voiceInput: voiceInput || null,
    });

    const analytics = await refreshUserAnalytics(req.user._id);

    res.status(201).json({ task, analytics });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PATCH /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const allowedUpdates = ['title', 'description', 'dueDate', 'dueTime', 'priority', 'status'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();
    const analytics = await refreshUserAnalytics(req.user._id);
    res.json({ task, analytics });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const analytics = await refreshUserAnalytics(req.user._id);
    res.json({ message: 'Task deleted', analytics });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark task as completed
// @route   PATCH /api/tasks/:id/complete
const completeTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    const analytics = await refreshUserAnalytics(req.user._id);
    res.json({ task, analytics });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a task
// @route   PATCH /api/tasks/:id/cancel
const cancelTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = 'cancelled';
    await task.save();

    const analytics = await refreshUserAnalytics(req.user._id);
    res.json({ task, analytics });
  } catch (error) {
    next(error);
  }
};

// @desc    Delay a task with new due date
// @route   PATCH /api/tasks/:id/delay
const delayTask = async (req, res, next) => {
  try {
    const { newDueDate } = req.body;

    if (!newDueDate) {
      return res.status(400).json({ message: 'newDueDate is required' });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Save original due date before first delay
    if (!task.originalDueDate && task.dueDate) {
      task.originalDueDate = task.dueDate;
    }

    task.dueDate = new Date(newDueDate);
    task.delayedTo = new Date(newDueDate);
    task.status = 'delayed';
    await task.save();

    const analytics = await refreshUserAnalytics(req.user._id);
    res.json({ task, analytics });
  } catch (error) {
    next(error);
  }
};

// @desc    Parse voice transcript into structured task data (does NOT create task)
//          Supports multi-turn clarification via conversationHistory
// @route   POST /api/tasks/parse-voice
const parseVoice = async (req, res, next) => {
  try {
    const { transcript, conversationHistory } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ message: 'transcript is required' });
    }

    const parsed = await parseVoiceText(transcript, conversationHistory || []);
    res.json(parsed);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  cancelTask,
  delayTask,
  parseVoice,
};
