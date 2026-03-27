const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getPendingUsers,
  approveUser,
  deactivateUser,
  deleteUser,
  updateUserRole,
  updateScorecard
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', protect, authorizeRoles('admin'), getAllUsers);
router.get('/pending', protect, authorizeRoles('admin'), getPendingUsers);
router.put('/:id/approve', protect, authorizeRoles('admin'), approveUser);
router.put('/:id/deactivate', protect, authorizeRoles('admin'), deactivateUser);
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);
router.put('/:id/role', protect, authorizeRoles('admin'), updateUserRole);
router.put('/:id/scorecard', protect, authorizeRoles('admin', 'instructor'), updateScorecard);

module.exports = router;