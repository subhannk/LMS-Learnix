import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

const tabs = ['Dashboard', 'Course Builder', 'Q&A Inbox', 'Analytics', 'Earnings']

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

const StatCard = ({ icon, label, value, sub, color, delay }) => (
  <div style={{
    background: 'var(--card-bg)', border: `1px solid ${color}25`,
    borderRadius: 20, padding: '24px 28px',
    animation: `fadeUp 0.6s ease ${delay}s both`,
    position: 'relative', overflow: 'hidden', transition: 'all 0.3s'
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color + '60'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${color}15` }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = color + '25'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
  >
    <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: color + '10' }} />
    <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 32, color: 'var(--text-primary)', marginBottom: 4 }}>{value}</div>
    <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>{label}</div>
    {sub && <div style={{ color, fontSize: 12, fontWeight: 600 }}>{sub}</div>}
  </div>
)

const InstructorPanel = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', description: '', category: '', price: 0, level: 'beginner' })
  const [message, setMessage] = useState('')
  const [answers, setAnswers] = useState({})
  const [mounted, setMounted] = useState(false)

  // 🔒 Only instructors can access
  if (user?.role !== 'instructor') return <Navigate to="/dashboard" replace />

  useEffect(() => {
    setMounted(true)
  API.get('/courses/instructor/my-courses')
      .then(({ data }) => { setCourses(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

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

  return (
    <div style={{ background: 'var(--bg-color)', minHeight: '100vh', color: 'var(--text-primary)', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.3s ease' }}>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '5%', left: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,71,255,0.07) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,107,107,0.05) 0%,transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, flexWrap: 'wrap', gap: 16, animation: 'fadeUp 0.5s ease both' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👨‍🏫</div>
              <div>
                <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 28, margin: 0, letterSpacing: '-0.5px' }}>
                  Instructor Studio
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>Welcome back, {user?.name}</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ background: 'rgba(0,200,81,0.1)', border: '1px solid rgba(0,200,81,0.3)', borderRadius: 12, padding: '8px 16px', fontSize: 13 }}>
              <span style={{ color: '#00c851' }}>● </span>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Live</span>
            </div>
            <div style={{ background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.3)', borderRadius: 12, padding: '8px 16px', fontSize: 13, color: '#a78bff', fontWeight: 600, textTransform: 'capitalize' }}>
              {user?.role}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 4, border: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', animation: 'fadeUp 0.5s ease 0.1s both' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 14,
              transition: 'all 0.2s',
              background: activeTab === tab ? 'linear-gradient(135deg,#6c47ff,#9c47ff)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
              boxShadow: activeTab === tab ? '0 0 20px rgba(108,71,255,0.4)' : 'none'
            }}>
              {tab === 'Dashboard' && '📊 '}
              {tab === 'Course Builder' && '🎬 '}
              {tab === 'Q&A Inbox' && '💬 '}
              {tab === 'Analytics' && '📈 '}
              {tab === 'Earnings' && '💰 '}
              {tab}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════ */}
        {/* TAB: DASHBOARD */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === 'Dashboard' && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 32 }}>
              <StatCard icon="📚" label="Total Courses" value={courses.length} sub="Your published courses" color="#6c47ff" delay={0.1} />
              <StatCard icon="👥" label="Total Students" value={totalStudents.toLocaleString()} sub="+12% this month" color="#00d2ff" delay={0.2} />
              <StatCard icon="⭐" label="Avg Rating" value="4.8" sub="Based on 1,240 reviews" color="#ff9500" delay={0.3} />
              <StatCard icon="💰" label="Total Earnings" value={`₹${totalEarnings.toLocaleString()}`} sub="This year" color="#00c851" delay={0.4} />
            </div>

            {/* My Courses */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, margin: 0 }}>My Courses</h2>
                <button onClick={() => setActiveTab('Course Builder')} style={{
                  background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none',
                  color: '#fff', padding: '8px 20px', borderRadius: 10, cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans,sans-serif'
                }}>
                  + New Course
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
              ) : courses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, background: '#13131a', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>No courses yet. Create your first one!</p>
                  <button onClick={() => setActiveTab('Course Builder')} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontFamily: 'DM Sans,sans-serif' }}>
                    Create Course
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                  {courses.map((c, i) => (
                    <div key={c._id} style={{
                      background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                      borderRadius: 18, padding: 20, transition: 'all 0.3s',
                      animation: `fadeUp 0.5s ease ${i * 0.1}s both`
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,71,255,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: 0, flex: 1, marginRight: 12 }}>{c.title}</h3>
                        <span style={{
                          fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 700, flexShrink: 0,
                          background: c.isApproved ? 'rgba(0,200,81,0.12)' : 'rgba(255,149,0,0.12)',
                          color: c.isApproved ? '#00c851' : '#ff9500',
                          border: `1px solid ${c.isApproved ? 'rgba(0,200,81,0.3)' : 'rgba(255,149,0,0.3)'}`
                        }}>
                          {c.isApproved ? '✓ Approved' : '⏳ Pending'}
                        </span>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 12, textTransform: 'capitalize' }}>
                        {c.category} · {c.level}
                      </p>
                      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                        <span>👥 {c.totalStudents || 0} students</span>
                        <span>⭐ {c.averageRating || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Q&A */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, margin: 0 }}>Recent Questions</h2>
                <button onClick={() => setActiveTab('Q&A Inbox')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
                  View All
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mockQA.slice(0, 3).map(q => (
                  <div key={q.id} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                      {q.student[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.question}</p>
                      <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{q.student} · {q.course} · {q.time}</p>
                    </div>
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 100, flexShrink: 0,
                      background: q.answered ? 'rgba(0,200,81,0.1)' : 'rgba(255,107,107,0.1)',
                      color: q.answered ? '#00c851' : '#ff6b6b',
                      border: `1px solid ${q.answered ? 'rgba(0,200,81,0.2)' : 'rgba(255,107,107,0.2)'}`
                    }}>
                      {q.answered ? 'Answered' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TAB: COURSE BUILDER */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === 'Course Builder' && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

              {/* Form */}
              <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 32 }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 8, margin: '0 0 8px' }}>Create New Course</h2>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 28 }}>Fill in the details below to publish your course</p>

                {message && (
                  <div style={{
                    background: message.includes('✅') ? 'rgba(0,200,81,0.1)' : 'rgba(255,107,107,0.1)',
                    border: `1px solid ${message.includes('✅') ? 'rgba(0,200,81,0.3)' : 'rgba(255,107,107,0.3)'}`,
                    borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 14,
                    color: message.includes('✅') ? '#00c851' : '#ff6b6b'
                  }}>
                    {message}
                  </div>
                )}

                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Course Title', key: 'title', placeholder: 'e.g. Complete React JS Bootcamp', type: 'text' },
                    { label: 'Category', key: 'category', placeholder: 'e.g. Web Development', type: 'text' },
                    { label: 'Price (₹)', key: 'price', placeholder: '0 for free', type: 'number' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.key]}
                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        required={field.key !== 'price'}
                        style={{
                          width: '100%', padding: '12px 16px', borderRadius: 12,
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff', fontSize: 14, outline: 'none', transition: 'border 0.2s',
                          fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box'
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.6)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                      />
                    </div>
                  ))}

                  <div>
                    <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Description</label>
                    <textarea
                      placeholder="Describe what students will learn..."
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={4} required
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical',
                        fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box', transition: 'border 0.2s'
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Difficulty Level</label>
                    <select
                      value={form.level}
                      onChange={e => setForm({ ...form, level: e.target.value })}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 12,
                        background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fff', fontSize: 14, outline: 'none',
                        fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box'
                      }}
                    >
                      <option value="beginner">🟢 Beginner</option>
                      <option value="intermediate">🟡 Intermediate</option>
                      <option value="advanced">🔴 Advanced</option>
                    </select>
                  </div>

                  {/* Upload section */}
                  <div style={{ border: '2px dashed rgba(108,71,255,0.3)', borderRadius: 16, padding: 24, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,71,255,0.7)'; e.currentTarget.style.background = 'rgba(108,71,255,0.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(108,71,255,0.3)'; e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🎬</div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0 }}>Drag & drop video files here</p>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, margin: '4px 0 12px' }}>MP4, MOV up to 2GB</p>
                    <button type="button" style={{
                      background: 'rgba(108,71,255,0.2)', border: '1px solid rgba(108,71,255,0.4)',
                      color: '#a78bff', padding: '8px 20px', borderRadius: 10,
                      cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans,sans-serif'
                    }}>
                      Browse Files
                    </button>
                  </div>

                  <button type="submit" style={{
                    background: 'linear-gradient(135deg,#6c47ff,#9c47ff)',
                    border: 'none', color: '#fff', padding: '14px',
                    borderRadius: 14, cursor: 'pointer', fontWeight: 700,
                    fontSize: 16, fontFamily: 'DM Sans,sans-serif',
                    boxShadow: '0 0 30px rgba(108,71,255,0.4)', transition: 'all 0.2s'
                  }}
                    onMouseEnter={e => e.target.style.opacity = '0.85'}
                    onMouseLeave={e => e.target.style.opacity = '1'}
                  >
                    🚀 Publish Course
                  </button>
                </form>
              </div>

              {/* Tips + Quiz builder */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Tips */}
                <div style={{ background: 'linear-gradient(135deg,rgba(108,71,255,0.1),rgba(255,107,107,0.05))', border: '1px solid rgba(108,71,255,0.2)', borderRadius: 20, padding: 24 }}>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 16, margin: '0 0 16px' }}>📋 Course Checklist</h3>
                  {[
                    { done: true, text: 'Add course title and description' },
                    { done: true, text: 'Set difficulty level and category' },
                    { done: false, text: 'Upload at least 5 video lessons' },
                    { done: false, text: 'Add a course thumbnail' },
                    { done: false, text: 'Create at least 1 quiz' },
                    { done: false, text: 'Submit for admin approval' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        background: item.done ? '#00c851' : 'rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11
                      }}>
                        {item.done ? '✓' : ''}
                      </div>
                      <span style={{ fontSize: 14, color: item.done ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)', textDecoration: item.done ? 'line-through' : 'none' }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Quiz Builder */}
                <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>🧠 Quiz Builder</h3>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 16 }}>Add quiz questions to test student knowledge</p>
                  {[
                    { q: 'What is JSX in React?', options: 4, points: 10 },
                    { q: 'Explain the virtual DOM', options: 4, points: 15 },
                    { q: 'What are React Hooks?', options: 4, points: 10 },
                  ].map((quiz, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 16px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, color: '#fff' }}>{quiz.q}</p>
                        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{quiz.options} options · {quiz.points} pts</p>
                      </div>
                      <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', padding: '4px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans,sans-serif' }}>Edit</button>
                    </div>
                  ))}
                  <button style={{
                    width: '100%', background: 'rgba(108,71,255,0.1)', border: '1px dashed rgba(108,71,255,0.4)',
                    color: '#a78bff', padding: '10px', borderRadius: 12, cursor: 'pointer',
                    fontSize: 14, fontFamily: 'DM Sans,sans-serif', marginTop: 4
                  }}>
                    + Add Question
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TAB: Q&A INBOX */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === 'Q&A Inbox' && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, margin: 0 }}>Student Q&A Inbox</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '6px 14px', borderRadius: 100, fontSize: 13 }}>
                  {mockQA.filter(q => !q.answered).length} unanswered
                </span>
                <span style={{ background: 'rgba(0,200,81,0.1)', border: '1px solid rgba(0,200,81,0.3)', color: '#00c851', padding: '6px 14px', borderRadius: 100, fontSize: 13 }}>
                  {mockQA.filter(q => q.answered).length} answered
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {mockQA.map((q, i) => (
                <div key={q.id} style={{
                  background: '#13131a', border: `1px solid ${q.answered ? 'rgba(0,200,81,0.15)' : 'rgba(255,107,107,0.15)'}`,
                  borderRadius: 18, padding: 24,
                  animation: `fadeUp 0.5s ease ${i * 0.08}s both`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
                        {q.student[0]}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{q.student}</p>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{q.course} · {q.time}</p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 12, padding: '4px 12px', borderRadius: 100,
                      background: q.answered ? 'rgba(0,200,81,0.1)' : 'rgba(255,107,107,0.1)',
                      color: q.answered ? '#00c851' : '#ff6b6b',
                      border: `1px solid ${q.answered ? 'rgba(0,200,81,0.2)' : 'rgba(255,107,107,0.2)'}`
                    }}>
                      {q.answered ? '✓ Answered' : '⏳ Pending'}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
                    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>"{q.question}"</p>
                  </div>

                  {!q.answered && (
                    <div>
                      <textarea
                        placeholder="Type your answer here..."
                        value={answers[q.id] || ''}
                        onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                        rows={3}
                        style={{
                          width: '100%', padding: '12px 16px', borderRadius: 12,
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical',
                          fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box', marginBottom: 10,
                          transition: 'border 0.2s'
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                      />
                      <button style={{
                        background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none',
                        color: '#fff', padding: '10px 24px', borderRadius: 10,
                        cursor: 'pointer', fontWeight: 600, fontSize: 14,
                        fontFamily: 'DM Sans,sans-serif'
                      }}>
                        Send Answer →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TAB: ANALYTICS */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === 'Analytics' && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 24, margin: '0 0 24px' }}>Course Analytics</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Avg Watch Time', value: '18 min', icon: '⏱', color: '#6c47ff' },
                { label: 'Completion Rate', value: '68%', icon: '✅', color: '#00c851' },
                { label: 'Drop-off Rate', value: '32%', icon: '📉', color: '#ff6b6b' },
                { label: 'Total Watch Hours', value: '4,820', icon: '📺', color: '#ff9500' },
              ].map((s, i) => (
                <StatCard key={i} icon={s.icon} label={s.label} value={s.value} color={s.color} delay={i * 0.1} />
              ))}
            </div>

            {/* Enrollment Chart */}
            <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28, marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, margin: '0 0 24px' }}>Monthly Enrollment</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
                {[
                  { month: 'Oct', value: 65 },
                  { month: 'Nov', value: 82 },
                  { month: 'Dec', value: 71 },
                  { month: 'Jan', value: 90 },
                  { month: 'Feb', value: 78 },
                  { month: 'Mar', value: 100 },
                ].map((d, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{d.value}</span>
                    <div style={{
                      width: '100%', borderRadius: '6px 6px 0 0',
                      height: `${d.value}%`,
                      background: i === 5 ? 'linear-gradient(to top,#6c47ff,#9c47ff)' : 'rgba(108,71,255,0.3)',
                      transition: 'all 0.3s', cursor: 'pointer'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(to top,#6c47ff,#9c47ff)'}
                      onMouseLeave={e => { if (i !== 5) e.currentTarget.style.background = 'rgba(108,71,255,0.3)' }}
                    />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Drop-off table */}
            <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, margin: '0 0 20px' }}>Student Drop-off by Lesson</h3>
              {[
                { lesson: 'Introduction', watch: 98, drop: 2 },
                { lesson: 'Core Concepts', watch: 87, drop: 11 },
                { lesson: 'Advanced Topics', watch: 71, drop: 16 },
                { lesson: 'Project Build', watch: 65, drop: 6 },
                { lesson: 'Final Quiz', watch: 58, drop: 7 },
              ].map((row, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{row.lesson}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{row.watch}% watched</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 6 }}>
                    <div style={{ height: 6, borderRadius: 100, width: `${row.watch}%`, background: row.watch > 80 ? '#00c851' : row.watch > 60 ? '#ff9500' : '#ff6b6b', transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TAB: EARNINGS */}
        {/* ══════════════════════════════════════════ */}
        {activeTab === 'Earnings' && (
          <div style={{ animation: 'fadeIn 0.4s ease both' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, margin: '0 0 24px' }}>Financial Overview</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 32 }}>
              <StatCard icon="💰" label="Total Earnings" value={`₹${totalEarnings.toLocaleString()}`} sub="All time" color="#00c851" delay={0.1} />
              <StatCard icon="📅" label="This Month" value="₹28,400" sub="+46% vs last month" color="#6c47ff" delay={0.2} />
              <StatCard icon="⏳" label="Pending Payout" value="₹12,200" sub="Processing in 3 days" color="#ff9500" delay={0.3} />
              <StatCard icon="🏦" label="Total Paid Out" value={`₹${(totalEarnings - 12200).toLocaleString()}`} sub="To your bank account" color="#00d2ff" delay={0.4} />
            </div>

            {/* Earnings Chart */}
            <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28, marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, margin: '0 0 24px' }}>Monthly Earnings (₹)</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180 }}>
                {mockEarnings.map((e, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>₹{(e.amount / 1000).toFixed(0)}k</span>
                    <div style={{
                      width: '100%', borderRadius: '6px 6px 0 0',
                      height: `${(e.amount / maxEarning) * 100}%`,
                      background: i === mockEarnings.length - 1 ? 'linear-gradient(to top,#00c851,#00d2ff)' : 'rgba(0,200,81,0.25)',
                      transition: 'all 0.3s', cursor: 'pointer'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(to top,#00c851,#00d2ff)'}
                      onMouseLeave={(e) => { if (i !== mockEarnings.length - 1) e.currentTarget.style.background = 'rgba(0,200,81,0.25)' }}
                    />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{e.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payout History */}
            <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, margin: '0 0 20px' }}>Payout History</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Date', 'Amount', 'Method', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.35)', fontWeight: 500, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: 'Mar 01, 2026', amount: '₹16,200', method: 'Bank Transfer', status: 'Paid' },
                      { date: 'Feb 01, 2026', amount: '₹19,500', method: 'Bank Transfer', status: 'Paid' },
                      { date: 'Jan 01, 2026', amount: '₹22,800', method: 'Bank Transfer', status: 'Paid' },
                      { date: 'Dec 01, 2025', amount: '₹15,200', method: 'Bank Transfer', status: 'Paid' },
                      { date: 'Mar 26, 2026', amount: '₹12,200', method: 'Bank Transfer', status: 'Pending' },
                    ].map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.6)' }}>{row.date}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#fff' }}>{row.amount}</td>
                        <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.4)' }}>{row.method}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            fontSize: 12, padding: '3px 12px', borderRadius: 100,
                            background: row.status === 'Paid' ? 'rgba(0,200,81,0.1)' : 'rgba(255,149,0,0.1)',
                            color: row.status === 'Paid' ? '#00c851' : '#ff9500',
                            border: `1px solid ${row.status === 'Paid' ? 'rgba(0,200,81,0.2)' : 'rgba(255,149,0,0.2)'}`
                          }}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
        select option { background: #1a1a24; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: var(--bg-color); }
        ::-webkit-scrollbar-thumb { background: #6c47ff; border-radius: 10px; }
      `}</style>
    </div>
  )
}

export default InstructorPanel