import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

const tabs = ['Dashboard', 'Course Builder', 'Attendance', 'Q&A Inbox', 'Analytics', 'Earnings']

const StatCard = ({ icon, label, value, sub, color, delay = 0 }) => (
  <div style={{ background: '#13131a', border: `1px solid ${color}25`, borderRadius: 16, padding: '16px 18px', animation: `fadeUp 0.6s ease ${delay}s both`, transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color + '60'; e.currentTarget.style.transform = 'translateY(-3px)' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = color + '25'; e.currentTarget.style.transform = 'translateY(0)' }}
  >
    <div style={{ position: 'absolute', top: -15, right: -15, width: 60, height: 60, borderRadius: '50%', background: color + '15' }} />
    <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 24, color: '#fff', marginBottom: 3 }}>{value}</div>
    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{label}</div>
    {sub && <div style={{ color, fontSize: 11, fontWeight: 600, marginTop: 2 }}>{sub}</div>}
  </div>
)

const mockQA = [
  { id: 1, student: 'Arjun M.', course: 'React JS Full Course', question: 'How do I use useEffect with async functions?', time: '2h ago', answered: false },
  { id: 2, student: 'Priya N.', course: 'Node.js Masterclass', question: 'What is the difference between require and import?', time: '5h ago', answered: true },
  { id: 3, student: 'Rahul D.', course: 'React JS Full Course', question: 'Can you explain the Context API with a real example?', time: '1d ago', answered: false },
  { id: 4, student: 'Sneha K.', course: 'Node.js Masterclass', question: 'How do I handle file uploads with multer?', time: '2d ago', answered: true },
]

const mockEarnings = [
  { month: 'Oct', amount: 12400 },
  { month: 'Nov', amount: 18900 },
  { month: 'Dec', amount: 15200 },
  { month: 'Jan', amount: 22800 },
  { month: 'Feb', amount: 19500 },
  { month: 'Mar', amount: 28400 },
]

const InstructorPanel = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', description: '', category: '', price: 0, level: 'beginner' })
  const [message, setMessage] = useState('')
  const [answers, setAnswers] = useState({})
  const [attendanceCourses, setAttendanceCourses] = useState([])
const [selectedCourse, setSelectedCourse] = useState(null)
const [attendanceStudents, setAttendanceStudents] = useState([])
const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
const [sessionName, setSessionName] = useState('Regular Class')
const [attendanceRecords, setAttendanceRecords] = useState([])
const [attendanceHistory, setAttendanceHistory] = useState([])
const [attendanceMsg, setAttendanceMsg] = useState('')
const [attendanceMsgType, setAttendanceMsgType] = useState('success')
const [loadingStudents, setLoadingStudents] = useState(false)
const [savingAttendance, setSavingAttendance] = useState(false)
const [notifying, setNotifying] = useState(false)
const [attendanceView, setAttendanceView] = useState('take')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [tabMenuOpen, setTabMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const loadStudents = async (courseId) => {
    setLoadingStudents(true)
    setAttendanceStudents([])
    setAttendanceRecords([])
    try {
      const { data } = await API.get(`/attendance/students/${courseId}`)
      setAttendanceStudents(data)
      setAttendanceRecords(data.map(s => ({
        student: s._id,
        status: 'present',
        name: s.name,
        email: s.email
      })))
    } catch (err) {
      setAttendanceMsg('❌ Failed to load students')
      setAttendanceMsgType('error')
    }
    setLoadingStudents(false)
  }

  const updateStatus = (studentId, status) => {
    setAttendanceRecords(prev =>
      prev.map(r => r.student === studentId ? { ...r, status } : r)
    )
  }

  const markAll = (status) => {
    setAttendanceRecords(prev => prev.map(r => ({ ...r, status })))
  }

  const saveAttendance = async () => {
    if (!selectedCourse) return setAttendanceMsg('❌ Please select a course')
    if (attendanceRecords.length === 0) return setAttendanceMsg('❌ No students found')
    setSavingAttendance(true)
    try {
      const { data } = await API.post('/attendance', {
        courseId: selectedCourse,
        date: attendanceDate,
        session: sessionName,
        records: attendanceRecords.map(r => ({ student: r.student, status: r.status }))
      })
      setAttendanceHistory([data, ...attendanceHistory])
      setAttendanceMsg('✅ Attendance saved successfully!')
      setAttendanceMsgType('success')
      setAttendanceView('history')
    } catch (err) {
      setAttendanceMsg('❌ ' + (err.response?.data?.message || 'Failed to save'))
      setAttendanceMsgType('error')
    }
    setSavingAttendance(false)
    setTimeout(() => setAttendanceMsg(''), 4000)
  }

  const sendNotifications = async (attendanceId, notifyType) => {
    setNotifying(true)
    try {
      const { data } = await API.post(`/attendance/${attendanceId}/notify`, { notifyType })
      setAttendanceHistory(prev =>
        prev.map(a => a._id === attendanceId
          ? { ...a, notified: true }
          : a
        )
      )
      setAttendanceMsg(`✅ ${data.message}`)
      setAttendanceMsgType('success')
    } catch (err) {
      setAttendanceMsg('❌ Failed to send notifications')
      setAttendanceMsgType('error')
    }
    setNotifying(false)
    setTimeout(() => setAttendanceMsg(''), 5000)
  }

  if (user?.role !== 'instructor') return <Navigate to="/dashboard" replace />

  useEffect(() => {
    API.get('/courses/instructor/my-courses')
      .then(({ data }) => { setCourses(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

   API.get('/attendance/instructor')
      .then(({ data }) => setAttendanceHistory(data))
      .catch(() => {})

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const { data } = await API.post('/courses', form)
      setCourses([...courses, data])
      setMessage('✅ Course created! Awaiting admin approval.')
      setForm({ title: '', description: '', category: '', price: 0, level: 'beginner' })
      setTimeout(() => setMessage(''), 4000)
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed'))
    }
  }

  const totalStudents = courses.reduce((a, c) => a + (c.totalStudents || 0), 0)
  const totalEarnings = mockEarnings.reduce((a, e) => a + e.amount, 0)
  const maxEarning = Math.max(...mockEarnings.map(e => e.amount))

 const tabIcons = {
    Dashboard: '📊', 'Course Builder': '🎬',
    Attendance: '📋', 'Q&A Inbox': '💬', Analytics: '📈', Earnings: '💰'
  }
  

  return (
    <div style={{ background: '#07070f', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans',sans-serif" }}>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '5%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,71,255,0.07) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,107,107,0.05) 0%,transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', maxWidth: 1300, margin: '0 auto', padding: isMobile ? '16px 12px' : '28px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12, animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👨‍🏫</div>
            <div>
              <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: isMobile ? 20 : 26, margin: 0 }}>Instructor Studio</h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', margin: 0, fontSize: 12 }}>Welcome, {user?.name}</p>
            </div>
          </div>
          <div style={{ background: 'rgba(0,200,81,0.1)', border: '1px solid rgba(0,200,81,0.3)', borderRadius: 10, padding: '6px 14px', fontSize: 12 }}>
            <span style={{ color: '#00c851' }}>● </span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Live</span>
          </div>
        </div>

        {/* Tabs - Mobile dropdown OR Desktop pills */}
        {isMobile ? (
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <button onClick={() => setTabMenuOpen(!tabMenuOpen)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: 14, fontWeight: 600 }}>
              <span>{tabIcons[activeTab]} {activeTab}</span>
              <span style={{ fontSize: 12 }}>{tabMenuOpen ? '▲' : '▼'}</span>
            </button>
            {tabMenuOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#13131a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, zIndex: 50, overflow: 'hidden', marginTop: 4 }}>
                {tabs.map(tab => (
                  <button key={tab} onClick={() => { setActiveTab(tab); setTabMenuOpen(false) }} style={{ width: '100%', padding: '12px 16px', background: activeTab === tab ? 'rgba(108,71,255,0.15)' : 'transparent', border: 'none', color: activeTab === tab ? '#a78bff' : 'rgba(255,255,255,0.6)', textAlign: 'left', cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans,sans-serif', fontWeight: activeTab === tab ? 600 : 400, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {tabIcons[tab]} {tab}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 4, border: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', animation: 'fadeUp 0.5s ease 0.1s both' }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', background: activeTab === tab ? 'linear-gradient(135deg,#6c47ff,#9c47ff)' : 'transparent', color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)', boxShadow: activeTab === tab ? '0 0 20px rgba(108,71,255,0.4)' : 'none' }}>
                {tabIcons[tab]} {tab}
              </button>
            ))}
          </div>
        )}

        {/* ══ DASHBOARD ══ */}
        {activeTab === 'Dashboard' && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
              <StatCard icon="📚" label="My Courses" value={courses.length} color="#6c47ff" delay={0.1} />
              <StatCard icon="👥" label="Students" value={totalStudents.toLocaleString()} sub="+12% this month" color="#00d2ff" delay={0.2} />
              <StatCard icon="⭐" label="Avg Rating" value="4.8" color="#ff9500" delay={0.3} />
              <StatCard icon="💰" label="This Month" value="₹28,400" color="#00c851" delay={0.4} />
            </div>

            {/* My Courses */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, margin: 0 }}>My Courses</h2>
                <button onClick={() => setActiveTab('Course Builder')} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '7px 16px', borderRadius: 9, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans,sans-serif' }}>
                  + New
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
              ) : courses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', background: '#13131a', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🎬</div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 14, fontSize: 13 }}>No courses yet.</p>
                  <button onClick={() => setActiveTab('Course Builder')} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '9px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontFamily: 'DM Sans,sans-serif', fontSize: 13 }}>
                    Create Course
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {courses.map((c, i) => (
                    <div key={c._id} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, animation: `fadeUp 0.5s ease ${i * 0.08}s both` }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{c.category} · {c.level} · {c.totalStudents || 0} students</p>
                      </div>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 700, flexShrink: 0, background: c.isApproved ? 'rgba(0,200,81,0.12)' : 'rgba(255,149,0,0.12)', color: c.isApproved ? '#00c851' : '#ff9500', border: `1px solid ${c.isApproved ? 'rgba(0,200,81,0.3)' : 'rgba(255,149,0,0.3)'}` }}>
                        {c.isApproved ? '✓ Live' : '⏳ Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Q&A */}
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, margin: '0 0 12px' }}>Recent Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mockQA.slice(0, 3).map(q => (
                <div key={q.id} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {q.student[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.question}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{q.student} · {q.time}</p>
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, flexShrink: 0, background: q.answered ? 'rgba(0,200,81,0.1)' : 'rgba(255,107,107,0.1)', color: q.answered ? '#00c851' : '#ff6b6b' }}>
                    {q.answered ? 'Done' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ COURSE BUILDER ══ */}
        {activeTab === 'Course Builder' && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, alignItems: 'start' }}>
              {/* Form */}
              <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: isMobile ? 18 : 26 }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, margin: '0 0 6px' }}>Create New Course</h2>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 20 }}>Fill in details to publish your course</p>

                {message && (
                  <div style={{ background: message.includes('✅') ? 'rgba(0,200,81,0.1)' : 'rgba(255,107,107,0.1)', border: `1px solid ${message.includes('✅') ? 'rgba(0,200,81,0.3)' : 'rgba(255,107,107,0.3)'}`, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: message.includes('✅') ? '#00c851' : '#ff6b6b' }}>
                    {message}
                  </div>
                )}

                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Course Title', key: 'title', placeholder: 'e.g. Complete React Bootcamp', type: 'text' },
                    { label: 'Category', key: 'category', placeholder: 'e.g. Web Development', type: 'text' },
                    { label: 'Price (₹)', key: 'price', placeholder: '0 for free', type: 'number' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required={f.key !== 'price'}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box', transition: 'border 0.2s' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.6)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                    </div>
                  ))}

                  <div>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Description</label>
                    <textarea placeholder="Describe what students will learn..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box', transition: 'border 0.2s' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 5 }}>Level</label>
                    <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }}>
                      <option value="beginner">🟢 Beginner</option>
                      <option value="intermediate">🟡 Intermediate</option>
                      <option value="advanced">🔴 Advanced</option>
                    </select>
                  </div>

                  {/* Upload area */}
                  <div style={{ border: '2px dashed rgba(108,71,255,0.3)', borderRadius: 14, padding: 20, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,71,255,0.7)'; e.currentTarget.style.background = 'rgba(108,71,255,0.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(108,71,255,0.3)'; e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 4px' }}>Drag & drop videos here</p>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, margin: '0 0 10px' }}>MP4, MOV up to 2GB</p>
                    <button type="button" style={{ background: 'rgba(108,71,255,0.2)', border: '1px solid rgba(108,71,255,0.4)', color: '#a78bff', padding: '7px 16px', borderRadius: 9, cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans,sans-serif' }}>
                      Browse Files
                    </button>
                  </div>

                  <button type="submit" style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '13px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 15, fontFamily: 'DM Sans,sans-serif', boxShadow: '0 0 30px rgba(108,71,255,0.4)' }}>
                    🚀 Publish Course
                  </button>
                </form>
              </div>

              {/* Checklist + Quiz */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'linear-gradient(135deg,rgba(108,71,255,0.1),rgba(255,107,107,0.05))', border: '1px solid rgba(108,71,255,0.2)', borderRadius: 18, padding: 20 }}>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 14px' }}>📋 Course Checklist</h3>
                  {[
                    { done: true, text: 'Add title and description' },
                    { done: true, text: 'Set difficulty and category' },
                    { done: false, text: 'Upload 5+ video lessons' },
                    { done: false, text: 'Add course thumbnail' },
                    { done: false, text: 'Create at least 1 quiz' },
                    { done: false, text: 'Submit for admin approval' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: item.done ? '#00c851' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>
                        {item.done ? '✓' : ''}
                      </div>
                      <span style={{ fontSize: 13, color: item.done ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)', textDecoration: item.done ? 'line-through' : 'none' }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 20 }}>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 6px' }}>🧠 Quiz Builder</h3>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginBottom: 14 }}>Add questions to test students</p>
                  {[
                    { q: 'What is JSX in React?', pts: 10 },
                    { q: 'Explain virtual DOM', pts: 15 },
                    { q: 'What are React Hooks?', pts: 10 },
                  ].map((quiz, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{quiz.q}</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{quiz.pts} pts</p>
                      </div>
                      <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', padding: '4px 10px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontFamily: 'DM Sans,sans-serif', flexShrink: 0, marginLeft: 8 }}>Edit</button>
                    </div>
                  ))}
                  <button style={{ width: '100%', background: 'rgba(108,71,255,0.1)', border: '1px dashed rgba(108,71,255,0.4)', color: '#a78bff', padding: '9px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
                    + Add Question
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ Q&A INBOX ══ */}
        {activeTab === 'Q&A Inbox' && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, margin: 0 }}>Q&A Inbox</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '5px 12px', borderRadius: 100, fontSize: 12 }}>
                  {mockQA.filter(q => !q.answered).length} unanswered
                </span>
                <span style={{ background: 'rgba(0,200,81,0.1)', border: '1px solid rgba(0,200,81,0.3)', color: '#00c851', padding: '5px 12px', borderRadius: 100, fontSize: 12 }}>
                  {mockQA.filter(q => q.answered).length} answered
                </span>
              </div>
            </div>

            {/* ══ ATTENDANCE ══ */}
        {activeTab === 'Attendance' && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>

            {/* Message */}
            {attendanceMsg && (
              <div style={{ background: attendanceMsgType === 'error' ? 'rgba(255,107,107,0.1)' : 'rgba(0,200,81,0.1)', border: `1px solid ${attendanceMsgType === 'error' ? 'rgba(255,107,107,0.3)' : 'rgba(0,200,81,0.3)'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: attendanceMsgType === 'error' ? '#ff6b6b' : '#00c851' }}>
                {attendanceMsg}
              </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, margin: '0 0 4px' }}>📋 Attendance</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: 13 }}>Track and manage student attendance</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setAttendanceView('take')} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 13, background: attendanceView === 'take' ? 'linear-gradient(135deg,#6c47ff,#9c47ff)' : 'rgba(255,255,255,0.06)', color: '#fff' }}>
                  ✏️ Take Attendance
                </button>
                <button onClick={() => setAttendanceView('history')} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 13, background: attendanceView === 'history' ? 'linear-gradient(135deg,#6c47ff,#9c47ff)' : 'rgba(255,255,255,0.06)', color: '#fff' }}>
                  📜 History
                </button>
              </div>
            </div>

            {/* TAKE ATTENDANCE VIEW */}
            {attendanceView === 'take' && (
              <div>
                {/* Setup Form */}
                <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 22, marginBottom: 20 }}>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, margin: '0 0 16px' }}>Session Setup</h3>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
                    {/* Course Select */}
                    <div>
                      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Select Course</label>
                      <select value={selectedCourse || ''} onChange={e => { setSelectedCourse(e.target.value); if (e.target.value) loadStudents(e.target.value) }}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }}>
                        <option value="">-- Select Course --</option>
                        {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                      </select>
                    </div>

                    {/* Date */}
                    <div>
                      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Date</label>
                      <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }} />
                    </div>

                    {/* Session Name */}
                    <div>
                      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Session Name</label>
                      <input type="text" value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="e.g. Morning Session"
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.6)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                    </div>
                  </div>
                </div>

                {/* Student List */}
                {loadingStudents && (
                  <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
                    <p>Loading students...</p>
                  </div>
                )}

                {!loadingStudents && attendanceStudents.length > 0 && (
                  <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, overflow: 'hidden' }}>
                    {/* Header row */}
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 4px' }}>Student List</h3>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>
                          {attendanceStudents.length} students enrolled ·
                          <span style={{ color: '#00c851' }}> {attendanceRecords.filter(r => r.status === 'present').length} present</span> ·
                          <span style={{ color: '#ff6b6b' }}> {attendanceRecords.filter(r => r.status === 'absent').length} absent</span> ·
                          <span style={{ color: '#ff9500' }}> {attendanceRecords.filter(r => r.status === 'late').length} late</span>
                        </p>
                      </div>
                      {/* Mark All buttons */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={() => markAll('present')} style={{ background: 'rgba(0,200,81,0.15)', border: '1px solid rgba(0,200,81,0.3)', color: '#00c851', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans,sans-serif' }}>
                          ✅ All Present
                        </button>
                        <button onClick={() => markAll('absent')} style={{ background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans,sans-serif' }}>
                          ❌ All Absent
                        </button>
                      </div>
                    </div>

                    {/* Students */}
                    <div>
                      {attendanceStudents.map((student, i) => {
                        const record = attendanceRecords.find(r => r.student === student._id)
                        const status = record?.status || 'present'
                        return (
                          <div key={student._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < attendanceStudents.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.2s', flexWrap: 'wrap' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            {/* Avatar */}
                            <div style={{ width: 42, height: 42, borderRadius: '50%', background: status === 'present' ? 'linear-gradient(135deg,#00c851,#00a844)' : status === 'late' ? 'linear-gradient(135deg,#ff9500,#ff7500)' : 'linear-gradient(135deg,#ff6b6b,#ff4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, flexShrink: 0, transition: 'all 0.3s' }}>
                              {student.name?.[0]?.toUpperCase()}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#fff' }}>{student.name}</p>
                              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{student.email}</p>
                            </div>

                            {/* Status Buttons */}
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              {['present', 'late', 'absent'].map(s => (
                                <button key={s} onClick={() => updateStatus(student._id, s)} style={{
                                  padding: isMobile ? '6px 10px' : '7px 14px',
                                  borderRadius: 9, border: 'none', cursor: 'pointer',
                                  fontFamily: 'DM Sans,sans-serif', fontWeight: 600,
                                  fontSize: isMobile ? 11 : 12, transition: 'all 0.2s',
                                  background: status === s
                                    ? s === 'present' ? '#00c851' : s === 'late' ? '#ff9500' : '#ff6b6b'
                                    : 'rgba(255,255,255,0.06)',
                                  color: status === s ? '#fff' : 'rgba(255,255,255,0.4)',
                                  transform: status === s ? 'scale(1.05)' : 'scale(1)',
                                  boxShadow: status === s ? `0 0 12px ${s === 'present' ? 'rgba(0,200,81,0.4)' : s === 'late' ? 'rgba(255,149,0,0.4)' : 'rgba(255,107,107,0.4)'}` : 'none'
                                }}>
                                  {s === 'present' ? '✅' : s === 'late' ? '🕐' : '❌'} {isMobile ? '' : s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Save Button */}
                    <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.4)', alignItems: 'center', marginRight: 'auto' }}>
                        <span style={{ color: '#00c851' }}>✅ {attendanceRecords.filter(r => r.status === 'present').length}</span>
                        <span style={{ color: '#ff9500' }}>🕐 {attendanceRecords.filter(r => r.status === 'late').length}</span>
                        <span style={{ color: '#ff6b6b' }}>❌ {attendanceRecords.filter(r => r.status === 'absent').length}</span>
                      </div>
                      <button onClick={saveAttendance} disabled={savingAttendance} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '11px 28px', borderRadius: 12, cursor: savingAttendance ? 'wait' : 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans,sans-serif', boxShadow: '0 0 25px rgba(108,71,255,0.4)', opacity: savingAttendance ? 0.7 : 1 }}>
                        {savingAttendance ? '⏳ Saving...' : '💾 Save Attendance'}
                      </button>
                    </div>
                  </div>
                )}

                {!loadingStudents && !selectedCourse && (
                  <div style={{ textAlign: 'center', padding: '50px 20px', background: '#13131a', border: '1px dashed rgba(108,71,255,0.3)', borderRadius: 18 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Select a course above to start taking attendance</p>
                  </div>
                )}

                {!loadingStudents && selectedCourse && attendanceStudents.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '50px 20px', background: '#13131a', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 18 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No students enrolled in this course yet</p>
                  </div>
                )}
              </div>
            )}

            {/* HISTORY VIEW */}
            {attendanceView === 'history' && (
              <div>
                {attendanceHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', background: '#13131a', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 18 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📜</div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No attendance records yet</p>
                    <button onClick={() => setAttendanceView('take')} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '10px 22px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontFamily: 'DM Sans,sans-serif', marginTop: 16, fontSize: 14 }}>
                      Take Attendance →
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {attendanceHistory.map((record, i) => (
                      <div key={record._id} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, overflow: 'hidden', animation: `fadeUp 0.5s ease ${i * 0.07}s both` }}>

                        {/* Record Header */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                          <div>
                            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 4px', color: '#fff' }}>
                              {record.course?.title || 'Course'}
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>
                              📅 {new Date(record.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              {record.session && ` · ${record.session}`}
                            </p>
                          </div>

                          {/* Stats badges */}
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ background: 'rgba(0,200,81,0.12)', color: '#00c851', fontSize: 12, padding: '4px 12px', borderRadius: 100, fontWeight: 600 }}>
                              ✅ {record.totalPresent} Present
                            </span>
                            {record.totalLate > 0 && (
                              <span style={{ background: 'rgba(255,149,0,0.12)', color: '#ff9500', fontSize: 12, padding: '4px 12px', borderRadius: 100, fontWeight: 600 }}>
                                🕐 {record.totalLate} Late
                              </span>
                            )}
                            {record.totalAbsent > 0 && (
                              <span style={{ background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', fontSize: 12, padding: '4px 12px', borderRadius: 100, fontWeight: 600 }}>
                                ❌ {record.totalAbsent} Absent
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Student records */}
                        <div>
                          {record.records?.map((r, ri) => (
                            <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: ri < record.records.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                              <div style={{ width: 34, height: 34, borderRadius: '50%', background: r.status === 'present' ? 'rgba(0,200,81,0.2)' : r.status === 'late' ? 'rgba(255,149,0,0.2)' : 'rgba(255,107,107,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0, color: r.status === 'present' ? '#00c851' : r.status === 'late' ? '#ff9500' : '#ff6b6b' }}>
                                {r.student?.name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: 13, color: '#fff', fontWeight: 500 }}>{r.student?.name || 'Student'}</p>
                                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.student?.email}</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, fontWeight: 600, background: r.status === 'present' ? 'rgba(0,200,81,0.12)' : r.status === 'late' ? 'rgba(255,149,0,0.12)' : 'rgba(255,107,107,0.12)', color: r.status === 'present' ? '#00c851' : r.status === 'late' ? '#ff9500' : '#ff6b6b' }}>
                                  {r.status === 'present' ? '✅ Present' : r.status === 'late' ? '🕐 Late' : '❌ Absent'}
                                </span>
                                {r.notified && (
                                  <span style={{ fontSize: 10, color: '#a78bff', background: 'rgba(108,71,255,0.12)', padding: '2px 8px', borderRadius: 100 }}>
                                    📧 Notified
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Email Notification Buttons */}
                        {(record.totalAbsent > 0 || record.totalLate > 0) && (
                          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginRight: 4 }}>📧 Send Email:</span>
                            {record.totalAbsent > 0 && (
                              <button onClick={() => sendNotifications(record._id, 'absent')} disabled={notifying} style={{ background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '7px 16px', borderRadius: 9, cursor: notifying ? 'wait' : 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', opacity: notifying ? 0.7 : 1, transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,107,107,0.12)'}>
                                {notifying ? '⏳ Sending...' : `📧 Notify ${record.totalAbsent} Absent`}
                              </button>
                            )}
                            {record.totalLate > 0 && (
                              <button onClick={() => sendNotifications(record._id, 'late')} disabled={notifying} style={{ background: 'rgba(255,149,0,0.12)', border: '1px solid rgba(255,149,0,0.3)', color: '#ff9500', padding: '7px 16px', borderRadius: 9, cursor: notifying ? 'wait' : 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', opacity: notifying ? 0.7 : 1, transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,149,0,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,149,0,0.12)'}>
                                {notifying ? '⏳ Sending...' : `📧 Notify ${record.totalLate} Late`}
                              </button>
                            )}
                            {(record.totalAbsent > 0 || record.totalLate > 0) && (
                              <button onClick={() => sendNotifications(record._id, 'all')} disabled={notifying} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '7px 16px', borderRadius: 9, cursor: notifying ? 'wait' : 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', opacity: notifying ? 0.7 : 1 }}>
                                {notifying ? '⏳ Sending...' : '📧 Notify All'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mockQA.map((q, i) => (
                <div key={q.id} style={{ background: '#13131a', border: `1px solid ${q.answered ? 'rgba(0,200,81,0.15)' : 'rgba(255,107,107,0.15)'}`, borderRadius: 16, padding: 18, animation: `fadeUp 0.5s ease ${i * 0.07}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                        {q.student[0]}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#fff' }}>{q.student}</p>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{q.course} · {q.time}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: q.answered ? 'rgba(0,200,81,0.1)' : 'rgba(255,107,107,0.1)', color: q.answered ? '#00c851' : '#ff6b6b', flexShrink: 0 }}>
                      {q.answered ? '✓ Done' : '⏳ Pending'}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px', marginBottom: q.answered ? 0 : 12 }}>
                    <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>"{q.question}"</p>
                  </div>

                  {!q.answered && (
                    <div>
                      <textarea placeholder="Type your answer..." value={answers[q.id] || ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} rows={2}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box', marginBottom: 8, transition: 'border 0.2s' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                      <button style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '9px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
                        Send Answer →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ ANALYTICS ══ */}
        {activeTab === 'Analytics' && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, margin: '0 0 16px' }}>Course Analytics</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
              <StatCard icon="⏱" label="Avg Watch Time" value="18 min" color="#6c47ff" delay={0.1} />
              <StatCard icon="✅" label="Completion" value="68%" color="#00c851" delay={0.2} />
              <StatCard icon="📉" label="Drop-off" value="32%" color="#ff6b6b" delay={0.3} />
              <StatCard icon="📺" label="Watch Hours" value="4,820" color="#ff9500" delay={0.4} />
            </div>

            {/* Enrollment chart */}
            <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 18px' }}>Monthly Enrollment</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130 }}>
                {[{ month: 'Oct', value: 65 }, { month: 'Nov', value: 82 }, { month: 'Dec', value: 71 }, { month: 'Jan', value: 90 }, { month: 'Feb', value: 78 }, { month: 'Mar', value: 100 }].map((d, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', borderRadius: '4px 4px 0 0', height: `${d.value}%`, background: i === 5 ? 'linear-gradient(to top,#6c47ff,#9c47ff)' : 'rgba(108,71,255,0.3)', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(to top,#6c47ff,#9c47ff)'}
                      onMouseLeave={e => { if (i !== 5) e.currentTarget.style.background = 'rgba(108,71,255,0.3)' }} />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Drop-off */}
            <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 16px' }}>Drop-off by Lesson</h3>
              {[
                { lesson: 'Introduction', watch: 98 },
                { lesson: 'Core Concepts', watch: 87 },
                { lesson: 'Advanced Topics', watch: 71 },
                { lesson: 'Project Build', watch: 65 },
                { lesson: 'Final Quiz', watch: 58 },
              ].map((row, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>{row.lesson}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{row.watch}%</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 6 }}>
                    <div style={{ height: 6, borderRadius: 100, width: `${row.watch}%`, background: row.watch > 80 ? '#00c851' : row.watch > 60 ? '#ff9500' : '#ff6b6b' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ EARNINGS ══ */}
        {activeTab === 'Earnings' && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, margin: '0 0 16px' }}>Financial Overview</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
              <StatCard icon="💰" label="Total Earnings" value={`₹${totalEarnings.toLocaleString()}`} sub="All time" color="#00c851" delay={0.1} />
              <StatCard icon="📅" label="This Month" value="₹28,400" sub="+46% vs last" color="#6c47ff" delay={0.2} />
              <StatCard icon="⏳" label="Pending" value="₹12,200" sub="3 days" color="#ff9500" delay={0.3} />
              <StatCard icon="🏦" label="Paid Out" value={`₹${(totalEarnings - 12200).toLocaleString()}`} color="#00d2ff" delay={0.4} />
            </div>

            {/* Earnings chart */}
            <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 18px' }}>Monthly Earnings (₹)</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
                {mockEarnings.map((e, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>₹{(e.amount / 1000).toFixed(0)}k</span>
                    <div style={{ width: '100%', borderRadius: '4px 4px 0 0', height: `${(e.amount / maxEarning) * 100}%`, background: i === mockEarnings.length - 1 ? 'linear-gradient(to top,#00c851,#00d2ff)' : 'rgba(0,200,81,0.25)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(to top,#00c851,#00d2ff)'}
                      onMouseLeave={(e) => { if (i !== mockEarnings.length - 1) e.currentTarget.style.background = 'rgba(0,200,81,0.25)' }} />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{e.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payout history */}
            <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: 0 }}>Payout History</h3>
              </div>
              {[
                { date: 'Mar 01, 2026', amount: '₹16,200', status: 'Paid' },
                { date: 'Feb 01, 2026', amount: '₹19,500', status: 'Paid' },
                { date: 'Jan 01, 2026', amount: '₹22,800', status: 'Paid' },
                { date: 'Mar 26, 2026', amount: '₹12,200', status: 'Pending' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: 14 }}>{row.amount}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{row.date} · Bank Transfer</p>
                  </div>
                  <span style={{ fontSize: 12, padding: '3px 12px', borderRadius: 100, background: row.status === 'Paid' ? 'rgba(0,200,81,0.1)' : 'rgba(255,149,0,0.1)', color: row.status === 'Paid' ? '#00c851' : '#ff9500', border: `1px solid ${row.status === 'Paid' ? 'rgba(0,200,81,0.2)' : 'rgba(255,149,0,0.2)'}` }}>
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
        select option { background: #1a1a24; color: #fff; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #07070f; }
        ::-webkit-scrollbar-thumb { background: #ff6b6b; border-radius: 10px; }
        @media (max-width: 768px) { * { -webkit-tap-highlight-color: transparent; } }
      `}</style>
    </div>
  )
}

export default InstructorPanel