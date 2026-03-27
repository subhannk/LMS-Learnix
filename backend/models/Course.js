const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'text', 'pdf'], default: 'video' },
  videoUrl: { type: String, default: '' },
  duration: { type: String, default: '0 min' },
  isPreview: { type: Boolean, default: false }
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  price: { type: Number, default: 0 },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  sections: [sectionSchema],
  averageRating: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);