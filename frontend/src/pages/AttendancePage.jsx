import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

const AttendancePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // ── Core States ──
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [sessionName, setSessionName] = useState('Regular Class')
  const [students, setStudents] = useState([])
  const [records, setRecords] = useState([])
  const [history, setHistory] = useState([])
  const [view, setView] = useState('take') // 'take' or 'history'
  const [expandedId, setExpandedId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // ── Loading & Modal States ──
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notifyingId, setNotifyingId] = useState(null)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)

  // ── Form States ──
  const [newStudent, setNewStudent] = useState({ name: '', email: '' })
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [enrollError, setEnrollError] = useState('')

  const [newCourse, setNewCourse] = useState({ title: '', description: '', category: '', price: 0, level: 'beginner' })
  const [courseLoading, setCourseLoading] = useState(false)
  const [courseError, setCourseError] = useState('')

  // ── Message States ──
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')

  // ── Responsive ──
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ── Load courses and history on mount ──
  const fetchInitialData = async () => {
    try {
      const coursesRes = await API.get('/courses/instructor/my-courses')
      setCourses(coursesRes.data)
    } catch {
      showMsg('Failed to load courses', 'error')
    }

    try {
      const historyRes = await API.get('/attendance/instructor')
      setHistory(historyRes.data)
    } catch {
      // History could be empty
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  const showMsg = (text, type = 'success') => {
    setMsg(text)
    setMsgType(type)
    setTimeout(() => setMsg(''), 4000)
  }

  // ── Load students when course is selected ──
  const loadStudents = async (courseId) => {
    if (!courseId) {
      setStudents([])
      setRecords([])
      return
    }
    setLoadingStudents(true)
    setStudents([])
    setRecords([])
    try {
      const { data } = await API.get(`/attendance/students/${courseId}`)
      setStudents(data)
      setRecords(data.map(s => ({
        student: s._id,
        status: 'present',
        name: s.name,
        email: s.email
      })))
    } catch {
      showMsg('Failed to load students. Enroll students to start tracking.', 'error')
    }
    setLoadingStudents(false)
  }

  // ── Create and Enroll Student on the fly ──
  const handleQuickEnroll = async (e) => {
    e.preventDefault()
    if (!newStudent.name || !newStudent.email) {
      setEnrollError('Name and email are required')
      return
    }
    setEnrollLoading(true)
    setEnrollError('')
    try {
      const { data } = await API.post(`/attendance/students/${selectedCourse}/enroll`, newStudent)
      
      // Update student list dynamically
      const updatedStudents = [...students, data]
      setStudents(updatedStudents)
      setRecords([...records, {
        student: data._id,
        status: 'present',
        name: data.name,
        email: data.email
      }])

      showMsg(`Successfully enrolled ${data.name}!`)
      setNewStudent({ name: '', email: '' })
      setShowEnrollModal(false)
    } catch (err) {
      setEnrollError(err.response?.data?.message || 'Failed to enroll student')
    }
    setEnrollLoading(false)
  }

  // ── Create Course on the fly ──
  const handleQuickCourse = async (e) => {
    e.preventDefault()
    if (!newCourse.title || !newCourse.description || !newCourse.category) {
      setCourseError('Title, description and category are required')
      return
    }
    setCourseLoading(true)
    setCourseError('')
    try {
      const { data } = await API.post('/courses', newCourse)
      setCourses([...courses, data])
      showMsg(`Course "${data.title}" created successfully!`)
      setSelectedCourse(data._id)
      loadStudents(data._id)
      setNewCourse({ title: '', description: '', category: '', price: 0, level: 'beginner' })
      setShowCourseModal(false)
    } catch (err) {
      setCourseError(err.response?.data?.message || 'Failed to create course')
    }
    setCourseLoading(false)
  }

  // ── Update single student status ──
  const updateStatus = (studentId, status) => {
    setRecords(prev => prev.map(r => r.student === studentId ? { ...r, status } : r))
  }

  // ── Mark all students with same status ──
  const markAll = (status) => {
    setRecords(prev => prev.map(r => ({ ...r, status })))
  }

  // ── Save/Update attendance ──
  const saveAttendance = async () => {
    if (!selectedCourse) return showMsg('Please select a course!', 'error')
    if (records.length === 0) return showMsg('No students found!', 'error')
    setSaving(true)
    try {
      const { data } = await API.post('/attendance', {
        courseId: selectedCourse,
        date: attendanceDate,
        session: sessionName,
        records: records.map(r => ({ student: r.student, status: r.status }))
      })
      
      // Update local history
      setHistory(prev => {
        const filtered = prev.filter(h => h._id !== data._id)
        return [data, ...filtered]
      })

      showMsg('Attendance saved successfully!')
      setView('history')
      setExpandedId(data._id)
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to save attendance', 'error')
    }
    setSaving(false)
  }

  // ── Send email notifications ──
  const sendNotifications = async (attendanceId, notifyType) => {
    setNotifyingId(attendanceId + notifyType)
    try {
      const { data } = await API.post(`/attendance/${attendanceId}/notify`, { notifyType })
      
      // Update local history
      setHistory(prev => prev.map(a => {
        if (a._id !== attendanceId) return a
        return {
          ...a,
          records: a.records.map(r => {
            if (notifyType === 'absent' && r.status === 'absent') return { ...r, notified: true }
            if (notifyType === 'late' && r.status === 'late') return { ...r, notified: true }
            if (notifyType === 'all' && (r.status === 'absent' || r.status === 'late')) return { ...r, notified: true }
            return r
          })
        }
      }))
      showMsg(data.message || 'Emails sent successfully!')
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to send emails', 'error')
    }
    setNotifyingId(null)
  }

  // ── Date shortcuts ──
  const setShortcutDate = (daysAgo) => {
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    setAttendanceDate(d.toISOString().split('T')[0])
  }

  // ── Export attendance list to CSV ──
  const exportToCSV = (sessionRecord = null) => {
    let rows = []
    let filename = 'attendance_report.csv'

    if (sessionRecord) {
      // Export single history session
      const courseTitle = sessionRecord.course?.title || 'Course'
      const formattedDate = new Date(sessionRecord.date).toLocaleDateString('en-IN')
      filename = `${courseTitle.replace(/\s+/g, '_')}_${formattedDate.replace(/\//g, '-')}_attendance.csv`
      
      rows.push(['Student Name', 'Email Address', 'Attendance Status', 'Notified via Email'])
      sessionRecord.records.forEach(r => {
        rows.push([
          r.student?.name || 'Unknown',
          r.student?.email || '—',
          r.status.toUpperCase(),
          r.notified ? 'YES' : 'NO'
        ])
      })
    } else {
      // Export current active session
      if (records.length === 0) return showMsg('No data to export!', 'error')
      const activeCourse = courses.find(c => c._id === selectedCourse)
      const courseTitle = activeCourse?.title || 'Course'
      filename = `${courseTitle.replace(/\s+/g, '_')}_current_attendance.csv`
      
      rows.push(['Student Name', 'Email Address', 'Attendance Status'])
      records.forEach(r => {
        rows.push([r.name, r.email, r.status.toUpperCase()])
      })
    }

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showMsg('Export completed!')
  }

  // ── Filtered students by search term ──
  const filteredRecords = records.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // ── Computed values ──
  const presentCount = records.filter(r => r.status === 'present').length
  const absentCount = records.filter(r => r.status === 'absent').length
  const lateCount = records.filter(r => r.status === 'late').length
  const totalCount = records.length

  const statusOptions = [
    { value: 'present', emoji: '✅', label: 'Present', color: '#00c851', bg: 'rgba(0,200,81,0.12)', border: 'rgba(0,200,81,0.35)' },
    { value: 'late', emoji: '🕐', label: 'Late', color: '#ff9500', bg: 'rgba(255,149,0,0.12)', border: 'rgba(255,149,0,0.35)' },
    { value: 'absent', emoji: '❌', label: 'Absent', color: '#ff6b6b', bg: 'rgba(255,107,107,0.12)', border: 'rgba(255,107,107,0.35)' },
  ]

  return (
    <div style={{ background: '#07070f', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans',sans-serif" }}>
      
      {/* Background Orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,71,255,0.08) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,200,81,0.06) 0%,transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: isMobile ? '16px 12px' : '28px 24px' }}>
        
        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate('/instructor')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
              ← Dashboard
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#6c47ff,#00c851)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📋</div>
              <div>
                <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: isMobile ? 20 : 26, margin: 0, letterSpacing: '-0.5px' }}>Attendance Studio</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: 12 }}>Manage cohorts · Export logs · Notify absences</p>
              </div>
            </div>
          </div>

          {/* User Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(108,71,255,0.12)', border: '1px solid rgba(108,71,255,0.25)', borderRadius: 10, padding: '8px 14px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#fff' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: 10, color: '#a78bff' }}>Instructor</p>
            </div>
          </div>
        </div>

        {/* Message Toast */}
        {msg && (
          <div style={{ background: msgType === 'error' ? 'rgba(255,107,107,0.12)' : 'rgba(0,200,81,0.12)', border: `1px solid ${msgType === 'error' ? 'rgba(255,107,107,0.4)' : 'rgba(0,200,81,0.4)'}`, borderRadius: 12, padding: '13px 18px', marginBottom: 20, fontSize: 14, color: msgType === 'error' ? '#ff6b6b' : '#00c851', display: 'flex', alignItems: 'center', gap: 8, animation: 'fadeUp 0.3s ease both', backdropFilter: 'blur(10px)' }}>
            <span style={{ fontSize: 18 }}>{msgType === 'error' ? '❌' : '✅'}</span>
            {msg}
          </div>
        )}

        {/* Top Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { icon: '📚', label: 'My Courses', value: courses.length, color: '#6c47ff' },
            { icon: '📋', label: 'Sessions Logged', value: history.length, color: '#00d2ff' },
            { icon: '✅', label: 'Average Attendance', value: history.length > 0 ? Math.round(history.reduce((a, h) => a + (h.totalPresent / (h.records?.length || 1)), 0) / history.length * 100) + '%' : '—', color: '#00c851' },
            { icon: '📧', label: 'Emails Sent', value: history.reduce((a, h) => a + (h.records?.filter(r => r.notified).length || 0), 0), color: '#ff9500' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#13131a', border: `1px solid ${s.color}20`, borderRadius: 14, padding: '14px 16px', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = s.color + '50'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = s.color + '20'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 22, color: '#fff' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 5, border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { id: 'take', icon: '✏️', label: 'Take Attendance' },
            { id: 'history', icon: '📜', label: `Session History (${history.length})` }
          ].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)} style={{ flex: 1, padding: '11px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 700, fontSize: isMobile ? 12 : 14, transition: 'all 0.25s', background: view === tab.id ? 'linear-gradient(135deg,#6c47ff,#9c47ff)' : 'transparent', color: view === tab.id ? '#fff' : 'rgba(255,255,255,0.45)', boxShadow: view === tab.id ? '0 0 24px rgba(108,71,255,0.45)' : 'none' }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════
            TAKE ATTENDANCE VIEW
        ════════════════════════════════════ */}
        {view === 'take' && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>
            
            {/* Session setup card */}
            <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: isMobile ? 16 : 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: 'rgba(108,71,255,0.2)', border: '1px solid rgba(108,71,255,0.3)', width: 34, height: 34, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚙️</span>
                  Session Configuration
                </h3>
                <button onClick={() => setShowCourseModal(true)} style={{ background: 'rgba(108,71,255,0.15)', border: '1px solid rgba(108,71,255,0.3)', color: '#a78bff', fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,71,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(108,71,255,0.15)'}>
                  + New Course
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 16 }}>
                {/* Select course */}
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 7, fontWeight: 600, letterSpacing: 0.5 }}>📚 SELECT COURSE</label>
                  <select value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); loadStudents(e.target.value) }}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 11, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: selectedCourse ? '#fff' : 'rgba(255,255,255,0.35)', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box', cursor: 'pointer' }}>
                    <option value="">-- Choose a Course --</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                {/* Date select with shortcuts */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 0.5 }}>📅 DATE</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" onClick={() => setShortcutDate(0)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 4, cursor: 'pointer' }}>Today</button>
                      <button type="button" onClick={() => setShortcutDate(1)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 4, cursor: 'pointer' }}>Yesterday</button>
                    </div>
                  </div>
                  <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 11, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }} />
                </div>

                {/* Session name */}
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 7, fontWeight: 600, letterSpacing: 0.5 }}>🏷️ SESSION NAME</label>
                  <input type="text" value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="e.g. Morning Session"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 11, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>

            {/* Empty state: No course selected */}
            {!selectedCourse && !loadingStudents && (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#13131a', border: '2px dashed rgba(108,71,255,0.15)', borderRadius: 20 }}>
                <div style={{ fontSize: 56, marginBottom: 14 }}>📋</div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, margin: '0 0 8px' }}>Select Course to Begin</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, maxWidth: 400, margin: '0 auto' }}>
                  Choose one of your assigned courses from the dropdown, or create a new course to manage attendance
                </p>
              </div>
            )}

            {/* Loading students spinner */}
            {loadingStudents && (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#13131a', borderRadius: 20 }}>
                <div style={{ fontSize: 42, marginBottom: 12, display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Loading students roster...</p>
              </div>
            )}

            {/* No students enrolled state */}
            {!loadingStudents && selectedCourse && students.length === 0 && (
              <div style={{ textAlign: 'center', padding: '50px 20px', background: '#13131a', border: '1px dashed rgba(255,107,107,0.3)', borderRadius: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>No Enrolled Students</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 18 }}>
                  There are no students enrolled in this course yet. Add your first student now.
                </p>
                <button onClick={() => setShowEnrollModal(true)} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                  + Enroll First Student
                </button>
              </div>
            )}

            {/* Active Student Attendance Taking Card */}
            {!loadingStudents && students.length > 0 && (
              <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
                
                {/* Table Header / Toolbar */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                    <div>
                      <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        Roster List
                        <span style={{ background: 'rgba(108,71,255,0.18)', color: '#a78bff', fontSize: 12, padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                          {students.length} students
                        </span>
                      </h3>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                        <span style={{ color: '#00c851', fontWeight: 600 }}>✅ {presentCount} Present</span>
                        <span style={{ color: '#ff9500', fontWeight: 600 }}>🕐 {lateCount} Late</span>
                        <span style={{ color: '#ff6b6b', fontWeight: 600 }}>❌ {absentCount} Absent</span>
                      </div>
                    </div>

                    {/* Toolbar buttons */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button onClick={() => setShowEnrollModal(true)} style={{ background: 'rgba(0,200,81,0.15)', border: '1px solid rgba(0,200,81,0.3)', color: '#00c851', padding: '7px 12px', borderRadius: 9, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                        + Add Student
                      </button>
                      <button onClick={() => exportToCSV()} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', padding: '7px 12px', borderRadius: 9, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                        📥 Export CSV
                      </button>
                    </div>
                  </div>

                  {/* Search and Bulk Actions row */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                    <input type="text" placeholder="Search student name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 10, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none' }} />
                    
                    <div style={{ display: 'flex', gap: 6 }}>
                      {statusOptions.map(s => (
                        <button key={s.value} onClick={() => markAll(s.value)} style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, padding: '6px 11px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                          {s.emoji} Mark All {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Student rows */}
                <div style={{ maxHeight: 450, overflowY: 'auto' }}>
                  {filteredRecords.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>
                      No matching students found
                    </div>
                  ) : (
                    filteredRecords.map((record, i) => {
                      const current = statusOptions.find(s => s.value === record.status)

                      return (
                        <div key={record.student} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: isMobile ? '12px 14px' : '14px 20px', borderBottom: i < filteredRecords.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.2s', flexWrap: isMobile ? 'wrap' : 'nowrap' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', width: 20, textAlign: 'right', flexShrink: 0, fontFamily: 'monospace' }}>{i + 1}</span>
                          
                          {/* Avatar */}
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: current.bg, border: `2px solid ${current.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0, color: current.color }}>
                            {record.name?.[0]?.toUpperCase() || '?'}
                          </div>

                          {/* Student Details */}
                          <div style={{ flex: 1, minWidth: isMobile ? '60%' : 0 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#fff' }}>{record.name}</p>
                            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{record.email}</p>
                          </div>

                          {/* Status buttons */}
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0, width: isMobile ? '100%' : 'auto', marginTop: isMobile ? 6 : 0 }}>
                            {statusOptions.map(s => (
                              <button key={s.value} onClick={() => updateStatus(record.student, s.value)} style={{
                                flex: isMobile ? 1 : 'none',
                                padding: isMobile ? '8px 5px' : '6px 14px',
                                borderRadius: 8,
                                border: `1.5px solid ${record.status === s.value ? 'transparent' : s.border}`,
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: 11,
                                transition: 'all 0.15s',
                                background: record.status === s.value ? s.color : s.bg,
                                color: record.status === s.value ? '#fff' : s.color,
                                boxShadow: record.status === s.value ? `0 4px 12px ${s.color}30` : 'none'
                              }}>
                                {s.emoji} {!isMobile && s.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Footer Save Summary */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 20, color: '#00c851' }}>{presentCount}</p>
                      <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Present</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 20, color: '#ff9500' }}>{lateCount}</p>
                      <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Late</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 20, color: '#ff6b6b' }}>{absentCount}</p>
                      <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Absent</p>
                    </div>
                  </div>

                  <button onClick={saveAttendance} disabled={saving} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '11px 32px', borderRadius: 12, cursor: saving ? 'wait' : 'pointer', fontWeight: 800, fontSize: 14, boxShadow: '0 0 24px rgba(108,71,255,0.4)', transition: 'all 0.2s' }}>
                    {saving ? '⏳ Saving...' : '💾 Save Attendance Session'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════
            ATTENDANCE HISTORY VIEW
        ════════════════════════════════════ */}
        {view === 'history' && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#13131a', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: 20 }}>
                <div style={{ fontSize: 56, marginBottom: 14 }}>📜</div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, margin: '0 0 8px' }}>No Attendance Logs</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 20 }}>Take attendance for a course to register session logs here.</p>
                <button onClick={() => setView('take')} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '11px 24px', borderRadius: 11, cursor: 'pointer', fontWeight: 700 }}>✏️ Take Attendance Now</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {history.map((record, i) => {
                  const isExpanded = expandedId === record._id
                  const total = record.records?.length || 1
                  const pct = Math.round((record.totalPresent / total) * 100)

                  return (
                    <div key={record._id} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden' }}>
                      
                      {/* History header bar (clickable) */}
                      <div onClick={() => setExpandedId(isExpanded ? null : record._id)} style={{ padding: '16px 20px', cursor: 'pointer', background: isExpanded ? 'rgba(108,71,255,0.04)' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${pct >= 75 ? '#00c851' : pct >= 50 ? '#ff9500' : '#ff6b6b'},#6c47ff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                            📋
                          </div>
                          <div>
                            <h4 style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 15, color: '#fff' }}>{record.course?.title || 'Course'}</h4>
                            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                              📅 {new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                              {record.session ? ` · ${record.session}` : ''}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                          {/* Attend percentage badge */}
                          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '5px 10px', borderRadius: 8 }}>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: pct >= 75 ? '#00c851' : pct >= 50 ? '#ff9500' : '#ff6b6b' }}>{pct}%</p>
                            <p style={{ margin: 0, fontSize: 8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Attend</p>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ background: 'rgba(0,200,81,0.12)', color: '#00c851', fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>Present: {record.totalPresent}</span>
                            <span style={{ background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>Absent: {record.totalAbsent}</span>
                          </div>

                          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                        </div>
                      </div>

                      {/* Expanded logs list */}
                      {isExpanded && (
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          
                          {/* Export single session button */}
                          <div style={{ padding: '8px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(255,255,255,0.01)' }}>
                            <button onClick={(e) => { e.stopPropagation(); exportToCSV(record) }} style={{ background: 'transparent', border: 'none', color: '#a78bff', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                              📥 Download CSV Report
                            </button>
                          </div>

                          {/* Records */}
                          <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                            {record.records?.map((r, ri) => (
                              <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: ri < record.records.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: r.status === 'present' ? 'rgba(0,200,81,0.15)' : r.status === 'late' ? 'rgba(255,149,0,0.15)' : 'rgba(255,107,107,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: r.status === 'present' ? '#00c851' : r.status === 'late' ? '#ff9500' : '#ff6b6b' }}>
                                  {r.student?.name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#fff' }}>{r.student?.name || 'Roster Student'}</p>
                                  <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{r.student?.email || '—'}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: r.status === 'present' ? 'rgba(0,200,81,0.1)' : r.status === 'late' ? 'rgba(255,149,0,0.1)' : 'rgba(255,107,107,0.1)', color: r.status === 'present' ? '#00c851' : r.status === 'late' ? '#ff9500' : '#ff6b6b', fontWeight: 700 }}>
                                    {r.status.toUpperCase()}
                                  </span>
                                  {r.notified && <span style={{ fontSize: 9, color: '#a78bff', background: 'rgba(108,71,255,0.12)', border: '1px solid rgba(108,71,255,0.25)', padding: '2px 6px', borderRadius: 100 }}>📧 Sent</span>}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Email notifications panel */}
                          {(record.totalAbsent > 0 || record.totalLate > 0) ? (
                            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(135deg,rgba(108,71,255,0.04),rgba(0,200,81,0.01))' }}>
                              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>📧</span> Disptach Attendance Alerts to Student Gmails
                              </p>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {record.totalAbsent > 0 && (
                                  <button onClick={() => sendNotifications(record._id, 'absent')} disabled={!!notifyingId}
                                    style={{ background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '8px 16px', borderRadius: 9, cursor: notifyingId ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700 }}>
                                    {notifyingId === record._id + 'absent' ? '⏳ Sending...' : `Email Absent (${record.totalAbsent})`}
                                  </button>
                                )}

                                {record.totalLate > 0 && (
                                  <button onClick={() => sendNotifications(record._id, 'late')} disabled={!!notifyingId}
                                    style={{ background: 'rgba(255,149,0,0.12)', border: '1px solid rgba(255,149,0,0.3)', color: '#ff9500', padding: '8px 16px', borderRadius: 9, cursor: notifyingId ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700 }}>
                                    {notifyingId === record._id + 'late' ? '⏳ Sending...' : `Email Late (${record.totalLate})`}
                                  </button>
                                )}

                                <button onClick={() => sendNotifications(record._id, 'all')} disabled={!!notifyingId}
                                  style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: 9, cursor: notifyingId ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700 }}>
                                  {notifyingId === record._id + 'all' ? '⏳ Disptaching...' : `Send All Alerts (${(record.totalAbsent || 0) + (record.totalLate || 0)})`}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,200,81,0.03)', fontSize: 12, color: '#00c851', fontWeight: 600 }}>
                              🎉 Perfect attendance. No alert dispatches required.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── MODAL: QUICK ENROLL STUDENT ── */}
      {showEnrollModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16, backdropFilter: 'blur(4px)', animation: 'fadeIn 0.25s' }}>
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, animation: 'fadeUp 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, margin: 0 }}>Enroll Student</h3>
              <button onClick={() => { setShowEnrollModal(false); setEnrollError('') }} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            {enrollError && (
              <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#ff6b6b', fontSize: 13 }}>
                {enrollError}
              </div>
            )}
            <form onSubmit={handleQuickEnroll} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Full Name</label>
                <input type="text" placeholder="e.g. Arjun M." value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} required
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Email Address</label>
                <input type="email" placeholder="student@example.com" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} required
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none' }} />
              </div>
              <button type="submit" disabled={enrollLoading} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '12px', borderRadius: 11, cursor: enrollLoading ? 'wait' : 'pointer', fontWeight: 700, marginTop: 4 }}>
                {enrollLoading ? '⏳ Enrolling...' : '🚀 Register & Enroll Student'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: QUICK CREATE COURSE ── */}
      {showCourseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16, backdropFilter: 'blur(4px)', animation: 'fadeIn 0.25s' }}>
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 440, animation: 'fadeUp 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, margin: 0 }}>Create Course</h3>
              <button onClick={() => { setShowCourseModal(false); setCourseError('') }} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            {courseError && (
              <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#ff6b6b', fontSize: 13 }}>
                {courseError}
              </div>
            )}
            <form onSubmit={handleQuickCourse} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Course Title</label>
                <input type="text" placeholder="e.g. Node.js Masterclass" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Category</label>
                <input type="text" placeholder="e.g. Backend Development" value={newCourse.category} onChange={e => setNewCourse({ ...newCourse, category: e.target.value })} required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Description</label>
                <textarea placeholder="e.g. Learn REST APIs, Express, and Database design..." value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} rows={3} required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Price (₹)</label>
                  <input type="number" placeholder="0" value={newCourse.price} onChange={e => setNewCourse({ ...newCourse, price: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Level</label>
                  <select value={newCourse.level} onChange={e => setNewCourse({ ...newCourse, level: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 9, background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none', cursor: 'pointer' }}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={courseLoading} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '12px', borderRadius: 10, cursor: courseLoading ? 'wait' : 'pointer', fontWeight: 700, marginTop: 4 }}>
                {courseLoading ? '⏳ Launching...' : '🚀 Launch Course'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS Style tag for transitions and animations */}
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #07070f; }
        ::-webkit-scrollbar-thumb { background: #6c47ff; border-radius: 8px; }
        select option { background: #13131a; color: #fff; }
      `}</style>
    </div>
  )
}

export default AttendancePage