const express = require('express');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const { getTasks, getTasksById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskChecklist, getDashboardData, getUserDashboardData } = require('../controllers/TaskController');

const router = express.Router();

// Task Management System
router.get('/dashboard-data', protect, getDashboardData);
router.get('/user-dashboard-data', protect, getUserDashboardData);
router.get('/',protect, getTasks);
router.get('/:id',protect, getTasksById);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);
router.put('/:id/status', protect, updateTaskStatus);
router.put('/:id/todo', protect, updateTaskChecklist);

module.exports = router;