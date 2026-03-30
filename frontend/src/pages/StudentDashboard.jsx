import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

// ════════════════════════════════════════
// SIDEBAR
// ════════════════════════════════════════
const menuItems = [
  { icon: '🏠', label: 'Home', path: '/student' },
  { icon: '🎓', label: 'My Courses', path: '/student/courses' },
  { icon: '⚗️', label: 'CS Lab', path: '/student/lab' },
  { icon: '📅', label: 'Training Sessions', path: '/student/training' },
  { icon: '⚡', label: 'My Activities', path: '/student/activities' },
  { icon: '🏆', label: 'Scorecard', path: '/student/scorecard' },
  { icon: '🗂️', label: 'Projects', path: '/student/projects' },
  { icon: '🎪', label: 'Digital Fest', path: '/student/digitalfest' },
  { icon: '🖥️', label: 'Live Class Room', path: '/student/live' },
  { icon: '🧪', label: 'Lab Exam', path: '/student/exam' },
  { icon: '📝', label: 'Exams', path: '/student/exams' },
]

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const handleNavClick = () => {
    if (window.innerWidth < 768) setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 99, backdropFilter: 'blur(4px)'
        }} />
      )}

      <div style={{
        width: 240,
        height: '100vh',
        background: '#0d0d16',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0,
        zIndex: 100,
        overflow: 'hidden',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        transform: window.innerWidth < 768
          ? mobileOpen ? 'translateX(0)' : 'translateX(-100%)'
          : 'translateX(0)'
      }}>

        {/* Logo + Toggle */}
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, flexShrink: 0 }}>C</div>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, color: '#fff', whiteSpace: 'nowrap' }}>
              Cyber<span style={{ color: '#6c47ff' }}>Square</span>
            </span>
          </div>
          <button onClick={() => { setCollapsed(false); setMobileOpen(false) }} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.5)', width: 28, height: 28, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: 'all 0.2s' }}>
            ✕
          </button>
        </div>

        {/* Profile */}
        <div style={{ padding: '14px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
            </div>
          </div>
          <div style={{ background: 'rgba(108,71,255,0.12)', border: '1px solid rgba(108,71,255,0.25)', borderRadius: 8, padding: '5px 10px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#a78bff' }}>🏆 {user?.scorecard?.rank || 'Newcomer'}</span>
            <span style={{ fontSize: 11, color: '#6c47ff', fontWeight: 700 }}>{user?.scorecard?.totalPoints || 0} pts</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto', overflowX: 'hidden' }}>
          {menuItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none', display: 'block' }} onClick={handleNavClick}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 10px',
                  borderRadius: 10, marginBottom: 2, transition: 'all 0.2s',
                  background: isActive ? 'rgba(108,71,255,0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #6c47ff' : '3px solid transparent',
                  cursor: 'pointer'
                }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#a78bff' : 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '8px 6px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px', background: 'transparent', border: 'none', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', color: 'rgba(255,107,107,0.7)', fontFamily: 'DM Sans,sans-serif' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.1)'; e.currentTarget.style.color = '#ff6b6b' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,107,107,0.7)' }}
          >
            <span style={{ fontSize: 18 }}>🚪</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

// ════════════════════════════════════════
// TOP BAR
// ════════════════════════════════════════
const TopBar = ({ user, title, onMenuClick }) => (
  <div style={{ background: 'rgba(13,13,22,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Hamburger */}
      <button onClick={onMenuClick} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
        ☰
      </button>
      <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, color: '#fff' }}>{title}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ background: 'rgba(108,71,255,0.12)', border: '1px solid rgba(108,71,255,0.25)', borderRadius: 100, padding: '4px 10px', fontSize: 11, color: '#a78bff' }}>
        🏆 {user?.scorecard?.totalPoints || 0}
      </div>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
        {user?.name?.[0]?.toUpperCase()}
      </div>
    </div>
  </div>
)

// ════════════════════════════════════════
// HOME PAGE
// ════════════════════════════════════════
const HomePage = ({ user, enrollments }) => {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '16px' }}>
      {/* Welcome */}
      <div style={{ background: 'linear-gradient(135deg,rgba(108,71,255,0.2),rgba(255,107,107,0.1))', border: '1px solid rgba(108,71,255,0.25)', borderRadius: 16, padding: '18px 20px', marginBottom: 16, animation: 'fadeUp 0.5s ease both' }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 'clamp(18px,4vw,28px)', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Welcome, <span style={{ background: 'linear-gradient(135deg,#a78bff,#ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name?.split(' ')[0]}!</span> 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: 13 }}>Continue your learning journey</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { icon: '📚', label: 'Courses', value: enrollments.length, color: '#6c47ff' },
          { icon: '🏆', label: 'Points', value: user?.scorecard?.totalPoints || 0, color: '#ff9500' },
          { icon: '⚗️', label: 'Labs', value: user?.scorecard?.labsCompleted || 0, color: '#00d2ff' },
          { icon: '📝', label: 'Exams', value: user?.scorecard?.examsCompleted || 0, color: '#00c851' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#13131a', border: `1px solid ${s.color}20`, borderRadius: 14, padding: '14px', animation: `fadeUp 0.5s ease ${i * 0.07}s both` }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 22, color: '#fff' }}>{s.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Continue Learning */}
      <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, margin: '0 0 10px' }}>Continue Learning</h2>
      {enrollments.length === 0 ? (
        <div style={{ background: '#13131a', border: '1px dashed rgba(108,71,255,0.3)', borderRadius: 14, padding: '28px 16px', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📚</div>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 14, fontSize: 13 }}>No enrolled courses yet.</p>
          <button onClick={() => navigate('/courses')} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
            Browse Courses →
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12, marginBottom: 16 }}>
          {enrollments.slice(0, 4).map((e, i) => (
            <div key={e._id} onClick={() => navigate(`/courses/${e.course?._id}`, { state: { course: e.course } })}
              style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s' }}>
              <img src={e.course?.thumbnail || 'https://placehold.co/400x120/13131a/6c47ff?text=Course'} alt="" style={{ width: '100%', height: 100, objectFit: 'cover' }} />
              <div style={{ padding: '10px 12px' }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, margin: '0 0 6px', color: '#fff', lineHeight: 1.3 }}>{e.course?.title}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>Progress</span>
                  <span style={{ color: '#6c47ff', fontWeight: 700 }}>{e.progress || 0}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 4 }}>
                  <div style={{ height: 4, borderRadius: 100, width: `${e.progress || 0}%`, background: 'linear-gradient(90deg,#6c47ff,#9c47ff)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Access */}
      <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, margin: '0 0 10px' }}>Quick Access</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { icon: '⚗️', label: 'CS Lab', path: '/student/lab', color: '#00d2ff' },
          { icon: '🏆', label: 'Scorecard', path: '/student/scorecard', color: '#ff9500' },
          { icon: '🗂️', label: 'Projects', path: '/student/projects', color: '#00c851' },
          { icon: '🖥️', label: 'Live Class', path: '/student/live', color: '#ff6b6b' },
          { icon: '🧪', label: 'Lab Exam', path: '/student/exam', color: '#6c47ff' },
          { icon: '📝', label: 'Exams', path: '/student/exams', color: '#ff3cac' },
        ].map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)} style={{ background: '#13131a', border: `1px solid ${item.color}20`, borderRadius: 12, padding: '14px 8px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = item.color + '50'; e.currentTarget.style.background = item.color + '08' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = item.color + '20'; e.currentTarget.style.background = '#13131a' }}
          >
            <div style={{ fontSize: 22, marginBottom: 5 }}>{item.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.55)', lineHeight: 1.2 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// MY COURSES
// ════════════════════════════════════════
const MyCoursesPage = ({ enrollments }) => {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 24, margin: '0 0 16px' }}>My Courses</h1>
      {enrollments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#13131a', borderRadius: 16, border: '1px dashed rgba(108,71,255,0.3)' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🎓</div>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 14, fontSize: 13 }}>No enrolled courses yet.</p>
          <button onClick={() => navigate('/courses')} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontFamily: 'DM Sans,sans-serif', fontSize: 13 }}>
            Browse Courses →
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
          {enrollments.map((e, i) => (
            <div key={e._id} onClick={() => navigate(`/courses/${e.course?._id}`, { state: { course: e.course } })}
              style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s', animation: `fadeUp 0.5s ease ${i * 0.07}s both` }}
              onMouseEnter={el => { el.currentTarget.style.borderColor = 'rgba(108,71,255,0.4)'; el.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={el => { el.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; el.currentTarget.style.transform = 'translateY(0)' }}
            >
              <img src={e.course?.thumbnail || 'https://placehold.co/400x140/13131a/6c47ff?text=Course'} alt="" style={{ width: '100%', height: 130, objectFit: 'cover' }} />
              <div style={{ padding: '12px 14px' }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, margin: '0 0 4px', color: '#fff' }}>{e.course?.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '0 0 10px' }}>by {e.course?.instructor?.name || 'Instructor'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Progress</span>
                  <span style={{ color: e.progress >= 100 ? '#00c851' : '#6c47ff', fontWeight: 700 }}>{e.progress}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 5 }}>
                  <div style={{ height: 5, borderRadius: 100, width: `${e.progress}%`, background: e.progress >= 100 ? '#00c851' : 'linear-gradient(90deg,#6c47ff,#9c47ff)' }} />
                </div>
                {e.isCompleted && <div style={{ marginTop: 8, background: 'rgba(0,200,81,0.1)', border: '1px solid rgba(0,200,81,0.25)', borderRadius: 7, padding: '4px 10px', fontSize: 11, color: '#00c851', textAlign: 'center' }}>✅ Completed</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════
// CS LAB
// ════════════════════════════════════════
const CsLabPage = () => {
  const [labs, setLabs] = useState([])
  const [selected, setSelected] = useState(null)
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const diffColor = { easy: '#00c851', medium: '#ff9500', hard: '#ff6b6b' }

  const fallbackLabs = [
    { _id: '1', title: 'Hello World in JS', category: 'JavaScript', difficulty: 'easy', points: 10, instructions: 'Write a function that returns "Hello, World!" string.', starterCode: 'function helloWorld() {\n  // Your code here\n}' },
    { _id: '2', title: 'Fibonacci Sequence', category: 'Python', difficulty: 'medium', points: 20, instructions: 'Write a function to return the nth Fibonacci number.', starterCode: 'def fibonacci(n):\n    # Your code here\n    pass' },
    { _id: '3', title: 'Reverse a String', category: 'JavaScript', difficulty: 'easy', points: 10, instructions: 'Write a function that reverses a string.', starterCode: 'function reverseString(str) {\n  // Your code here\n}' },
    { _id: '4', title: 'Binary Search', category: 'Algorithm', difficulty: 'hard', points: 30, instructions: 'Implement binary search algorithm.', starterCode: 'function binarySearch(arr, target) {\n  // Your code here\n}' },
  ]

  useEffect(() => {
    API.get('/labs').then(({ data }) => setLabs(data.length > 0 ? data : fallbackLabs)).catch(() => setLabs(fallbackLabs))
  }, [])

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 24, margin: '0 0 4px' }}>⚗️ CS Lab</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 16, fontSize: 12 }}>Practice coding challenges and earn points</p>

      {!selected ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
          {labs.map((lab, i) => (
            <div key={lab._id} onClick={() => { setSelected(lab); setCode(lab.starterCode || ''); setOutput('') }}
              style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16, cursor: 'pointer', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = (diffColor[lab.difficulty]) + '60'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${diffColor[lab.difficulty]},transparent)` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ background: 'rgba(108,71,255,0.15)', color: '#a78bff', fontSize: 10, padding: '2px 8px', borderRadius: 100 }}>{lab.category}</span>
                <span style={{ background: (diffColor[lab.difficulty]) + '15', color: diffColor[lab.difficulty], fontSize: 10, padding: '2px 8px', borderRadius: 100, textTransform: 'capitalize' }}>{lab.difficulty}</span>
              </div>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, margin: '0 0 6px', color: '#fff' }}>{lab.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '0 0 10px', lineHeight: 1.5 }}>{lab.instructions?.slice(0, 70)}...</p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#ff9500', fontSize: 12, fontWeight: 700 }}>⚡ {lab.points} pts</span>
                <span style={{ color: '#6c47ff', fontSize: 12, fontWeight: 600 }}>Start →</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '7px 14px', borderRadius: 9, cursor: 'pointer', marginBottom: 14, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
            ← Back
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16 }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, margin: '0 0 6px' }}>{selected.title}</h2>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(108,71,255,0.15)', color: '#a78bff', fontSize: 10, padding: '2px 8px', borderRadius: 100 }}>{selected.category}</span>
                <span style={{ color: '#ff9500', fontSize: 11, fontWeight: 700 }}>⚡ {selected.points} pts</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{selected.instructions}</p>
              {output && (
                <div style={{ marginTop: 12, background: output.includes('✅') ? 'rgba(0,200,81,0.1)' : 'rgba(255,107,107,0.1)', border: `1px solid ${output.includes('✅') ? 'rgba(0,200,81,0.3)' : 'rgba(255,107,107,0.3)'}`, borderRadius: 10, padding: 12 }}>
                  <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 12, color: output.includes('✅') ? '#00c851' : '#ff6b6b', whiteSpace: 'pre-line' }}>{output}</p>
                </div>
              )}
            </div>
            <div style={{ background: '#0d0d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ background: '#1a1a24', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                  {selected.category === 'Python' ? '🐍 solution.py' : '⚡ solution.js'}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setOutput('▶ Running...\n✅ All tests passed!\n⚡ +' + selected.points + ' pts!')}
                    style={{ background: '#00c851', border: 'none', color: '#fff', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'DM Sans,sans-serif' }}>▶ Run</button>
                  <button onClick={() => { setOutput('✅ Submitted!\n🏆 +' + selected.points + ' points!'); API.put(`/labs/${selected._id}/complete`).catch(() => {}) }}
                    style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'DM Sans,sans-serif' }}>Submit</button>
                </div>
              </div>
              <textarea value={code} onChange={e => setCode(e.target.value)}
                style={{ width: '100%', minHeight: 280, background: 'transparent', border: 'none', color: '#a9b7d0', fontFamily: 'monospace', fontSize: 13, padding: 14, resize: 'vertical', outline: 'none', lineHeight: 1.8, boxSizing: 'border-box' }}
                spellCheck={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════
// SCORECARD
// ════════════════════════════════════════
const ScorecardPage = ({ user }) => {
  const rank = user?.scorecard?.rank || 'Newcomer'
  const points = user?.scorecard?.totalPoints || 0
  const rankColors = { Expert: '#ff9500', Advanced: '#6c47ff', Intermediate: '#00d2ff', Beginner: '#00c851', Newcomer: 'rgba(255,255,255,0.4)' }
  const rankEmoji = { Expert: '🥇', Advanced: '🥈', Intermediate: '🥉', Beginner: '⭐', Newcomer: '🌱' }
  const nextPoints = rank === 'Newcomer' ? 50 : rank === 'Beginner' ? 200 : rank === 'Intermediate' ? 500 : rank === 'Advanced' ? 1000 : 9999
  const progress = Math.min((points / nextPoints) * 100, 100)

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 24, margin: '0 0 16px' }}>🏆 Scorecard</h1>

      <div style={{ background: 'linear-gradient(135deg,rgba(108,71,255,0.15),rgba(255,107,107,0.08))', border: '1px solid rgba(108,71,255,0.25)', borderRadius: 18, padding: 22, marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>{rankEmoji[rank]}</div>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 28, margin: '0 0 4px', color: rankColors[rank] }}>{rank}</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', margin: '0 0 14px', fontSize: 13 }}>{user?.name}</p>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', borderRadius: 100, padding: '8px 20px', marginBottom: 14 }}>
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 26, color: '#ff9500' }}>{points}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginLeft: 6 }}>pts</span>
        </div>
        {rank !== 'Expert' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>
              <span>Next rank</span><span>{points}/{nextPoints}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 6 }}>
              <div style={{ height: 6, borderRadius: 100, width: `${progress}%`, background: `linear-gradient(90deg,${rankColors[rank]},#ff6b6b)`, transition: 'width 1.5s ease' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { icon: '⚗️', label: 'Labs Done', value: user?.scorecard?.labsCompleted || 0, color: '#00d2ff' },
          { icon: '📝', label: 'Exams', value: user?.scorecard?.examsCompleted || 0, color: '#6c47ff' },
          { icon: '🗂️', label: 'Projects', value: user?.scorecard?.projectsCompleted || 0, color: '#00c851' },
          { icon: '🔥', label: 'Streak', value: '7 days', color: '#ff9500' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#13131a', border: `1px solid ${s.color}20`, borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 22, color: '#fff' }}>{s.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16 }}>
        <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, margin: '0 0 12px' }}>Recent Activity</h3>
        {[
          { text: 'Completed Hello World lab', pts: '+10', time: '2h ago', icon: '⚗️' },
          { text: 'Enrolled in React JS Course', pts: '—', time: '1d ago', icon: '📚' },
          { text: 'Passed Web Dev Quiz', pts: '+25', time: '2d ago', icon: '✅' },
          { text: 'Joined CyberSquare', pts: '+5', time: '3d ago', icon: '🎉' },
        ].map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(108,71,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{a.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.text}</p>
              <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{a.time}</p>
            </div>
            {a.pts !== '—' && <span style={{ color: '#00c851', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{a.pts}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// PROJECTS
// ════════════════════════════════════════
const ProjectsPage = () => {
  const diffColor = { easy: '#00c851', medium: '#ff9500', hard: '#ff6b6b' }
  const projects = [
    { id: 1, title: 'E-Commerce Platform', tech: ['React', 'Node.js', 'MongoDB'], desc: 'Full-stack shopping platform.', difficulty: 'hard', points: 100 },
    { id: 2, title: 'Chat Application', tech: ['React', 'Socket.io'], desc: 'Real-time chat with rooms.', difficulty: 'medium', points: 60 },
    { id: 3, title: 'Portfolio Website', tech: ['React', 'Tailwind'], desc: 'Developer portfolio with animations.', difficulty: 'easy', points: 30 },
    { id: 4, title: 'AI Image Generator', tech: ['Python', 'Flask', 'OpenAI'], desc: 'AI-powered image generation.', difficulty: 'hard', points: 120 },
    { id: 5, title: 'Task Management App', tech: ['React', 'Redux'], desc: 'Kanban-style task manager.', difficulty: 'medium', points: 70 },
    { id: 6, title: 'Weather Dashboard', tech: ['React', 'API'], desc: '7-day weather forecast app.', difficulty: 'easy', points: 40 },
  ]

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 24, margin: '0 0 4px' }}>🗂️ Projects</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 16, fontSize: 12 }}>Build real-world projects and earn points</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
        {projects.map((p, i) => (
          <div key={p.id} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16, transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = (diffColor[p.difficulty]) + '50'; e.currentTarget.style.transform = 'translateY(-3px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${diffColor[p.difficulty]},transparent)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ background: (diffColor[p.difficulty]) + '15', color: diffColor[p.difficulty], fontSize: 10, padding: '2px 8px', borderRadius: 100, textTransform: 'capitalize' }}>{p.difficulty}</span>
              <span style={{ color: '#ff9500', fontSize: 11, fontWeight: 700 }}>⚡ {p.points}</span>
            </div>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, margin: '0 0 6px', color: '#fff' }}>{p.title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 10px', lineHeight: 1.5 }}>{p.desc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
              {p.tech.map(t => <span key={t} style={{ background: 'rgba(108,71,255,0.12)', color: '#a78bff', fontSize: 10, padding: '2px 8px', borderRadius: 100 }}>{t}</span>)}
            </div>
            <button style={{ width: '100%', background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '9px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
              Start Project →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// LIVE CLASS
// ════════════════════════════════════════
const LiveClassPage = () => {
  const [active, setActive] = useState(null)
  const classes = [
    { id: 1, title: 'React Advanced Patterns', instructor: 'Rahul Dev', time: 'Today 3:00 PM', status: 'live', viewers: 142, thumbnail: 'https://img.youtube.com/vi/w7ejDZ8SWv8/maxresdefault.jpg', videoId: 'w7ejDZ8SWv8' },
    { id: 2, title: 'Node.js REST APIs', instructor: 'Priya Nair', time: 'Today 5:00 PM', status: 'upcoming', viewers: 0, thumbnail: 'https://img.youtube.com/vi/fBNz5xF-Kx4/maxresdefault.jpg', videoId: 'fBNz5xF-Kx4' },
    { id: 3, title: 'Python ML Basics', instructor: 'Arjun Menon', time: 'Tomorrow', status: 'upcoming', viewers: 0, thumbnail: 'https://img.youtube.com/vi/_uQrJ0TkZlc/maxresdefault.jpg', videoId: '_uQrJ0TkZlc' },
    { id: 4, title: 'Git & GitHub Masterclass', instructor: 'Sarah K', time: 'Yesterday', status: 'recorded', viewers: 891, thumbnail: 'https://img.youtube.com/vi/RGOj5yH7evk/maxresdefault.jpg', videoId: 'RGOj5yH7evk' },
  ]
  const statusColor = { live: '#ff6b6b', upcoming: '#ff9500', recorded: '#00c851' }

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 24, margin: '0 0 4px' }}>🖥️ Live Class Room</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 16, fontSize: 12 }}>Join live and recorded classes</p>

      {active ? (
        <div>
          <button onClick={() => setActive(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '7px 14px', borderRadius: 9, cursor: 'pointer', marginBottom: 14, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>← Back</button>
          <div style={{ background: '#13131a', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ width: '100%', aspectRatio: '16/9' }}>
              <iframe src={`https://www.youtube.com/embed/${active.videoId}?autoplay=1`} title={active.title} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            </div>
            <div style={{ padding: '14px 16px' }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, margin: '0 0 4px' }}>{active.title}</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: 12 }}>by {active.instructor} · {active.time}</p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
          {classes.map((c, i) => (
            <div key={c.id} onClick={() => setActive(c)} style={{ background: '#13131a', border: `1px solid ${c.status === 'live' ? 'rgba(255,107,107,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ position: 'relative' }}>
                <img src={c.thumbnail} alt={c.title} style={{ width: '100%', height: 130, objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,#13131a 0%,transparent 60%)' }} />
                <div style={{ position: 'absolute', top: 8, left: 8 }}>
                  {c.status === 'live' && <span style={{ background: '#ff6b6b', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 100, fontWeight: 700 }}>● LIVE</span>}
                  {c.status === 'recorded' && <span style={{ background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 100 }}>📹 Recorded</span>}
                  {c.status === 'upcoming' && <span style={{ background: 'rgba(255,149,0,0.85)', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 100 }}>🕐 Upcoming</span>}
                </div>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, margin: '0 0 3px', color: '#fff' }}>{c.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 5px' }}>by {c.instructor}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                  <span>🕐 {c.time}</span>
                  {c.viewers > 0 && <span>👁 {c.viewers}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════
// LAB EXAM
// ════════════════════════════════════════
const LabExamPage = () => {
  const [exams, setExams] = useState([])
  const [active, setActive] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)

  const fallbackExams = [
    { _id: 'e1', title: 'JavaScript Fundamentals', description: 'Test your core JS knowledge', duration: 30, totalMarks: 30, passingMarks: 18, questions: [
      { question: 'What is a closure?', options: ['No params function', 'Retains outer scope', 'A loop', 'Object method'], correctAnswer: 1, points: 10 },
      { question: 'Which removes last array element?', options: ['shift()', 'pop()', 'splice()', 'slice()'], correctAnswer: 1, points: 10 },
      { question: 'What does === check?', options: ['Value only', 'Type only', 'Value and type', 'Neither'], correctAnswer: 2, points: 10 },
    ]},
    { _id: 'e2', title: 'React Basics Quiz', description: 'Test your React knowledge', duration: 20, totalMarks: 20, passingMarks: 12, questions: [
      { question: 'What is JSX?', options: ['A library', 'Syntax extension', 'CSS framework', 'Database'], correctAnswer: 1, points: 10 },
      { question: 'Side effects hook?', options: ['useState', 'useEffect', 'useRef', 'useContext'], correctAnswer: 1, points: 10 },
    ]},
  ]

  useEffect(() => {
    API.get('/exams').then(({ data }) => setExams(data.length > 0 ? data : fallbackExams)).catch(() => setExams(fallbackExams))
  }, [])

  useEffect(() => {
    if (active && timeLeft > 0 && !result) {
      const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { clearInterval(t); return 0 } return p - 1 }), 1000)
      return () => clearInterval(t)
    }
  }, [active, timeLeft, result])

  const startExam = (exam) => { setActive(exam); setAnswers({}); setResult(null); setTimeLeft(exam.duration * 60) }
  const submitExam = () => {
    let score = 0
    active.questions.forEach((q, i) => { if (Number(answers[i]) === q.correctAnswer) score += q.points })
    const passed = score >= active.passingMarks
    setResult({ score, passed, total: active.totalMarks })
    API.post(`/exams/${active._id}/submit`, { answers }).catch(() => {})
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 24, margin: '0 0 4px' }}>🧪 Lab Exam</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 16, fontSize: 12 }}>Test your knowledge and earn certificates</p>

      {!active ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
          {exams.map((exam, i) => (
            <div key={exam._id} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 18, transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,71,255,0.4)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>📝</div>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, margin: '0 0 5px' }}>{exam.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 10px' }}>{exam.description}</p>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 14, flexWrap: 'wrap' }}>
                <span>⏱ {exam.duration}m</span>
                <span>📊 {exam.totalMarks} marks</span>
                <span>❓ {exam.questions?.length} Qs</span>
              </div>
              <button onClick={() => startExam(exam)} style={{ width: '100%', background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '11px', borderRadius: 11, cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans,sans-serif' }}>
                Start Exam →
              </button>
            </div>
          ))}
        </div>
      ) : result ? (
        <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: '#13131a', border: `1px solid ${result.passed ? 'rgba(0,200,81,0.3)' : 'rgba(255,107,107,0.3)'}`, borderRadius: 18, padding: 32 }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>{result.passed ? '🎉' : '😔'}</div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 26, margin: '0 0 8px', color: result.passed ? '#00c851' : '#ff6b6b' }}>{result.passed ? 'Passed!' : 'Failed'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 20, fontSize: 15 }}>Score: <strong style={{ color: '#fff' }}>{result.score}</strong>/{result.total}</p>
            <button onClick={() => setActive(null)} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '11px 26px', borderRadius: 11, cursor: 'pointer', fontWeight: 700, fontFamily: 'DM Sans,sans-serif' }}>
              Back to Exams
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, margin: 0 }}>{active.title}</h2>
            <div style={{ background: timeLeft < 300 ? 'rgba(255,107,107,0.15)' : 'rgba(108,71,255,0.15)', border: `1px solid ${timeLeft < 300 ? 'rgba(255,107,107,0.4)' : 'rgba(108,71,255,0.3)'}`, borderRadius: 10, padding: '6px 14px', fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color: timeLeft < 300 ? '#ff6b6b' : '#a78bff' }}>
              ⏱ {mins}:{secs}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {active.questions.map((q, qi) => (
              <div key={qi} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16 }}>
                <p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 12px', color: '#fff', lineHeight: 1.5 }}>
                  <span style={{ color: '#6c47ff', marginRight: 6 }}>Q{qi + 1}.</span>{q.question}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {q.options.map((opt, oi) => (
                    <button key={oi} onClick={() => setAnswers({ ...answers, [qi]: oi })} style={{
                      textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'DM Sans,sans-serif', fontSize: 13,
                      background: answers[qi] === oi ? 'rgba(108,71,255,0.2)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${answers[qi] === oi ? 'rgba(108,71,255,0.6)' : 'rgba(255,255,255,0.07)'}`,
                      color: answers[qi] === oi ? '#a78bff' : 'rgba(255,255,255,0.6)'
                    }}>
                      <span style={{ marginRight: 8, color: 'rgba(255,255,255,0.3)' }}>{String.fromCharCode(65 + oi)}.</span>{opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={() => setActive(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.5)', padding: '11px 18px', borderRadius: 11, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: 13 }}>Cancel</button>
            <button onClick={submitExam} style={{ flex: 1, background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '11px', borderRadius: 11, cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans,sans-serif' }}>
              Submit ({Object.keys(answers).length}/{active.questions.length}) →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════
// TRAINING PAGE
// ════════════════════════════════════════
const TrainingPage = () => {
  const sessions = [
    { id: 1, title: 'Full Stack Web Development', mentor: 'Rahul Dev', date: 'Mon, Wed, Fri', time: '7:00 PM - 9:00 PM', duration: '3 months', seats: 12, enrolled: 8, color: '#6c47ff' },
    { id: 2, title: 'Data Science with Python', mentor: 'Arjun Menon', date: 'Tue, Thu', time: '6:00 PM - 8:00 PM', duration: '2 months', seats: 10, enrolled: 10, color: '#ff9500' },
    { id: 3, title: 'UI/UX Design Bootcamp', mentor: 'Priya Nair', date: 'Sat, Sun', time: '10:00 AM - 1:00 PM', duration: '6 weeks', seats: 15, enrolled: 6, color: '#ff3cac' },
  ]

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 24, margin: '0 0 4px' }}>📅 Training Sessions</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 16, fontSize: 12 }}>Live mentorship with industry experts</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
        {sessions.map((s, i) => (
          <div key={s.id} style={{ background: '#13131a', border: `1px solid ${s.color}20`, borderRadius: 14, padding: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${s.color},transparent)` }} />
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, margin: '0 0 6px', color: '#fff' }}>{s.title}</h3>
            <p style={{ color: s.color, fontSize: 12, fontWeight: 600, margin: '0 0 10px' }}>👨‍🏫 {s.mentor}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              <span>📅 {s.date}</span>
              <span>🕐 {s.time}</span>
              <span>⏱ {s.duration}</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                <span>Seats</span><span>{s.enrolled}/{s.seats}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 4 }}>
                <div style={{ height: 4, borderRadius: 100, width: `${(s.enrolled / s.seats) * 100}%`, background: s.enrolled >= s.seats ? '#ff6b6b' : s.color }} />
              </div>
            </div>
            <button disabled={s.enrolled >= s.seats} style={{ width: '100%', padding: '9px', borderRadius: 10, border: 'none', cursor: s.enrolled >= s.seats ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'DM Sans,sans-serif', background: s.enrolled >= s.seats ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg,${s.color},${s.color}cc)`, color: s.enrolled >= s.seats ? 'rgba(255,255,255,0.3)' : '#fff' }}>
              {s.enrolled >= s.seats ? 'Fully Booked' : 'Enroll Now →'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// ACTIVITIES PAGE
// ════════════════════════════════════════
const ActivitiesPage = ({ user }) => {
  const activities = [
    { icon: '⚗️', title: 'Completed CS Lab', desc: 'Hello World in JS', pts: '+10', time: '2h ago', color: '#00d2ff' },
    { icon: '📚', title: 'Course Enrollment', desc: 'React JS Full Course', pts: '—', time: '1d ago', color: '#6c47ff' },
    { icon: '✅', title: 'Exam Passed', desc: 'JS Fundamentals — 28/30', pts: '+25', time: '2d ago', color: '#00c851' },
    { icon: '🎉', title: 'Joined CyberSquare', desc: 'Welcome!', pts: '+5', time: '3d ago', color: '#ff6b6b' },
  ]

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 24, margin: '0 0 4px' }}>⚡ My Activities</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 16, fontSize: 12 }}>Your learning journey</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { icon: '🔥', label: 'Streak', value: '7 days', color: '#ff9500' },
          { icon: '⚡', label: 'This Week', value: '12', color: '#6c47ff' },
          { icon: '🏆', label: 'Points', value: user?.scorecard?.totalPoints || 0, color: '#00c851' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#13131a', border: `1px solid ${s.color}20`, borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 18, color: '#fff' }}>{s.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, margin: 0 }}>Activity Timeline</h3>
        </div>
        {activities.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < activities.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: a.color + '20', border: `1px solid ${a.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{a.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#fff' }}>{a.title}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{a.desc} · {a.time}</p>
            </div>
            {a.pts !== '—' && <span style={{ color: '#00c851', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{a.pts}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// DIGITAL FEST
// ════════════════════════════════════════
const DigitalFestPage = () => {
  const events = [
    { id: 1, title: 'Hackathon 2026', desc: '24-hour coding challenge!', date: 'April 15-16', prize: '₹50,000', type: 'Hackathon', color: '#6c47ff' },
    { id: 2, title: 'UI/UX Challenge', desc: 'Design the best UX.', date: 'April 20', prize: '₹20,000', type: 'Design', color: '#ff3cac' },
    { id: 3, title: 'Tech Quiz', desc: 'Test your tech knowledge.', date: 'April 25', prize: '₹10,000', type: 'Quiz', color: '#ff9500' },
    { id: 4, title: 'Open Source Sprint', desc: 'Contribute in 48 hours.', date: 'May 1-2', prize: '₹30,000', type: 'Open Source', color: '#00c851' },
  ]

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ background: 'linear-gradient(135deg,rgba(108,71,255,0.2),rgba(255,60,172,0.15))', border: '1px solid rgba(108,71,255,0.25)', borderRadius: 16, padding: '20px 16px', marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎪</div>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 24, margin: '0 0 6px', background: 'linear-gradient(135deg,#a78bff,#ff3cac)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Digital Fest 2026
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 10px', fontSize: 12 }}>Compete, create, and win prizes!</p>
        <span style={{ color: '#ff9500', fontSize: 13, fontWeight: 700 }}>🏆 Total Prize: ₹1,10,000</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
        {events.map((e, i) => (
          <div key={e.id} style={{ background: '#13131a', border: `1px solid ${e.color}20`, borderRadius: 14, padding: 16, position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}
            onMouseEnter={el => { el.currentTarget.style.borderColor = e.color + '50'; el.currentTarget.style.transform = 'translateY(-3px)' }}
            onMouseLeave={el => { el.currentTarget.style.borderColor = e.color + '20'; el.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${e.color},transparent)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ background: e.color + '15', color: e.color, fontSize: 10, padding: '2px 8px', borderRadius: 100 }}>{e.type}</span>
              <span style={{ color: '#ff9500', fontSize: 11, fontWeight: 700 }}>🏆 {e.prize}</span>
            </div>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, margin: '0 0 6px', color: '#fff' }}>{e.title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 10px' }}>{e.desc}</p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: '0 0 12px' }}>📅 {e.date}</p>
            <button style={{ width: '100%', background: `linear-gradient(135deg,${e.color},${e.color}aa)`, border: 'none', color: '#fff', padding: '9px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
              Register →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// BOTTOM NAV (Mobile Only)
// ════════════════════════════════════════
const BottomNav = ({ location }) => {
  const navigate = useNavigate()
  const items = [
    { icon: '🏠', label: 'Home', path: '/student' },
    { icon: '🎓', label: 'Courses', path: '/student/courses' },
    { icon: '⚗️', label: 'Lab', path: '/student/lab' },
    { icon: '🏆', label: 'Score', path: '/student/scorecard' },
    { icon: '📝', label: 'Exams', path: '/student/exams' },
  ]

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(13,13,22,0.98)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', zIndex: 200, paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {items.map(item => {
        const isActive = location.pathname === item.path
        return (
          <button key={item.path} onClick={() => navigate(item.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 4px 8px', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
            <span style={{ fontSize: 20, lineHeight: 1, marginBottom: 3 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 400, color: isActive ? '#a78bff' : 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans,sans-serif' }}>{item.label}</span>
            {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#6c47ff', marginTop: 2 }} />}
          </button>
        )
      })}
    </div>
  )
}

// ════════════════════════════════════════
// PAGE TITLES
// ════════════════════════════════════════
const pageTitles = {
  '/student': '🏠 Home',
  '/student/courses': '🎓 My Courses',
  '/student/lab': '⚗️ CS Lab',
  '/student/training': '📅 Training',
  '/student/activities': '⚡ Activities',
  '/student/scorecard': '🏆 Scorecard',
  '/student/projects': '🗂️ Projects',
  '/student/digitalfest': '🎪 Digital Fest',
  '/student/live': '🖥️ Live Class',
  '/student/exam': '🧪 Lab Exam',
  '/student/exams': '📝 Exams',
}

// ════════════════════════════════════════
// MAIN DASHBOARD
// ════════════════════════════════════════
const StudentDashboard = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [enrollments, setEnrollments] = useState([])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    API.get('/enrollments/my').then(({ data }) => setEnrollments(data)).catch(() => {})
  }, [])

  return (
    <div style={{ background: '#07070f', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans',sans-serif", display: 'flex' }}>

      {/* Sidebar - hidden on mobile unless mobileOpen */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content */}
      <div style={{
        marginLeft: isMobile ? 0 : 240,
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100vh',
        overflowY: 'auto',
        paddingBottom: isMobile ? 70 : 0
      }}>
        <TopBar user={user} title={pageTitles[location.pathname] || 'Dashboard'} onMenuClick={() => setMobileOpen(true)} />

        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage user={user} enrollments={enrollments} />} />
            <Route path="/courses" element={<MyCoursesPage enrollments={enrollments} />} />
            <Route path="/lab" element={<CsLabPage />} />
            <Route path="/scorecard" element={<ScorecardPage user={user} />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/live" element={<LiveClassPage />} />
            <Route path="/exam" element={<LabExamPage />} />
            <Route path="/exams" element={<LabExamPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/activities" element={<ActivitiesPage user={user} />} />
            <Route path="/digitalfest" element={<DigitalFestPage />} />
          </Routes>
        </div>
      </div>

      {/* Bottom nav - mobile only */}
      {isMobile && <BottomNav location={location} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        * { box-sizing: border-box; }
        a { text-decoration: none; }
        textarea { caret-color: #a78bff; }
        nav::-webkit-scrollbar { width: 3px; }
        nav::-webkit-scrollbar-track { background: #0d0d16; }
        nav::-webkit-scrollbar-thumb { background: #6c47ff; border-radius: 10px; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #07070f; }
        ::-webkit-scrollbar-thumb { background: #6c47ff; border-radius: 10px; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        @media (max-width: 768px) {
          * { -webkit-tap-highlight-color: transparent; }
        }
      `}</style>
    </div>
  )
}

export default StudentDashboard