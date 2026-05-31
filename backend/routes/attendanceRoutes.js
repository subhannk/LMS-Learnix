const express = require('express');
const router = express.Router();
const { 
  getStudentsByCourse,
  quickEnrollStudent,
  saveAttendance,
  getInstructorHistory,
  sendNotificationEmails
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorizeRoles('instructor', 'admin'));

router.get('/instructor', getInstructorHistory);
router.get('/students/:courseId', getStudentsByCourse);
router.post('/students/:courseId/enroll', quickEnrollStudent);
router.post('/', saveAttendance);
router.post('/:attendanceId/notify', sendNotificationEmails);

module.exports = router;