const User = require('../models/User');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get pending (unapproved) users
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: false })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve user — admin activates login access
const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, isActive: true },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `${user.name} approved successfully`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject/deactivate user
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false, isApproved: false },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `${user.name} deactivated`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update scorecard
const updateScorecard = async (req, res) => {
  try {
    const { points, type } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.scorecard.totalPoints += points || 0;
    if (type === 'lab') user.scorecard.labsCompleted += 1;
    if (type === 'exam') user.scorecard.examsCompleted += 1;
    if (type === 'project') user.scorecard.projectsCompleted += 1;

    const p = user.scorecard.totalPoints;
    user.scorecard.rank =
      p >= 1000 ? 'Expert' :
      p >= 500 ? 'Advanced' :
      p >= 200 ? 'Intermediate' :
      p >= 50 ? 'Beginner' : 'Newcomer';

    await user.save();
    res.json(user.scorecard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllUsers,
  getPendingUsers,
  approveUser,
  deactivateUser,
  deleteUser,
  updateUserRole,
  updateScorecard
};