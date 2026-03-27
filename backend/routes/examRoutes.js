const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const exams = await Exam.find({ isActive: true }).select('-questions.correctAnswer');
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).select('-questions.correctAnswer');
    if (!exam) return res.status(404).json({ message: 'Not found' });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, authorizeRoles('admin', 'instructor'), async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body;
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Not found' });

    const already = exam.submissions.find(
      s => s.user.toString() === req.user._id.toString()
    );
    if (already) return res.status(400).json({ message: 'Already submitted' });

    let score = 0;
    exam.questions.forEach((q, i) => {
      if (Number(answers[i]) === q.correctAnswer) score += q.points;
    });

    const passed = score >= exam.passingMarks;
    exam.submissions.push({ user: req.user._id, score, passed });
    await exam.save();
    res.json({ score, passed, totalMarks: exam.totalMarks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;