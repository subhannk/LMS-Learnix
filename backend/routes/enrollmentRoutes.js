const express = require('express');
const router = express.Router();
const { enrollCourse, getMyEnrollments, updateProgress } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:courseId', protect, enrollCourse);
router.get('/my', protect, getMyEnrollments);
router.put('/:courseId/progress', protect, updateProgress);

module.exports = router;