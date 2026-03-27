const express = require('express');
const router = express.Router();
const { 
  getStudentDashboard, 
  getAchievements, 
  getActivityFeed 
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes are protected and for student only
router.use(protect);
router.use(authorize('student'));

router.get('/dashboard', getStudentDashboard);
router.get('/achievements', getAchievements);
router.get('/activities', getActivityFeed);

module.exports = router;
