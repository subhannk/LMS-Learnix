const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/users',       require('./routes/userRoutes'));
app.use('/api/courses',     require('./routes/courseRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/reviews',     require('./routes/reviewRoutes'));
app.use('/api/labs',        require('./routes/labRoutes'));
app.use('/api/exams',       require('./routes/examRoutes'));
app.use('/api/attendance',  require('./routes/attendanceRoutes'));
app.use('/api/batches',     require('./routes/batchRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'CyberSquare LMS API Running', status: 'OK' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route ' + req.originalUrl + ' not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('CyberSquare Server running on port ' + PORT);
});