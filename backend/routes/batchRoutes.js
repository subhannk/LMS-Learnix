const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET all batches for instructor
router.get('/instructor', protect, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const batches = await Batch.find({ instructor: req.user._id })
      .populate('course', 'title thumbnail')
      .populate('students', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single batch
router.get('/:id', protect, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('course', 'title thumbnail')
      .populate('students', 'name email avatar')
      .populate('instructor', 'name email');
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET batches for a student
router.get('/student/my', protect, async (req, res) => {
  try {
    const batches = await Batch.find({ students: req.user._id })
      .populate('course', 'title thumbnail')
      .populate('instructor', 'name email')
      .sort({ startDate: 1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create batch
router.post('/', protect, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const {
      name, description, courseId, schedule,
      startDate, endDate, maxStudents,
      status, mode, meetingLink, location, color
    } = req.body;

    if (!name || !courseId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Name, course, start date and end date are required' });
    }

    const batch = new Batch({
      name,
      description,
      course: courseId,
      instructor: req.user._id,
      schedule: schedule || [],
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxStudents: maxStudents || 30,
      status: status || 'upcoming',
      mode: mode || 'online',
      meetingLink: meetingLink || '',
      location: location || '',
      color: color || '#6c47ff'
    });

    await batch.save();
    await batch.populate('course', 'title thumbnail');
    res.status(201).json(batch);
  } catch (err) {
    console.error('Create batch error:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT update batch
router.put('/:id', protect, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    if (batch.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updated = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('course', 'title thumbnail')
      .populate('students', 'name email');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add student to batch
router.post('/:id/enroll', protect, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const { studentId } = req.body;
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    if (batch.students.length >= batch.maxStudents) {
      return res.status(400).json({ message: 'Batch is full' });
    }
    if (batch.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already in batch' });
    }
    batch.students.push(studentId);
    await batch.save();
    await batch.populate('students', 'name email');
    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE remove student from batch
router.delete('/:id/students/:studentId', protect, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    batch.students = batch.students.filter(s => s.toString() !== req.params.studentId);
    await batch.save();
    res.json({ message: 'Student removed from batch' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE batch
router.delete('/:id', protect, authorizeRoles('instructor', 'admin'), async (req, res) => {
  try {
    await Batch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Batch deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;