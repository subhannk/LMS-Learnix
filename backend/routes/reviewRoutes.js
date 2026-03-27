const express = require('express');
const router = express.Router();
const { addReview, getCourseReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:courseId', protect, addReview);
router.get('/:courseId', getCourseReviews);

module.exports = router;