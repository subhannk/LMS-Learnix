const Course = require('../models/Course');

// GET all approved public courses with filters
const getCourses = async (req, res) => {
  try {
    const { search, category, level, sort } = req.query;
    let query = { isApproved: true };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (level && level !== 'All') {
      query.level = level;
    }

    let sortOption = {};
    if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'price-low') sortOption = { price: 1 };
    else if (sort === 'price-high') sortOption = { price: -1 };
    else sortOption = { createdAt: -1 };

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort(sortOption);
      
    res.json(courses);
  } catch (error) {
    console.error('getCourses error:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET instructor's own courses only
const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('instructor', 'name email');
    res.json(courses);
  } catch (error) {
    console.error('getInstructorCourses error:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET single course by ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    console.error('getCourseById error:', error);
    res.status(500).json({ message: error.message });
  }
};

// POST create new course (instructor only)
const createCourse = async (req, res) => {
  try {
    const { title, description, category, price, level, tags } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description and category are required' });
    }

    const course = new Course({
      title,
      description,
      category,
      price: price || 0,
      level: level || 'beginner',
      tags: tags || [],
      instructor: req.user._id,
      isApproved: false,
      isPublished: false
    });

    await course.save();
    await course.populate('instructor', 'name email');

    res.status(201).json(course);
  } catch (error) {
    console.error('createCourse error:', error);
    res.status(500).json({ message: error.message });
  }
};

// PUT update course
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'content_manager'
    ) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('instructor', 'name email');

    res.json(updated);
  } catch (error) {
    console.error('updateCourse error:', error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE course (admin only)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('deleteCourse error:', error);
    res.status(500).json({ message: error.message });
  }
};

// PUT approve course (admin/moderator only)
const approveCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, isPublished: true },
      { new: true }
    ).populate('instructor', 'name email');

    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    console.error('approveCourse error:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET all pending courses (admin/moderator)
const getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isApproved: false })
      .populate('instructor', 'name email');
    res.json(courses);
  } catch (error) {
    console.error('getPendingCourses error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCourses,
  getInstructorCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  approveCourse,
  getPendingCourses
};