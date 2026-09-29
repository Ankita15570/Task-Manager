const express = require('express');
const { adminOnly, protect } = require('../middlewares/authMiddleware');
const { getUser, getUserById } = require('../controllers/UserController');

const router = express.Router();

// User Management Routes
router.get('/',protect, adminOnly,getUser);
router.get('/:id', protect, getUserById);

module.exports = router;