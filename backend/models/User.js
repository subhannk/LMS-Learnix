const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'instructor', 'student', 'content_manager', 'moderator', 'guest'],
    default: 'student'
  },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [String],
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  scorecard: {
    totalPoints: { type: Number, default: 0 },
    labsCompleted: { type: Number, default: 0 },
    examsCompleted: { type: Number, default: 0 },
    projectsCompleted: { type: Number, default: 0 },
    rank: { type: String, default: 'Beginner' }
  }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);