const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'ENROLLED', 'COMPLETED_LESSON', 'EARNED_CERTIFICATE'
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  details: { type: String }, // e.g., "Started React Basics", "Completed Lesson 1"
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
