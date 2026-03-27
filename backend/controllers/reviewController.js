const Review = require('../models/Review');
const Course = require('../models/Course');

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const existing = await Review.findOne({ user: req.user._id, course: req.params.courseId });
    if (existing) return res.status(400).json({ message: 'Review already submitted' });

    const review = await Review.create({ user: req.user._id, course: req.params.courseId, rating, comment });

    const reviews = await Review.find({ course: req.params.courseId });
    const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
    await Course.findByIdAndUpdate(req.params.courseId, { averageRating: avg.toFixed(1) });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCourseReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId }).populate('user', 'name avatar');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addReview, getCourseReviews };