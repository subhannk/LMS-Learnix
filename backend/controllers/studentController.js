const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Activity = require('../models/Activity');

// @desc    Get student dashboard data
// @route   GET /api/student/dashboard
// @access  Private/Student
const getStudentDashboard = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate('course', 'title thumbnail category sections')
      .sort('-updatedAt');

    const activities = await Activity.find({ user: req.user._id })
      .populate('course', 'title')
      .sort('-createdAt')
      .limit(10);

    const stats = {
      enrolledCourses: enrollments.length,
      completedCourses: enrollments.filter(e => e.isCompleted).length,
      overallProgress: enrollments.length > 0 
        ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
        : 0
    };

    res.json({
      enrollments,
      activities,
      stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student achievements (certificates)
// @route   GET /api/student/achievements
// @access  Private/Student
const getAchievements = async (req, res) => {
  try {
    const completed = await Enrollment.find({ 
      user: req.user._id, 
      isCompleted: true 
    }).populate('course', 'title thumbnail category updatedAt');

    res.json(completed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed activity feed
// @route   GET /api/student/activities
// @access  Private/Student
const getActivityFeed = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .populate('course', 'title thumbnail')
      .sort('-createdAt')
      .limit(50);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentDashboard,
  getAchievements,
  getActivityFeed
};
