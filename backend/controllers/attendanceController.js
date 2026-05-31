const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { sendAbsenceEmail, sendLateEmail } = require('../utils/emailService');

// 1. GET enrolled students for a course
// GET /api/attendance/students/:courseId
const getStudentsByCourse = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate('user', 'name email');
    
    const students = enrollments.map(e => e.user).filter(Boolean);
    res.json(students);
  } catch (error) {
    console.error('getStudentsByCourse error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 2. Register & enroll a student on the fly (Quick Enroll)
// POST /api/attendance/students/:courseId/enroll
const quickEnrollStudent = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    let studentUser = await User.findOne({ email: cleanEmail });
    
    if (!studentUser) {
      // Create user with default student settings
      studentUser = new User({
        name: name.trim(),
        email: cleanEmail,
        password: 'student123', // Will be hashed automatically by pre-save hook
        role: 'student',
        isActive: true,
        isApproved: true
      });
      await studentUser.save();
    } else {
      // If user exists, verify they have a student role
      if (studentUser.role !== 'student') {
        return res.status(400).json({ message: `User exists but has '${studentUser.role}' role instead of 'student'` });
      }
    }

    // Check if already enrolled in this course
    const existingEnrollment = await Enrollment.findOne({
      user: studentUser._id,
      course: course._id
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Student is already enrolled in this course' });
    }

    // Create the enrollment
    const enrollment = new Enrollment({
      user: studentUser._id,
      course: course._id
    });
    await enrollment.save();

    // Increment course student count
    await Course.findByIdAndUpdate(course._id, { $inc: { totalStudents: 1 } });

    // Log the enrollment activity
    await Activity.create({
      user: studentUser._id,
      action: 'ENROLLED',
      course: course._id,
      details: `Enrolled in ${course.title} (Quick Enroll by Instructor)`
    });

    res.status(201).json(studentUser);
  } catch (error) {
    console.error('quickEnrollStudent error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 3. Save or update attendance records (supports upsert by course, date, and session)
// POST /api/attendance
const saveAttendance = async (req, res) => {
  try {
    const { courseId, date, session, records } = req.body;

    if (!courseId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'CourseId, date, and records are required' });
    }

    // Parse the date to set to the start of the day in UTC for consistent day matching
    const parsedDate = new Date(date);
    const startOfDay = new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate()));

    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const lateCount = records.filter(r => r.status === 'late').length;

    // Check if attendance already exists for this course, date, and session
    let attendance = await Attendance.findOne({
      course: courseId,
      date: startOfDay,
      session: session || 'Regular Class'
    });

    if (attendance) {
      // Update existing records, keeping notified states if status hasn't changed
      const updatedRecords = records.map(newRec => {
        const oldRec = attendance.records.find(r => r.student.toString() === newRec.student.toString());
        return {
          student: newRec.student,
          status: newRec.status,
          // Retain notification status if the attendance status hasn't changed
          notified: (oldRec && oldRec.status === newRec.status) ? oldRec.notified : false,
          notifiedAt: (oldRec && oldRec.status === newRec.status) ? oldRec.notifiedAt : undefined
        };
      });

      attendance.records = updatedRecords;
      attendance.totalPresent = presentCount;
      attendance.totalAbsent = absentCount;
      attendance.totalLate = lateCount;
      attendance.instructor = req.user._id;

      await attendance.save();
    } else {
      // Create new attendance
      attendance = new Attendance({
        course: courseId,
        instructor: req.user._id,
        date: startOfDay,
        session: session || 'Regular Class',
        records: records.map(r => ({
          student: r.student,
          status: r.status,
          notified: false
        })),
        totalPresent: presentCount,
        totalAbsent: absentCount,
        totalLate: lateCount
      });
      await attendance.save();
    }

    // Populate course details before sending the response
    const populated = await Attendance.findById(attendance._id)
      .populate('course', 'title')
      .populate('records.student', 'name email');

    res.status(200).json(populated);
  } catch (error) {
    console.error('saveAttendance error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 4. GET attendance taking history for an instructor
// GET /api/attendance/instructor
const getInstructorHistory = async (req, res) => {
  try {
    const history = await Attendance.find({ instructor: req.user._id })
      .populate('course', 'title')
      .populate('records.student', 'name email')
      .sort({ date: -1, createdAt: -1 });

    res.json(history);
  } catch (error) {
    console.error('getInstructorHistory error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 5. Send notifications via email
// POST /api/attendance/:attendanceId/notify
const sendNotificationEmails = async (req, res) => {
  try {
    const { notifyType } = req.body; // 'absent', 'late', or 'all'
    const attendanceId = req.params.attendanceId;

    const attendance = await Attendance.findById(attendanceId)
      .populate('course', 'title')
      .populate('instructor', 'name')
      .populate('records.student', 'name email');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    let emailsSent = 0;
    const errors = [];

    // Filter which records to process
    const recordsToNotify = attendance.records.filter(r => {
      // Skip if already notified
      if (r.notified) return false;

      // Match type
      if (notifyType === 'absent') return r.status === 'absent';
      if (notifyType === 'late') return r.status === 'late';
      if (notifyType === 'all') return r.status === 'absent' || r.status === 'late';
      
      return false;
    });

    for (const record of recordsToNotify) {
      try {
        const student = record.student;
        if (!student || !student.email) continue;

        const emailOptions = {
          studentName: student.name,
          courseName: attendance.course.title,
          date: attendance.date,
          instructorName: attendance.instructor.name,
          to: student.email
        };

        if (record.status === 'absent') {
          await sendAbsenceEmail(emailOptions);
        } else if (record.status === 'late') {
          await sendLateEmail(emailOptions);
        }

        // Mark as notified in DB
        record.notified = true;
        record.notifiedAt = new Date();
        emailsSent++;
      } catch (emailErr) {
        console.error(`Email send failed for student ${record.student?.email}:`, emailErr.message);
        errors.push(`${record.student?.name || 'Student'}: ${emailErr.message}`);
      }
    }

    if (emailsSent > 0) {
      await attendance.save();
    }

    if (errors.length > 0 && emailsSent === 0) {
      return res.status(500).json({ 
        message: 'Failed to send notifications.',
        errors 
      });
    }

    res.json({ 
      message: `Emails dispatched successfully to ${emailsSent} student(s).`,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('sendNotificationEmails error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentsByCourse,
  quickEnrollStudent,
  saveAttendance,
  getInstructorHistory,
  sendNotificationEmails
};
