const express = require('express');
const router = express.Router();
const Lab = require('../models/Lab');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// GET all labs
router.get('/', protect, async (req, res) => {
  try {
    const labs = await Lab.find({ isActive: true });
    res.json(labs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create lab (admin/instructor)
router.post('/', protect, authorizeRoles('admin', 'instructor'), async (req, res) => {
  try {
    const lab = new Lab(req.body);
    await lab.save();
    res.status(201).json(lab);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT complete a lab
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) return res.status(404).json({ message: 'Lab not found' });
    if (!lab.completedBy.includes(req.user._id)) {
      lab.completedBy.push(req.user._id);
      await lab.save();
    }
    res.json({ message: 'Lab completed!', points: lab.points });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;