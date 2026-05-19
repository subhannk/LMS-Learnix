const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ══════════════════════════════════
// REGISTER USER
// ══════════════════════════════════
const registerUser = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    console.log("📥 Incoming data:", { name, email, role });

    // ✅ Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Clean inputs
    name = name.trim();
    email = email.trim().toLowerCase();

    // 🔥 Fix role issue (ENUM SAFE)
    const validRoles = [
      "admin",
      "instructor",
      "student",
      "content_manager",
      "moderator",
      "guest"
    ];

    const cleanRole = role ? role.trim().toLowerCase() : "student";

    const finalRole = validRoles.includes(cleanRole)
      ? cleanRole
      : "student";

    console.log("✅ Final role used:", finalRole);

    // ✅ Check existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ✅ Create user (password will be hashed by schema)
    const user = new User({
      name,
      email,
      password,
      role: finalRole,
      isActive: true,
      isApproved: true
    });

    await user.save();

    // ✅ Response with token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      scorecard: user.scorecard,
      token: generateToken(user._id, user.role)
    });

  } catch (err) {
    console.error("❌ REGISTER ERROR:", err);

    // ✅ Handle duplicate email error (MongoDB)
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: err.message });
  }
};

// ══════════════════════════════════
// LOGIN USER
// ══════════════════════════════════
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ══════════════════════════════════════════════════════
    // ADMIN APPROVAL CHECK — COMMENTED OUT
    // Uncomment this block if you want admin approval back:
    //
    // if (!user.isApproved) {
    //   return res.status(403).json({
    //     message: 'Your account is pending admin approval. Please wait.',
    //     pending: true
    //   });
    // }
    //
    // ══════════════════════════════════════════════════════

    // ══════════════════════════════════════════════════════
    // ACTIVE CHECK — COMMENTED OUT
    // Uncomment this if you want to block deactivated users:
    //
    // if (!user.isActive) {
    //   return res.status(403).json({
    //     message: 'Your account has been deactivated. Contact admin.',
    //     deactivated: true
    //   });
    // }
    //
    // ══════════════════════════════════════════════════════

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      scorecard: user.scorecard,
      token: generateToken(user._id, user.role)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ══════════════════════════════════
// GET CURRENT USER
// ══════════════════════════════════
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { registerUser, loginUser, getMe };