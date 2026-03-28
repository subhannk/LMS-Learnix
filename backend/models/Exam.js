const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [String],
  correctAnswer: { type: Number, required: true },
  points: { type: Number, default: 10 }
});

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  duration: { type: Number, default: 30 },
  totalMarks: { type: Number, default: 100 },
  passingMarks: { type: Number, default: 50 },
  questions: [questionSchema],
  isActive: { type: Boolean, default: true },
  submissions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number },
    passed: { type: Boolean },
    submittedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);