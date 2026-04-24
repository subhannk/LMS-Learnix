const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  topic: { type: String, default: '' }
});

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  schedule: [scheduleSchema],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  maxStudents: { type: Number, default: 30 },
  status: { type: String, enum: ['upcoming', 'active', 'completed', 'cancelled'], default: 'upcoming' },
  mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'online' },
  meetingLink: { type: String, default: '' },
  location: { type: String, default: '' },
  color: { type: String, default: '#6c47ff' }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);