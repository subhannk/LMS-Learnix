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

  // ── Loading States ──
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notifyingId, setNotifyingId] = useState(null)

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
  useEffect(() => {
    API.get('/courses/instructor/my-courses')
      .then(({ data }) => setCourses(data))
      .catch(() => showMsg('Failed to load courses', 'error'))

    API.get('/attendance/instructor')
      .then(({ data }) => setHistory(data))
      .catch(() => {})
  }, [])

  const showMsg = (text, type = 'success') => {
    setMsg(text)
    setMsgType(type)
    setTimeout(() => setMsg(''), 4000)
  }

  // ── Load students when course selected ──
  const loadStudents = async (courseId) => {
    if (!courseId) return
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
      showMsg('Failed to load students. Make sure students are enrolled.', 'error')
    }
    setLoadingStudents(false)
  }

  // ── Update single student status ──
  const updateStatus = (studentId, status) => {
    setRecords(prev => prev.map(r => r.student === studentId ? { ...r, status } : r))
  }

  // ── Mark all students with same status ──
  const markAll = (status) => {
    setRecords(prev => prev.map(r => ({ ...r, status })))
  }

  // ── Save attendance ──
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
      setHistory(prev => [data, ...prev])
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
      // Update local history to show notified badges
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
    } catch {
      showMsg('Failed to send emails. Check EMAIL_USER and EMAIL_PASS in .env file', 'error')
    }
    setNotifyingId(null)
  }

  // ── Computed values ──
  const presentCount = records.filter(r => r.status === 'present').length
  const absentCount = records.filter(r => r.status === 'absent').length
  const lateCount = records.filter(r => r.status === 'late').length
  const totalCount = records.length

  // ── Status button config ──
  const statusOptions = [
    { value: 'present', emoji: '✅', label: 'Present', color: '#00c851', bg: 'rgba(0,200,81,0.12)', border: 'rgba(0,200,81,0.35)' },
    { value: 'late', emoji: '🕐', label: 'Late', color: '#ff9500', bg: 'rgba(255,149,0,0.12)', border: 'rgba(255,149,0,0.35)' },
    { value: 'absent', emoji: '❌', label: 'Absent', color: '#ff6b6b', bg: 'rgba(255,107,107,0.12)', border: 'rgba(255,107,107,0.35)' },
  ]

  return (
    <div style={{ background: '#07070f', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans',sans-serif" }}>

      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,71,255,0.08) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,200,81,0.06) 0%,transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: isMobile ? '16px 12px' : '28px 24px' }}>

        {/* ── TOP NAVIGATION BAR ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate('/instructor')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans,sans-serif', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
              ← Back
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#6c47ff,#00c851)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📋</div>
              <div>
                <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: isMobile ? 20 : 26, margin: 0, letterSpacing: '-0.5px' }}>Attendance Manager</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: 12 }}>Track attendance · Send email notifications</p>
              </div>
            </div>
          </div>

          {/* Instructor badge */}
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

        {/* ── TOAST MESSAGE ── */}
        {msg && (
          <div style={{ background: msgType === 'error' ? 'rgba(255,107,107,0.12)' : 'rgba(0,200,81,0.12)', border: `1px solid ${msgType === 'error' ? 'rgba(255,107,107,0.4)' : 'rgba(0,200,81,0.4)'}`, borderRadius: 12, padding: '13px 18px', marginBottom: 20, fontSize: 14, color: msgType === 'error' ? '#ff6b6b' : '#00c851', display: 'flex', alignItems: 'center', gap: 8, animation: 'fadeUp 0.3s ease both', backdropFilter: 'blur(10px)' }}>
            <span style={{ fontSize: 18 }}>{msgType === 'error' ? '❌' : '✅'}</span>
            {msg}
          </div>
        )}

        {/* ── STATS ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { icon: '📚', label: 'Total Courses', value: courses.length, color: '#6c47ff' },
            { icon: '📋', label: 'Sessions Taken', value: history.length, color: '#00d2ff' },
            { icon: '✅', label: 'Avg Attendance', value: history.length > 0 ? Math.round(history.reduce((a, h) => a + (h.totalPresent / (h.records?.length || 1)), 0) / history.length * 100) + '%' : '—', color: '#00c851' },
            { icon: '📧', label: 'Emails Sent', value: history.reduce((a, h) => a + (h.records?.filter(r => r.notified).length || 0), 0), color: '#ff9500' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#13131a', border: `1px solid ${s.color}20`, borderRadius: 14, padding: '14px 16px', transition: 'all 0.3s', animation: `fadeUp 0.5s ease ${i * 0.07}s both` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = s.color + '50'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = s.color + '20'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 22, color: '#fff' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── TAB SWITCHER ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 5, border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { id: 'take', icon: '✏️', label: 'Take Attendance' },
            { id: 'history', icon: '📜', label: `History (${history.length})` }
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

            {/* Session Setup Card */}
            <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: isMobile ? 16 : 24, marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: 'rgba(108,71,255,0.2)', border: '1px solid rgba(108,71,255,0.3)', width: 34, height: 34, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚙️</span>
                Session Setup
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 16 }}>

                {/* Course Select */}
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 7, fontWeight: 600, letterSpacing: 0.5 }}>
                    📚 COURSE
                  </label>
                  <select value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); loadStudents(e.target.value) }}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 11, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: selectedCourse ? '#fff' : 'rgba(255,255,255,0.35)', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box', cursor: 'pointer', transition: 'border 0.2s' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}>
                    <option value="">-- Select a Course --</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                {/* Date Picker */}
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 7, fontWeight: 600, letterSpacing: 0.5 }}>
                    📅 DATE
                  </label>
                  <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 11, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box', transition: 'border 0.2s' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>

                {/* Session Name */}
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 7, fontWeight: 600, letterSpacing: 0.5 }}>
                    🏷️ SESSION NAME
                  </label>
                  <input type="text" value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="e.g. Morning Session"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 11, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box', transition: 'border 0.2s' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
              </div>
            </div>

            {/* Empty state - no course selected */}
            {!selectedCourse && !loadingStudents && (
              <div style={{ textAlign: 'center', padding: '70px 20px', background: '#13131a', border: '2px dashed rgba(108,71,255,0.2)', borderRadius: 20, animation: 'fadeUp 0.5s ease both' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, margin: '0 0 10px' }}>Select a Course to Begin</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>
                  Choose a course from the dropdown above to load the student list
                </p>
                {courses.length === 0 && (
                  <p style={{ color: '#ff9500', fontSize: 13, marginTop: 12 }}>
                    ⚠️ No courses found. Create a course first in Course Builder.
                  </p>
                )}
              </div>
            )}

            {/* Loading spinner */}
            {loadingStudents && (
              <div style={{ textAlign: 'center', padding: '70px 20px', background: '#13131a', borderRadius: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 16, display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>Loading students...</p>
              </div>
            )}

            {/* No students enrolled */}
            {!loadingStudents && selectedCourse && students.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#13131a', border: '1px dashed rgba(255,107,107,0.3)', borderRadius: 20 }}>
                <div style={{ fontSize: 56, marginBottom: 14 }}>👥</div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 20, margin: '0 0 8px' }}>No Students Enrolled</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                  No students are enrolled in this course yet
                </p>
              </div>
            )}

            {/* Student attendance table */}
            {!loadingStudents && students.length > 0 && (
              <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>

                {/* Table header with bulk actions */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        Student List
                        <span style={{ background: 'rgba(108,71,255,0.2)', color: '#a78bff', fontSize: 12, padding: '2px 10px', borderRadius: 100, fontWeight: 600 }}>
                          {students.length} students
                        </span>
                      </h3>
                      <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
                        <span style={{ color: '#00c851', fontWeight: 600 }}>✅ {presentCount} Present</span>
                        <span style={{ color: '#ff9500', fontWeight: 600 }}>🕐 {lateCount} Late</span>
                        <span style={{ color: '#ff6b6b', fontWeight: 600 }}>❌ {absentCount} Absent</span>
                      </div>
                    </div>

                    {/* Bulk Mark buttons */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {statusOptions.map(s => (
                        <button key={s.value} onClick={() => markAll(s.value)} style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, padding: '7px 14px', borderRadius: 9, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                          {s.emoji} All {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live progress bar */}
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 7, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', height: '100%', transition: 'all 0.4s ease' }}>
                      <div style={{ width: totalCount > 0 ? `${(presentCount / totalCount) * 100}%` : '0%', background: '#00c851', transition: 'width 0.4s' }} />
                      <div style={{ width: totalCount > 0 ? `${(lateCount / totalCount) * 100}%` : '0%', background: '#ff9500', transition: 'width 0.4s' }} />
                      <div style={{ width: totalCount > 0 ? `${(absentCount / totalCount) * 100}%` : '0%', background: '#ff6b6b', transition: 'width 0.4s' }} />
                    </div>
                  </div>
                </div>

                {/* Individual student rows */}
                {students.map((student, i) => {
                  const record = records.find(r => r.student === student._id)
                  const status = record?.status || 'present'
                  const current = statusOptions.find(s => s.value === status)

                  return (
                    <div key={student._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: isMobile ? '12px 14px' : '15px 20px', borderBottom: i < students.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.2s', flexWrap: isMobile ? 'wrap' : 'nowrap' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Rank number */}
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', width: 20, textAlign: 'right', flexShrink: 0, fontFamily: 'monospace' }}>
                        {i + 1}
                      </span>

                      {/* Avatar with status color ring */}
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: current.bg, border: `2px solid ${current.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 17, flexShrink: 0, color: current.color, transition: 'all 0.3s' }}>
                        {student.name?.[0]?.toUpperCase()}
                      </div>

                      {/* Student name + email */}
                      <div style={{ flex: 1, minWidth: isMobile ? '60%' : 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#fff' }}>{student.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{student.email}</p>
                      </div>

                      {/* Current status badge */}
                      {!isMobile && (
                        <div style={{ flexShrink: 0 }}>
                          <span style={{ background: current.bg, color: current.color, fontSize: 12, padding: '4px 12px', borderRadius: 100, fontWeight: 700, border: `1px solid ${current.border}` }}>
                            {current.emoji} {current.label}
                          </span>
                        </div>
                      )}

                      {/* Status toggle buttons */}
                      <div style={{ display: 'flex', gap: 7, flexShrink: 0, width: isMobile ? '100%' : 'auto', marginTop: isMobile ? 8 : 0 }}>
                        {statusOptions.map(s => (
                          <button key={s.value} onClick={() => updateStatus(student._id, s.value)} style={{
                            flex: isMobile ? 1 : 'none',
                            padding: isMobile ? '9px 6px' : '8px 16px',
                            borderRadius: 10,
                            border: `1.5px solid ${status === s.value ? 'transparent' : s.border}`,
                            cursor: 'pointer',
                            fontFamily: 'DM Sans,sans-serif',
                            fontWeight: 700,
                            fontSize: isMobile ? 11 : 12,
                            transition: 'all 0.2s',
                            background: status === s.value ? s.color : s.bg,
                            color: status === s.value ? '#fff' : s.color,
                            transform: status === s.value ? 'scale(1.04)' : 'scale(1)',
                            boxShadow: status === s.value ? `0 4px 16px ${s.color}40` : 'none'
                          }}>
                            {s.emoji} {isMobile ? '' : s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Save footer */}
                <div style={{ padding: '18px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                  {/* Summary */}
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 22, color: '#00c851' }}>{presentCount}</p>
                      <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Present</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 22, color: '#ff9500' }}>{lateCount}</p>
                      <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Late</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 22, color: '#ff6b6b' }}>{absentCount}</p>
                      <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Absent</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 22, color: '#fff' }}>{totalCount}</p>
                      <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Total</p>
                    </div>
                  </div>

                  {/* Save button */}
                  <button onClick={saveAttendance} disabled={saving} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '13px 36px', borderRadius: 13, cursor: saving ? 'wait' : 'pointer', fontWeight: 800, fontSize: 15, fontFamily: 'DM Sans,sans-serif', boxShadow: '0 0 32px rgba(108,71,255,0.5)', opacity: saving ? 0.7 : 1, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {saving ? (
                      <>⏳ Saving...</>
                    ) : (
                      <>💾 Save Attendance</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════
            HISTORY VIEW
        ════════════════════════════════════ */}
        {view === 'history' && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>

            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '70px 20px', background: '#13131a', border: '2px dashed rgba(255,255,255,0.07)', borderRadius: 20 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📜</div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, margin: '0 0 10px' }}>No Records Yet</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, marginBottom: 22 }}>
                  Take attendance for your courses to see records here
                </p>
                <button onClick={() => setView('take')} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '13px 32px', borderRadius: 13, cursor: 'pointer', fontWeight: 700, fontFamily: 'DM Sans,sans-serif', fontSize: 15, boxShadow: '0 0 30px rgba(108,71,255,0.4)' }}>
                  ✏️ Take First Attendance →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {history.map((record, i) => {
                  const isExpanded = expandedId === record._id
                  const absentStudents = record.records?.filter(r => r.status === 'absent') || []
                  const lateStudents = record.records?.filter(r => r.status === 'late') || []
                  const total = record.records?.length || 1
                  const attendancePct = Math.round((record.totalPresent / total) * 100)

                  return (
                  <div
  key={record._id}
  style={{
    background: '#13131a',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20,
    overflow: 'hidden',
    animation: `fadeUp 0.5s ease ${i * 0.05}s both`,
    transition: 'box-shadow 0.3s'
  }}
  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'}
  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
>

                      {/* ── Record Header (clickable to expand) ── */}
                      <div onClick={() => setExpandedId(isExpanded ? null : record._id)} style={{ padding: '18px 20px', cursor: 'pointer', background: isExpanded ? 'rgba(108,71,255,0.05)' : 'transparent', transition: 'background 0.2s' }}
                        onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                        onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                            {/* Course icon */}
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg,${attendancePct >= 75 ? '#00c851' : attendancePct >= 50 ? '#ff9500' : '#ff6b6b'},#6c47ff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                              📋
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 3px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {record.course?.title || 'Course'}
                              </h3>
                              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>
                                📅 {new Date(record.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                {record.session ? ` · ${record.session}` : ''}
                              </p>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                            {/* Attendance percentage */}
                            <div style={{ textAlign: 'center', background: attendancePct >= 75 ? 'rgba(0,200,81,0.1)' : attendancePct >= 50 ? 'rgba(255,149,0,0.1)' : 'rgba(255,107,107,0.1)', border: `1px solid ${attendancePct >= 75 ? 'rgba(0,200,81,0.3)' : attendancePct >= 50 ? 'rgba(255,149,0,0.3)' : 'rgba(255,107,107,0.3)'}`, borderRadius: 10, padding: '6px 12px' }}>
                              <p style={{ margin: 0, fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 18, color: attendancePct >= 75 ? '#00c851' : attendancePct >= 50 ? '#ff9500' : '#ff6b6b' }}>{attendancePct}%</p>
                              <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Attendance</p>
                            </div>

                            {/* Stat pills */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <span style={{ background: 'rgba(0,200,81,0.12)', color: '#00c851', fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 600 }}>✅ {record.totalPresent} Present</span>
                              {record.totalLate > 0 && <span style={{ background: 'rgba(255,149,0,0.12)', color: '#ff9500', fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 600 }}>🕐 {record.totalLate} Late</span>}
                              {record.totalAbsent > 0 && <span style={{ background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 600 }}>❌ {record.totalAbsent} Absent</span>}
                            </div>

                            {/* Expand arrow */}
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', flexShrink: 0 }}>▼</div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 6, overflow: 'hidden' }}>
                          <div style={{ display: 'flex', height: '100%' }}>
                            <div style={{ width: `${(record.totalPresent / total) * 100}%`, background: '#00c851', transition: 'width 0.6s ease' }} />
                            <div style={{ width: `${(record.totalLate / total) * 100}%`, background: '#ff9500', transition: 'width 0.6s ease' }} />
                            <div style={{ width: `${(record.totalAbsent / total) * 100}%`, background: '#ff6b6b', transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                      </div>

                      {/* ── Expanded content ── */}
                      {isExpanded && (
                        <div>
                          {/* Student list */}
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            {record.records?.map((r, ri) => (
                              <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: isMobile ? '10px 14px' : '11px 20px', borderBottom: ri < record.records.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                {/* Avatar */}
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: r.status === 'present' ? 'rgba(0,200,81,0.15)' : r.status === 'late' ? 'rgba(255,149,0,0.15)' : 'rgba(255,107,107,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0, color: r.status === 'present' ? '#00c851' : r.status === 'late' ? '#ff9500' : '#ff6b6b' }}>
                                  {r.student?.name?.[0]?.toUpperCase() || '?'}
                                </div>

                                {/* Name + email */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#fff' }}>{r.student?.name || 'Student'}</p>
                                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.student?.email || '—'}</p>
                                </div>

                                {/* Status + Notified badge */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, fontWeight: 600, background: r.status === 'present' ? 'rgba(0,200,81,0.12)' : r.status === 'late' ? 'rgba(255,149,0,0.12)' : 'rgba(255,107,107,0.12)', color: r.status === 'present' ? '#00c851' : r.status === 'late' ? '#ff9500' : '#ff6b6b' }}>
                                    {r.status === 'present' ? '✅ Present' : r.status === 'late' ? '🕐 Late' : '❌ Absent'}
                                  </span>
                                  {r.notified && (
                                    <span style={{ fontSize: 10, color: '#a78bff', background: 'rgba(108,71,255,0.12)', border: '1px solid rgba(108,71,255,0.25)', padding: '2px 8px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 4 }}>
                                      📧 Notified
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* ── Email Notification Panel ── */}
                          {(record.totalAbsent > 0 || record.totalLate > 0) ? (
                            <div style={{ padding: '18px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(135deg,rgba(108,71,255,0.06),rgba(0,200,81,0.03))' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,71,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📧</div>
                                <div>
                                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#fff' }}>Send Email Notifications</p>
                                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                                    Real emails will be sent to students via Gmail
                                  </p>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {/* Notify absent */}
                                {record.totalAbsent > 0 && (
                                  <button onClick={() => sendNotifications(record._id, 'absent')} disabled={!!notifyingId}
                                    style={{ background: notifyingId === record._id + 'absent' ? 'rgba(255,107,107,0.05)' : 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.35)', color: '#ff6b6b', padding: '11px 20px', borderRadius: 11, cursor: notifyingId ? 'wait' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 7 }}
                                    onMouseEnter={e => { if (!notifyingId) e.currentTarget.style.background = 'rgba(255,107,107,0.22)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.12)' }}
                                  >
                                    {notifyingId === record._id + 'absent' ? '⏳ Sending...' : `📧 Notify ${record.totalAbsent} Absent`}
                                  </button>
                                )}

                                {/* Notify late */}
                                {record.totalLate > 0 && (
                                  <button onClick={() => sendNotifications(record._id, 'late')} disabled={!!notifyingId}
                                    style={{ background: notifyingId === record._id + 'late' ? 'rgba(255,149,0,0.05)' : 'rgba(255,149,0,0.12)', border: '1px solid rgba(255,149,0,0.35)', color: '#ff9500', padding: '11px 20px', borderRadius: 11, cursor: notifyingId ? 'wait' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 7 }}
                                    onMouseEnter={e => { if (!notifyingId) e.currentTarget.style.background = 'rgba(255,149,0,0.22)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,149,0,0.12)' }}
                                  >
                                    {notifyingId === record._id + 'late' ? '⏳ Sending...' : `📧 Notify ${record.totalLate} Late`}
                                  </button>
                                )}

                                {/* Notify all */}
                                <button onClick={() => sendNotifications(record._id, 'all')} disabled={!!notifyingId}
                                  style={{ background: notifyingId === record._id + 'all' ? 'rgba(108,71,255,0.2)' : 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '11px 24px', borderRadius: 11, cursor: notifyingId ? 'wait' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans,sans-serif', boxShadow: notifyingId ? 'none' : '0 0 24px rgba(108,71,255,0.4)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 7 }}>
                                  {notifyingId === record._id + 'all' ? '⏳ Sending all...' : `📧 Notify All (${(record.totalAbsent || 0) + (record.totalLate || 0)})`}
                                </button>
                              </div>

                              {/* Already notified info */}
                              {record.records?.some(r => r.notified) && (
                                <div style={{ marginTop: 12, background: 'rgba(108,71,255,0.08)', border: '1px solid rgba(108,71,255,0.15)', borderRadius: 10, padding: '9px 14px', fontSize: 12, color: '#a78bff', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span>ℹ️</span>
                                  {record.records.filter(r => r.notified).length} student(s) already notified — they won't get duplicate emails
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,200,81,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 20 }}>🎉</span>
                              <p style={{ margin: 0, color: '#00c851', fontSize: 14, fontWeight: 600 }}>
                                Perfect attendance! All students were present.
                              </p>
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        select option { background: #1a1a24; color: #fff; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #07070f; }
        ::-webkit-scrollbar-thumb { background: #6c47ff; border-radius: 10px; }
        @media (max-width: 768px) { * { -webkit-tap-highlight-color: transparent; } }
      `}</style>
    </div>
  )
}

export default AttendancePage