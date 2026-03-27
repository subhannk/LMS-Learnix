const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Activity = require('../models/Activity');

const enrollCourse = async (req, res) => {
  try {
    const already = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    if (already) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const enrollment = new Enrollment({
      user: req.user._id,
      course: req.params.courseId
    });

    await enrollment.save();
    await Course.findByIdAndUpdate(
      req.params.courseId,
      { $inc: { totalStudents: 1 } }
    );

    // Log the activity
    await Activity.create({
      user: req.user._id,
      action: 'ENROLLED',
      course: course._id,
      details: `Enrolled in ${course.title}`
    });

    res.status(201).json(enrollment);
  } catch (error) {
    console.error('enrollCourse error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate('course');
    res.json(enrollments);
  } catch (error) {
    console.error('getMyEnrollments error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { lessonId } = req.body;

    if (!lessonId) {
      return res.status(400).json({ message: 'lessonId is required' });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    const course = await Course.findById(req.params.courseId);
    const totalLessons = course.sections.reduce(
      (acc, s) => acc + s.lessons.length, 0
    );

    enrollment.progress = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;

    const oldStatus = enrollment.isCompleted;
    enrollment.isCompleted = enrollment.progress === 100;

    await enrollment.save();

    // Log lesson completion activity
    await Activity.create({
      user: req.user._id,
      action: 'COMPLETED_LESSON',
      course: course._id,
      details: `Completed a lesson in ${course.title}`
    });

    // Log course completion activity if status changed
    if (!oldStatus && enrollment.isCompleted) {
      await Activity.create({
        user: req.user._id,
        action: 'EARNED_CERTIFICATE',
        course: course._id,
        details: `Completed ${course.title} and earned a certificate!`
      });
    }

    res.json(enrollment);
  } catch (error) {
    console.error('updateProgress error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { enrollCourse, getMyEnrollments, updateProgress };