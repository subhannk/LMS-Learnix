const express = require('express');
const router = express.Router();
const {
  getCourses,
  getInstructorCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  approveCourse,
  getPendingCourses
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Instructor only routes
router.get('/instructor/my-courses', protect, authorizeRoles('instructor'), getInstructorCourses);
router.post('/', protect, authorizeRoles('instructor', 'admin'), createCourse);
router.put('/:id', protect, authorizeRoles('instructor', 'admin', 'content_manager'), updateCourse);

// Admin/Moderator only routes
router.get('/admin/pending', protect, authorizeRoles('admin', 'moderator'), getPendingCourses);
router.put('/:id/approve', protect, authorizeRoles('admin', 'moderator'), approveCourse);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCourse);

module.exports = router;