const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  cancelTask,
  delayTask,
  parseVoice,
} = require('../controllers/taskController');

const router = express.Router();

// All routes below require authentication
router.use(protect);

// GET /api/tasks
router.get('/', getTasks);

// POST /api/tasks
router.post(
  '/',
  [body('title').trim().notEmpty().withMessage('Title is required')],
  validate,
  createTask
);

// POST /api/tasks/parse-voice
router.post(
  '/parse-voice',
  [body('transcript').trim().notEmpty().withMessage('Transcript is required')],
  validate,
  parseVoice
);

// PATCH /api/tasks/:id
router.patch('/:id', updateTask);

// DELETE /api/tasks/:id
router.delete('/:id', deleteTask);

// PATCH /api/tasks/:id/complete
router.patch('/:id/complete', completeTask);

// PATCH /api/tasks/:id/cancel
router.patch('/:id/cancel', cancelTask);

// PATCH /api/tasks/:id/delay
router.patch(
  '/:id/delay',
  [body('newDueDate').notEmpty().withMessage('newDueDate is required')],
  validate,
  delayTask
);

module.exports = router;
