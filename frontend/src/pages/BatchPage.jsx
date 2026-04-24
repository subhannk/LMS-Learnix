import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const COLORS = ['#6c47ff', '#ff6b6b', '#00d2ff', '#ff9500', '#00c851', '#ff3cac', '#ffcc00']

const defaultForm = {
  name: '',
  description: '',
  courseId: '',
  startDate: '',
  endDate: '',
  maxStudents: 30,
  mode: 'online',
  meetingLink: '',
  location: '',
  status: 'upcoming',
  color: '#6c47ff',
  schedule: []
}

const statusColors = {
  upcoming: { bg: 'rgba(255,149,0,0.12)', color: '#ff9500', border: 'rgba(255,149,0,0.3)' },
  active: { bg: 'rgba(0,200,81,0.12)', color: '#00c851', border: 'rgba(0,200,81,0.3)' },
  completed: { bg: 'rgba(108,71,255,0.12)', color: '#a78bff', border: 'rgba(108,71,255,0.3)' },
  cancelled: { bg: 'rgba(255,107,107,0.12)', color: '#ff6b6b', border: 'rgba(255,107,107,0.3)' }
}

const modeIcons = { online: '💻', offline: '🏫', hybrid: '🔀' }

const BatchPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [batches, setBatches] = useState([])
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [view, setView] = useState('list') // list | create | detail | schedule
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [scheduleEntry, setScheduleEntry] = useState({ day: 'Monday', startTime: '09:00', endTime: '11:00', topic: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [searchStudent, setSearchStudent] = useState('')
  const [enrollStudentId, setEnrollStudentId] = useState('')
  const [activeDetailTab, setActiveDetailTab] = useState('schedule')

  useEffect(() => {
    const r = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', r)
    return () => window.removeEventListener('resize', r)
  }, [])

  useEffect(() => {
    Promise.all([
      API.get('/batches/instructor'),
      API.get('/courses/instructor/my-courses'),
      API.get('/users')
    ]).then(([b, c, u]) => {
      setBatches(b.data)
      setCourses(c.data)
      setStudents(u.data.filter(u => u.role === 'student'))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const showMsg = (text, type = 'success') => {
    setMsg(text)
    setMsgType(type)
    setTimeout(() => setMsg(''), 4000)
  }

  const addScheduleSlot = () => {
    if (!scheduleEntry.startTime || !scheduleEntry.endTime) return
    setForm(prev => ({
      ...prev,
      schedule: [...prev.schedule, { ...scheduleEntry }]
    }))
    setScheduleEntry({ day: 'Monday', startTime: '09:00', endTime: '11:00', topic: '' })
  }

  const removeScheduleSlot = (index) => {
    setForm(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }))
  }

  const saveBatch = async () => {
    if (!form.name || !form.courseId || !form.startDate || !form.endDate) {
      return showMsg('Please fill all required fields!', 'error')
    }
    setSaving(true)
    try {
      const { data } = await API.post('/batches', form)
      setBatches(prev => [data, ...prev])
      showMsg('Batch created successfully!')
      setForm(defaultForm)
      setView('list')
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to create batch', 'error')
    }
    setSaving(false)
  }

  const updateBatchStatus = async (batchId, status) => {
    try {
      const { data } = await API.put(`/batches/${batchId}`, { status })
      setBatches(prev => prev.map(b => b._id === batchId ? { ...b, status } : b))
      if (selectedBatch?._id === batchId) setSelectedBatch({ ...selectedBatch, status })
      showMsg('Status updated!')
    } catch {
      showMsg('Failed to update', 'error')
    }
  }

  const enrollStudent = async (batchId) => {
    if (!enrollStudentId) return showMsg('Select a student first!', 'error')
    try {
      const { data } = await API.post(`/batches/${batchId}/enroll`, { studentId: enrollStudentId })
      setBatches(prev => prev.map(b => b._id === batchId ? data : b))
      setSelectedBatch(data)
      setEnrollStudentId('')
      showMsg('Student enrolled successfully!')
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to enroll', 'error')
    }
  }

  const removeStudent = async (batchId, studentId) => {
    if (!window.confirm('Remove this student from batch?')) return
    try {
      await API.delete(`/batches/${batchId}/students/${studentId}`)
      const updated = { ...selectedBatch, students: selectedBatch.students.filter(s => s._id !== studentId) }
      setSelectedBatch(updated)
      setBatches(prev => prev.map(b => b._id === batchId ? updated : b))
      showMsg('Student removed!')
    } catch {
      showMsg('Failed to remove', 'error')
    }
  }

  const deleteBatch = async (batchId) => {
    if (!window.confirm('Delete this batch permanently?')) return
    try {
      await API.delete(`/batches/${batchId}`)
      setBatches(prev => prev.filter(b => b._id !== batchId))
      setView('list')
      showMsg('Batch deleted!')
    } catch {
      showMsg('Failed to delete', 'error')
    }
  }

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchStudent.toLowerCase())
  )

  const getNextClass = (batch) => {
    if (!batch.schedule || batch.schedule.length === 0) return null
    const today = new Date().getDay()
    const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 }
    const sorted = [...batch.schedule].sort((a, b) => {
      const da = (dayMap[a.day] - today + 7) % 7
      const db = (dayMap[b.day] - today + 7) % 7
      return da - db
    })
    return sorted[0]
  }

  return (
    <div style={{ background: '#07070f', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans',sans-serif" }}>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,71,255,0.08) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,210,255,0.06) 0%,transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: isMobile ? '16px 12px' : '28px 24px' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate('/instructor')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
              ← Back
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#6c47ff,#00d2ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎓</div>
              <div>
                <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: isMobile ? 20 : 26, margin: 0 }}>Batch & Schedule Manager</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: 12 }}>Create batches · Set class schedules · Manage students</p>
              </div>
            </div>
          </div>
          {view === 'list' && (
            <button onClick={() => setView('create')} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '11px 22px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans,sans-serif', boxShadow: '0 0 24px rgba(108,71,255,0.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
              + Create Batch
            </button>
          )}
          {view !== 'list' && (
            <button onClick={() => { setView('list'); setSelectedBatch(null); setForm(defaultForm) }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
              ← All Batches
            </button>
          )}
        </div>

        {/* ── TOAST ── */}
        {msg && (
          <div style={{ background: msgType === 'error' ? 'rgba(255,107,107,0.12)' : 'rgba(0,200,81,0.12)', border: `1px solid ${msgType === 'error' ? 'rgba(255,107,107,0.4)' : 'rgba(0,200,81,0.4)'}`, borderRadius: 12, padding: '13px 18px', marginBottom: 20, fontSize: 14, color: msgType === 'error' ? '#ff6b6b' : '#00c851', display: 'flex', alignItems: 'center', gap: 8, animation: 'fadeUp 0.3s ease both' }}>
            {msgType === 'error' ? '❌' : '✅'} {msg}
          </div>
        )}

        {/* ── STATS ── */}
        {view === 'list' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { icon: '🎓', label: 'Total Batches', value: batches.length, color: '#6c47ff' },
              { icon: '✅', label: 'Active', value: batches.filter(b => b.status === 'active').length, color: '#00c851' },
              { icon: '🕐', label: 'Upcoming', value: batches.filter(b => b.status === 'upcoming').length, color: '#ff9500' },
              { icon: '👥', label: 'Total Students', value: batches.reduce((a, b) => a + (b.students?.length || 0), 0), color: '#00d2ff' },
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
        )}

        {/* ════════════════════════════
            LIST VIEW
        ════════════════════════════ */}
        {view === 'list' && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: 40, marginBottom: 14, display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</div>
                <p>Loading batches...</p>
              </div>
            ) : batches.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '70px 20px', background: '#13131a', border: '2px dashed rgba(108,71,255,0.2)', borderRadius: 20 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🎓</div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, margin: '0 0 10px' }}>No Batches Yet</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, marginBottom: 22 }}>Create your first batch to organize students and set class schedules</p>
                <button onClick={() => setView('create')} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '13px 32px', borderRadius: 13, cursor: 'pointer', fontWeight: 700, fontFamily: 'DM Sans,sans-serif', fontSize: 15, boxShadow: '0 0 30px rgba(108,71,255,0.4)' }}>
                  + Create First Batch
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(340px,1fr))', gap: 18 }}>
                {batches.map((batch, i) => {
                  const nextClass = getNextClass(batch)
                  const sc = statusColors[batch.status] || statusColors.upcoming
                  const pct = Math.round((batch.students?.length / batch.maxStudents) * 100)

                  return (
                    <div key={batch._id} style={{ background: '#13131a', border: `1px solid ${batch.color}30`, borderRadius: 20, overflow: 'hidden', transition: 'all 0.3s', animation: `fadeUp 0.5s ease ${i * 0.07}s both`, cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${batch.color}20` }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                      {/* Color top bar */}
                      <div style={{ height: 4, background: `linear-gradient(90deg,${batch.color},transparent)` }} />

                      <div style={{ padding: '18px 20px' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <div style={{ width: 34, height: 34, borderRadius: 9, background: batch.color + '25', border: `1px solid ${batch.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                                {modeIcons[batch.mode]}
                              </div>
                              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, margin: 0, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {batch.name}
                              </h3>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              📚 {batch.course?.title || 'Course'}
                            </p>
                          </div>
                          <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 700, flexShrink: 0, marginLeft: 8, textTransform: 'capitalize' }}>
                            {batch.status}
                          </span>
                        </div>

                        {/* Schedule preview */}
                        {batch.schedule && batch.schedule.length > 0 && (
                          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
                            <p style={{ margin: '0 0 7px', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>📅 Class Schedule</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {batch.schedule.slice(0, 3).map((s, si) => (
                                <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                  <span style={{ background: batch.color + '20', color: batch.color, padding: '2px 8px', borderRadius: 6, fontWeight: 600, minWidth: 80, textAlign: 'center', fontSize: 11 }}>{s.day.slice(0, 3)}</span>
                                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>{s.startTime} – {s.endTime}</span>
                                  {s.topic && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>· {s.topic}</span>}
                                </div>
                              ))}
                              {batch.schedule.length > 3 && (
                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>+{batch.schedule.length - 3} more slots</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Next class highlight */}
                        {nextClass && batch.status === 'active' && (
                          <div style={{ background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.25)', borderRadius: 10, padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14 }}>⏰</span>
                            <div>
                              <p style={{ margin: 0, fontSize: 11, color: '#a78bff', fontWeight: 700 }}>Next Class</p>
                              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{nextClass.day} · {nextClass.startTime} – {nextClass.endTime}</p>
                            </div>
                          </div>
                        )}

                        {/* Stats row */}
                        <div style={{ display: 'flex', gap: 14, marginBottom: 12, fontSize: 12 }}>
                          <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                            👥 {batch.students?.length || 0}/{batch.maxStudents}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>
                            {modeIcons[batch.mode]} {batch.mode}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                            📅 {new Date(batch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(batch.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        {/* Capacity bar */}
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                            <span>Capacity</span>
                            <span style={{ color: pct >= 90 ? '#ff6b6b' : '#00c851' }}>{pct}% filled</span>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 5, overflow: 'hidden' }}>
                            <div style={{ height: 5, borderRadius: 100, width: `${pct}%`, background: pct >= 90 ? '#ff6b6b' : pct >= 60 ? '#ff9500' : batch.color, transition: 'width 0.6s' }} />
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => { setSelectedBatch(batch); setView('detail') }} style={{ flex: 1, background: batch.color + '20', border: `1px solid ${batch.color}40`, color: batch.color, padding: '9px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = batch.color + '35'}
                            onMouseLeave={e => e.currentTarget.style.background = batch.color + '20'}>
                            View Details
                          </button>
                          <button onClick={() => deleteBatch(batch._id)} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: '#ff6b6b', padding: '9px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════
            CREATE BATCH VIEW
        ════════════════════════════ */}
        {view === 'create' && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: 20, alignItems: 'start' }}>

              {/* Main Form */}
              <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: isMobile ? 18 : 26 }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, margin: '0 0 6px' }}>📝 Create New Batch</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 22 }}>Set up a batch with schedule for your students</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Batch Name */}
                  <div>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, fontWeight: 600 }}>BATCH NAME *</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. React Batch A - Morning"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 11, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>

                  {/* Course */}
                  <div>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, fontWeight: 600 }}>COURSE *</label>
                    <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 11, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: form.courseId ? '#fff' : 'rgba(255,255,255,0.35)', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box', cursor: 'pointer' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}>
                      <option value="">-- Select Course --</option>
                      {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, fontWeight: 600 }}>DESCRIPTION</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Morning batch for working professionals..." rows={2}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 11, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box', resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>

                  {/* Dates */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, fontWeight: 600 }}>START DATE *</label>
                      <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 11, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.6)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, fontWeight: 600 }}>END DATE *</label>
                      <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 11, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.6)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                  </div>

                  {/* Mode + Max students */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, fontWeight: 600 }}>CLASS MODE</label>
                      <select value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 11, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }}>
                        <option value="online">💻 Online</option>
                        <option value="offline">🏫 Offline</option>
                        <option value="hybrid">🔀 Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, fontWeight: 600 }}>MAX STUDENTS</label>
                      <input type="number" value={form.maxStudents} onChange={e => setForm({ ...form, maxStudents: parseInt(e.target.value) })} min="1" max="200"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 11, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  {/* Meeting link or location */}
                  {(form.mode === 'online' || form.mode === 'hybrid') && (
                    <div>
                      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, fontWeight: 600 }}>MEETING LINK (Zoom/Meet)</label>
                      <input type="text" value={form.meetingLink} onChange={e => setForm({ ...form, meetingLink: e.target.value })} placeholder="https://meet.google.com/xxx-xxxx-xxx"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 11, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.6)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                  )}

                  {(form.mode === 'offline' || form.mode === 'hybrid') && (
                    <div>
                      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, fontWeight: 600 }}>LOCATION / CLASSROOM</label>
                      <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Room 201, CyberSquare Calicut"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 11, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.6)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                  )}

                  {/* Batch Color */}
                  <div>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8, fontWeight: 600 }}>BATCH COLOR</label>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {COLORS.map(c => (
                        <button key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #fff' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s', transform: form.color === c ? 'scale(1.2)' : 'scale(1)' }} />
                      ))}
                    </div>
                  </div>

                  <button onClick={saveBatch} disabled={saving} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '14px', borderRadius: 13, cursor: saving ? 'wait' : 'pointer', fontWeight: 800, fontSize: 16, fontFamily: 'DM Sans,sans-serif', boxShadow: '0 0 30px rgba(108,71,255,0.4)', opacity: saving ? 0.7 : 1 }}>
                    {saving ? '⏳ Creating...' : '🚀 Create Batch'}
                  </button>
                </div>
              </div>

              {/* Schedule Builder */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 20 }}>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: 'rgba(0,210,255,0.15)', width: 34, height: 34, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>📅</span>
                    Class Schedule Builder
                  </h3>

                  {/* Add slot form */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: 16, marginBottom: 14 }}>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 12px', fontWeight: 600 }}>ADD TIME SLOT</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Day</label>
                        <select value={scheduleEntry.day} onChange={e => setScheduleEntry({ ...scheduleEntry, day: e.target.value })}
                          style={{ width: '100%', padding: '9px 10px', borderRadius: 9, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }}>
                          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Topic (optional)</label>
                        <input type="text" value={scheduleEntry.topic} onChange={e => setScheduleEntry({ ...scheduleEntry, topic: e.target.value })} placeholder="e.g. React Hooks"
                          style={{ width: '100%', padding: '9px 10px', borderRadius: 9, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Start Time</label>
                        <input type="time" value={scheduleEntry.startTime} onChange={e => setScheduleEntry({ ...scheduleEntry, startTime: e.target.value })}
                          style={{ width: '100%', padding: '9px 10px', borderRadius: 9, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>End Time</label>
                        <input type="time" value={scheduleEntry.endTime} onChange={e => setScheduleEntry({ ...scheduleEntry, endTime: e.target.value })}
                          style={{ width: '100%', padding: '9px 10px', borderRadius: 9, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                    <button onClick={addScheduleSlot} style={{ width: '100%', background: 'rgba(0,210,255,0.12)', border: '1px solid rgba(0,210,255,0.3)', color: '#00d2ff', padding: '10px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,210,255,0.22)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,210,255,0.12)'}>
                      + Add Time Slot
                    </button>
                  </div>

                  {/* Added slots */}
                  {form.schedule.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 16px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                      No schedule slots added yet
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {form.schedule.map((slot, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 11, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ background: form.color + '20', color: form.color, padding: '3px 10px', borderRadius: 7, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{slot.day.slice(0, 3)}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: 13, color: '#fff', fontWeight: 600 }}>{slot.startTime} – {slot.endTime}</p>
                            {slot.topic && <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{slot.topic}</p>}
                          </div>
                          <button onClick={() => removeScheduleSlot(i)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,107,107,0.6)', cursor: 'pointer', fontSize: 16, padding: '2px 6px', borderRadius: 6, transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.background = 'rgba(255,107,107,0.1)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,107,107,0.6)'; e.currentTarget.style.background = 'transparent' }}>
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preview card */}
                {form.name && (
                  <div style={{ background: 'linear-gradient(135deg,rgba(108,71,255,0.1),rgba(0,210,255,0.05))', border: `1px solid ${form.color}30`, borderRadius: 16, padding: 18 }}>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 10px', fontWeight: 600 }}>PREVIEW</p>
                    <div style={{ height: 3, background: `linear-gradient(90deg,${form.color},transparent)`, borderRadius: 100, marginBottom: 12 }} />
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, margin: '0 0 5px', color: '#fff' }}>{form.name}</h3>
                    {form.description && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 10px' }}>{form.description}</p>}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12 }}>
                      {form.startDate && <span style={{ color: 'rgba(255,255,255,0.5)' }}>📅 {form.startDate}</span>}
                      <span style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{modeIcons[form.mode]} {form.mode}</span>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>👥 Max {form.maxStudents}</span>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>📅 {form.schedule.length} slots</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════
            DETAIL VIEW
        ════════════════════════════ */}
        {view === 'detail' && selectedBatch && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>
            {/* Batch header card */}
            <div style={{ background: '#13131a', border: `1px solid ${selectedBatch.color}30`, borderRadius: 20, padding: isMobile ? 18 : 26, marginBottom: 20 }}>
              <div style={{ height: 4, background: `linear-gradient(90deg,${selectedBatch.color},transparent)`, borderRadius: 100, marginBottom: 18 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: selectedBatch.color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {modeIcons[selectedBatch.mode]}
                    </div>
                    <div>
                      <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: isMobile ? 20 : 26, margin: 0 }}>{selectedBatch.name}</h2>
                      <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: 13 }}>📚 {selectedBatch.course?.title}</p>
                    </div>
                  </div>
                  {selectedBatch.description && (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 12px' }}>{selectedBatch.description}</p>
                  )}
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                    <span>📅 {new Date(selectedBatch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span>🏁 {new Date(selectedBatch.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span>👥 {selectedBatch.students?.length}/{selectedBatch.maxStudents} students</span>
                    {selectedBatch.meetingLink && <a href={selectedBatch.meetingLink} target="_blank" rel="noreferrer" style={{ color: '#00d2ff', textDecoration: 'none' }}>🔗 Meeting Link</a>}
                    {selectedBatch.location && <span>📍 {selectedBatch.location}</span>}
                  </div>
                </div>

                {/* Status controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5 }}>BATCH STATUS</label>
                    <select value={selectedBatch.status} onChange={e => updateBatchStatus(selectedBatch._id, e.target.value)}
                      style={{ padding: '9px 14px', borderRadius: 10, background: statusColors[selectedBatch.status]?.bg || 'rgba(255,255,255,0.06)', border: `1px solid ${statusColors[selectedBatch.status]?.border || 'rgba(255,255,255,0.1)'}`, color: statusColors[selectedBatch.status]?.color || '#fff', fontSize: 13, outline: 'none', fontFamily: 'DM Sans,sans-serif', cursor: 'pointer', fontWeight: 600 }}>
                      <option value="upcoming">🕐 Upcoming</option>
                      <option value="active">✅ Active</option>
                      <option value="completed">🎓 Completed</option>
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 13, padding: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { id: 'schedule', icon: '📅', label: 'Schedule' },
                { id: 'students', icon: '👥', label: `Students (${selectedBatch.students?.length || 0})` },
                { id: 'info', icon: 'ℹ️', label: 'Info' }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveDetailTab(tab.id)} style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: isMobile ? 12 : 13, transition: 'all 0.2s', background: activeDetailTab === tab.id ? `linear-gradient(135deg,${selectedBatch.color},${selectedBatch.color}cc)` : 'transparent', color: activeDetailTab === tab.id ? '#fff' : 'rgba(255,255,255,0.45)', boxShadow: activeDetailTab === tab.id ? `0 0 20px ${selectedBatch.color}50` : 'none' }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* SCHEDULE TAB */}
            {activeDetailTab === 'schedule' && (
              <div style={{ animation: 'fadeIn 0.3s ease both' }}>
                <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, margin: 0 }}>📅 Weekly Class Schedule</h3>
                    <span style={{ background: 'rgba(0,210,255,0.12)', color: '#00d2ff', fontSize: 12, padding: '3px 12px', borderRadius: 100, fontWeight: 600 }}>
                      {selectedBatch.schedule?.length || 0} slots/week
                    </span>
                  </div>

                  {!selectedBatch.schedule || selectedBatch.schedule.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)' }}>
                      <div style={{ fontSize: 40, marginBottom: 10 }}>📅</div>
                      <p>No schedule set for this batch</p>
                    </div>
                  ) : (
                    <div>
                      {/* Weekly calendar view */}
                      <div style={{ padding: '16px 20px' }}>
                        {DAYS.map(day => {
                          const daySlots = selectedBatch.schedule.filter(s => s.day === day)
                          if (daySlots.length === 0) return null
                          const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day

                          return (
                            <div key={day} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                              <div style={{ width: 90, flexShrink: 0 }}>
                                <div style={{ background: isToday ? selectedBatch.color : 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '6px 10px', textAlign: 'center', border: isToday ? `1px solid ${selectedBatch.color}` : '1px solid transparent' }}>
                                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: isToday ? '#fff' : 'rgba(255,255,255,0.6)' }}>{day.slice(0, 3).toUpperCase()}</p>
                                  {isToday && <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>Today</p>}
                                </div>
                              </div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {daySlots.map((slot, si) => (
                                  <div key={si} style={{ background: isToday ? selectedBatch.color + '15' : 'rgba(255,255,255,0.03)', border: `1px solid ${isToday ? selectedBatch.color + '40' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 3, height: 36, borderRadius: 100, background: selectedBatch.color, flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#fff' }}>{slot.startTime} – {slot.endTime}</p>
                                      {slot.topic && <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>📖 {slot.topic}</p>}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                      <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                                        {(() => {
                                          const [sh, sm] = slot.startTime.split(':').map(Number)
                                          const [eh, em] = slot.endTime.split(':').map(Number)
                                          const mins = (eh * 60 + em) - (sh * 60 + sm)
                                          return `${Math.floor(mins / 60)}h ${mins % 60}m`
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Meeting info */}
                      {(selectedBatch.meetingLink || selectedBatch.location) && (
                        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
                          {selectedBatch.meetingLink && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: selectedBatch.location ? 10 : 0 }}>
                              <span style={{ fontSize: 18 }}>🔗</span>
                              <div>
                                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Meeting Link</p>
                                <a href={selectedBatch.meetingLink} target="_blank" rel="noreferrer" style={{ color: '#00d2ff', fontSize: 13, wordBreak: 'break-all' }}>
                                  {selectedBatch.meetingLink}
                                </a>
                              </div>
                            </div>
                          )}
                          {selectedBatch.location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 18 }}>📍</span>
                              <div>
                                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Location</p>
                                <p style={{ margin: 0, fontSize: 13, color: '#fff' }}>{selectedBatch.location}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STUDENTS TAB */}
            {activeDetailTab === 'students' && (
              <div style={{ animation: 'fadeIn 0.3s ease both' }}>

                {/* Enroll student */}
                <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 20, marginBottom: 16 }}>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 14px' }}>➕ Enroll Student</h3>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <input type="text" placeholder="🔍 Search student by name or email..." value={searchStudent} onChange={e => setSearchStudent(e.target.value)}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.6)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                      {searchStudent && (
                        <div style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, marginTop: 4, maxHeight: 200, overflowY: 'auto' }}>
                          {filteredStudents.filter(s => !selectedBatch.students?.some(bs => bs._id === s._id)).slice(0, 8).map(s => (
                            <div key={s._id} onClick={() => { setEnrollStudentId(s._id); setSearchStudent(s.name) }} style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,71,255,0.1)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                                {s.name?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontSize: 13, color: '#fff', fontWeight: 500 }}>{s.name}</p>
                                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.email}</p>
                              </div>
                            </div>
                          ))}
                          {filteredStudents.filter(s => !selectedBatch.students?.some(bs => bs._id === s._id)).length === 0 && (
                            <p style={{ padding: '12px 14px', color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: 0 }}>No students found</p>
                          )}
                        </div>
                      )}
                    </div>
                    <button onClick={() => enrollStudent(selectedBatch._id)} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '11px 22px', borderRadius: 11, cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans,sans-serif', boxShadow: '0 0 20px rgba(108,71,255,0.35)', whiteSpace: 'nowrap' }}>
                      + Enroll
                    </button>
                  </div>

                  {/* Capacity info */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>
                      <span>Batch Capacity</span>
                      <span style={{ color: selectedBatch.students?.length >= selectedBatch.maxStudents ? '#ff6b6b' : '#00c851' }}>
                        {selectedBatch.students?.length}/{selectedBatch.maxStudents} seats filled
                      </span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 6 }}>
                      <div style={{ height: 6, borderRadius: 100, width: `${Math.round((selectedBatch.students?.length / selectedBatch.maxStudents) * 100)}%`, background: selectedBatch.students?.length >= selectedBatch.maxStudents ? '#ff6b6b' : selectedBatch.color, transition: 'width 0.6s' }} />
                    </div>
                  </div>
                </div>

                {/* Student list */}
                <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: 0 }}>
                      Enrolled Students
                      <span style={{ marginLeft: 8, background: 'rgba(108,71,255,0.2)', color: '#a78bff', fontSize: 12, padding: '2px 10px', borderRadius: 100 }}>
                        {selectedBatch.students?.length || 0}
                      </span>
                    </h3>
                  </div>

                  {!selectedBatch.students || selectedBatch.students.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)' }}>
                      <div style={{ fontSize: 40, marginBottom: 10 }}>👥</div>
                      <p>No students enrolled yet</p>
                    </div>
                  ) : (
                    selectedBatch.students.map((s, i) => (
                      <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: i < selectedBatch.students.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                          {s.name?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#fff' }}>{s.name}</p>
                          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</p>
                        </div>
                        <button onClick={() => removeStudent(selectedBatch._id, s._id)} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: '#ff6b6b', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans,sans-serif', flexShrink: 0 }}>
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* INFO TAB */}
            {activeDetailTab === 'info' && (
              <div style={{ animation: 'fadeIn 0.3s ease both' }}>
                <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 22 }}>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, margin: '0 0 18px' }}>ℹ️ Batch Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                    {[
                      { label: 'Batch Name', value: selectedBatch.name, icon: '🎓' },
                      { label: 'Course', value: selectedBatch.course?.title, icon: '📚' },
                      { label: 'Start Date', value: new Date(selectedBatch.startDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), icon: '📅' },
                      { label: 'End Date', value: new Date(selectedBatch.endDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), icon: '🏁' },
                      { label: 'Mode', value: `${modeIcons[selectedBatch.mode]} ${selectedBatch.mode.charAt(0).toUpperCase() + selectedBatch.mode.slice(1)}`, icon: '' },
                      { label: 'Status', value: selectedBatch.status.charAt(0).toUpperCase() + selectedBatch.status.slice(1), icon: '' },
                      { label: 'Max Students', value: selectedBatch.maxStudents, icon: '👥' },
                      { label: 'Enrolled', value: selectedBatch.students?.length || 0, icon: '✅' },
                      { label: 'Schedule Slots', value: `${selectedBatch.schedule?.length || 0} per week`, icon: '🗓️' },
                      { label: 'Created', value: new Date(selectedBatch.createdAt).toLocaleDateString('en-IN'), icon: '📝' },
                    ].map((item, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.icon} {item.label}</p>
                        <p style={{ margin: 0, fontSize: 14, color: '#fff', fontWeight: 600 }}>{item.value || '—'}</p>
                      </div>
                    ))}
                  </div>

                  {selectedBatch.meetingLink && (
                    <div style={{ marginTop: 14, background: 'rgba(0,210,255,0.06)', border: '1px solid rgba(0,210,255,0.2)', borderRadius: 12, padding: '12px 16px' }}>
                      <p style={{ margin: 0, fontSize: 11, color: '#00d2ff', fontWeight: 600, marginBottom: 5 }}>🔗 MEETING LINK</p>
                      <a href={selectedBatch.meetingLink} target="_blank" rel="noreferrer" style={{ color: '#00d2ff', fontSize: 14, wordBreak: 'break-all' }}>
                        {selectedBatch.meetingLink}
                      </a>
                    </div>
                  )}

                  {selectedBatch.location && (
                    <div style={{ marginTop: 10, background: 'rgba(255,149,0,0.06)', border: '1px solid rgba(255,149,0,0.2)', borderRadius: 12, padding: '12px 16px' }}>
                      <p style={{ margin: 0, fontSize: 11, color: '#ff9500', fontWeight: 600, marginBottom: 5 }}>📍 LOCATION</p>
                      <p style={{ margin: 0, fontSize: 14, color: '#fff' }}>{selectedBatch.location}</p>
                    </div>
                  )}

                  {selectedBatch.description && (
                    <div style={{ marginTop: 10, background: 'rgba(108,71,255,0.06)', border: '1px solid rgba(108,71,255,0.2)', borderRadius: 12, padding: '12px 16px' }}>
                      <p style={{ margin: 0, fontSize: 11, color: '#a78bff', fontWeight: 600, marginBottom: 5 }}>📋 DESCRIPTION</p>
                      <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{selectedBatch.description}</p>
                    </div>
                  )}
                </div>
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
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
        select option { background: #1a1a24; color: #fff; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #07070f; }
        ::-webkit-scrollbar-thumb { background: #6c47ff; border-radius: 10px; }
        @media (max-width: 768px) { * { -webkit-tap-highlight-color: transparent; } }
      `}</style>
    </div>
  )
}

export default BatchPage