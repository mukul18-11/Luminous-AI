const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    dueTime: {
      type: String,
      default: null,
      // Stored as "HH:MM" 24-hour format, e.g. "17:00"
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'delayed'],
      default: 'pending',
    },
    completedAt: {
      type: Date,
      default: null,
    },
    delayedTo: {
      type: Date,
      default: null,
    },
    originalDueDate: {
      type: Date,
      default: null,
    },
    voiceInput: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
