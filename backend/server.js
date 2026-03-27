const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load routes safely
const loadRoute = (path) => {
  try {
    const route = require(path);
    if (typeof route === 'function' || route.handle) return route;
    throw new Error(`Route ${path} did not export a valid router`);
  } catch (err) {
    console.error(`❌ Failed to load route: ${path}`, err.message);
    process.exit(1);
  }
};

app.use('/api/auth', loadRoute('./routes/authRoutes'));
app.use('/api/users', loadRoute('./routes/userRoutes'));
app.use('/api/courses', loadRoute('./routes/courseRoutes'));
app.use('/api/enrollments', loadRoute('./routes/enrollmentRoutes'));
app.use('/api/reviews', loadRoute('./routes/reviewRoutes'));
app.use('/api/labs', loadRoute('./routes/labRoutes'));
app.use('/api/exams', loadRoute('./routes/examRoutes'));

app.get('/', (req, res) => res.json({ message: '🚀 CyberSquare LMS API Running' }));

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));