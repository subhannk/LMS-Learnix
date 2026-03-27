const express = require('express');
const router = express.Router();

const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ✅ NO middleware here
router.post('/register', registerUser);
router.post('/login', loginUser);

// ✅ ONLY HERE
router.get('/me', protect, getMe);

module.exports = router;