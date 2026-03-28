import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

// ════════════════════════════════════════
// SIDEBAR COMPONENT
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

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div style={{
      width: collapsed ? 64 : 240,
      height: '100vh',
      background: '#0d0d16',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      overflow: 'hidden'
    }}>

      {/* Logo + Toggle */}
      <div style={{
        padding: collapsed ? '16px 14px' : '16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 8,
        flexShrink: 0
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, flexShrink: 0 }}>C</div>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, color: '#fff', whiteSpace: 'nowrap' }}>
              Cyber<span style={{ color: '#6c47ff' }}>Square</span>
            </span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          background: 'rgba(255,255,255,0.06)',
          border: 'none',
          color: 'rgba(255,255,255,0.5)',
          width: 26, height: 26,
          borderRadius: 7,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          flexShrink: 0,
          transition: 'all 0.2s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Profile */}
      {!collapsed ? (
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
      ) : (
        <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      )}

      {/* Menu Items - SCROLLABLE */}
      <nav style={{
        flex: 1,
        padding: '8px 6px',
        overflowY: 'auto',
        overflowX: 'hidden',
        msOverflowStyle: 'none'
      }}>
        {menuItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 10,
                padding: collapsed ? '10px 0' : '9px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 10,
                marginBottom: 2,
                transition: 'all 0.2s',
                background: isActive ? 'rgba(108,71,255,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #6c47ff' : '3px solid transparent',
                cursor: 'pointer'
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
                {!collapsed && (
                  <span style={{
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#a78bff' : 'rgba(255,255,255,0.5)',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.2s'
                  }}>
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '8px 6px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <button onClick={logout} style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 10,
          padding: collapsed ? '10px 0' : '9px 10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          background: 'transparent',
          border: 'none',
          borderRadius: 10,
          cursor: 'pointer',
          transition: 'all 0.2s',
          color: 'rgba(255,107,107,0.6)'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.1)'; e.currentTarget.style.color = '#ff6b6b' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,107,107,0.6)' }}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>🚪</span>
          {!collapsed && <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>Logout</span>}
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// TOP BAR
// ════════════════════════════════════════
const TopBar = ({ user, title }) => (
  <div style={{
    background: 'rgba(13,13,22,0.97)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 50
  }}>
    <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, color: '#fff' }}>{title}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ background: 'rgba(108,71,255,0.12)', border: '1px solid rgba(108,71,255,0.25)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#a78bff' }}>
        🏆 {user?.scorecard?.totalPoints || 0} pts
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#fff' }}>{user?.name}</p>
          <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{user?.scorecard?.rank || 'Newcomer'}</p>
        </div>
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
    <div style={{ padding: '24px', overflowY: 'auto' }}>
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg,rgba(108,71,255,0.2),rgba(255,107,107,0.1))', border: '1px solid rgba(108,71,255,0.25)', borderRadius: 20, padding: '22px 26px', marginBottom: 24, animation: 'fadeUp 0.5s ease both' }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 'clamp(20px,3vw,34px)', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          Welcome back, <span style={{ background: 'linear-gradient(135deg,#a78bff,#ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name?.split(' ')[0]}!</span> 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: 14 }}>Continue your learning journey at CyberSquare</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { icon: '📚', label: 'Enrolled', value: enrollments.length, color: '#6c47ff' },
          { icon: '🏆', label: 'Points', value: user?.scorecard?.totalPoints || 0, color: '#ff9500' },
          { icon: '⚗️', label: 'Labs Done', value: user?.scorecard?.labsCompleted || 0, color: '#00d2ff' },
          { icon: '📝', label: 'Exams', value: user?.scorecard?.examsCompleted || 0, color: '#00c851' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#13131a', border: `1px solid ${s.color}20`, borderRadius: 16, padding: '16px 18px', transition: 'all 0.3s', animation: `fadeUp 0.5s ease ${i * 0.08}s both`, cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = s.color + '50'; e.currentTarget.style.transform = 'translateY(-4px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = s.color + '20'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 26, color: '#fff' }}>{s.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Continue Learning */}
      <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, margin: '0 0 12px' }}>Continue Learning</h2>
      {enrollments.length === 0 ? (
        <div style={{ background: '#13131a', border: '1px dashed rgba(108,71,255,0.3)', borderRadius: 16, padding: '32px 20px', textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📚</div>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 14, fontSize: 14 }}>No enrolled courses yet.</p>
          <button onClick={() => navigate('/courses')} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '10px 22px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
            Browse Courses →
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14, marginBottom: 24 }}>
          {enrollments.slice(0, 4).map((e, i) => (
            <div key={e._id} onClick={() => navigate(`/courses/${e.course?._id}`, { state: { course: e.course } })}
              style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s', animation: `fadeUp 0.5s ease ${i * 0.08}s both` }}
              onMouseEnter={el => { el.currentTarget.style.borderColor = 'rgba(108,71,255,0.4)'; el.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={el => { el.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; el.currentTarget.style.transform = 'translateY(0)' }}
            >
              <img src={e.course?.thumbnail || 'https://placehold.co/400x120/13131a/6c47ff?text=Course'} alt="" style={{ width: '100%', height: 110, objectFit: 'cover' }} />
              <div style={{ padding: '12px 14px' }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, margin: '0 0 8px', color: '#fff', lineHeight: 1.3 }}>{e.course?.title}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>Progress</span>
                  <span style={{ color: '#6c47ff', fontWeight: 700 }}>{e.progress || 0}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 4 }}>
                  <div style={{ height: 4, borderRadius: 100, width: `${e.progress || 0}%`, background: 'linear-gradient(90deg,#6c47ff,#9c47ff)', transition: 'width 1s ease' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Access */}
      <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, margin: '0 0 12px' }}>Quick Access</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 10 }}>
        {[
          { icon: '⚗️', label: 'CS Lab', path: '/student/lab', color: '#00d2ff' },
          { icon: '🏆', label: 'Scorecard', path: '/student/scorecard', color: '#ff9500' },
          { icon: '🗂️', label: 'Projects', path: '/student/projects', color: '#00c851' },
          { icon: '🖥️', label: 'Live Class', path: '/student/live', color: '#ff6b6b' },
          { icon: '🧪', label: 'Lab Exam', path: '/student/exam', color: '#6c47ff' },
          { icon: '📝', label: 'Exams', path: '/student/exams', color: '#ff3cac' },
        ].map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)} style={{ background: '#13131a', border: `1px solid ${item.color}20`, borderRadius: 12, padding: '14px 10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', animation: `fadeUp 0.5s ease ${i * 0.06}s both` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = item.color + '50'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = item.color + '08' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = item.color + '20'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#13131a' }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// MY COURSES PAGE
// ════════════════════════════════════════
const MyCoursesPage = ({ enrollments }) => {
  const navigate = useNavigate()
  return (
    <div style={{ padding: 24, overflowY: 'auto' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 28, margin: '0 0 20px' }}>My Courses</h1>
      {enrollments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 30px', background: '#13131a', borderRadius: 18, border: '1px dashed rgba(108,71,255,0.3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 16, fontSize: 14 }}>No enrolled courses yet.</p>
          <button onClick={() => navigate('/courses')} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '10px 22px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontFamily: 'DM Sans,sans-serif', fontSize: 14 }}>
            Browse Courses →
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          {enrollments.map((e, i) => (
            <div key={e._id} onClick={() => navigate(`/courses/${e.course?._id}`, { state: { course: e.course } })}
              style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s', animation: `fadeUp 0.5s ease ${i * 0.07}s both` }}
              onMouseEnter={el => { el.currentTarget.style.borderColor = 'rgba(108,71,255,0.4)'; el.currentTarget.style.transform = 'translateY(-5px)'; el.currentTarget.style.boxShadow = '0 20px 40px rgba(108,71,255,0.15)' }}
              onMouseLeave={el => { el.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; el.currentTarget.style.transform = 'translateY(0)'; el.currentTarget.style.boxShadow = 'none' }}
            >
              <img src={e.course?.thumbnail || 'https://placehold.co/400x150/13131a/6c47ff?text=Course'} alt="" style={{ width: '100%', height: 140, objectFit: 'cover' }} />
              <div style={{ padding: '14px 16px' }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, margin: '0 0 4px', color: '#fff' }}>{e.course?.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '0 0 10px' }}>by {e.course?.instructor?.name || 'Instructor'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Progress</span>
                  <span style={{ color: e.progress >= 100 ? '#00c851' : '#6c47ff', fontWeight: 700 }}>{e.progress}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 5 }}>
                  <div style={{ height: 5, borderRadius: 100, width: `${e.progress}%`, background: e.progress >= 100 ? '#00c851' : 'linear-gradient(90deg,#6c47ff,#9c47ff)' }} />
                </div>
                {e.isCompleted && (
                  <div style={{ marginTop: 8, background: 'rgba(0,200,81,0.1)', border: '1px solid rgba(0,200,81,0.25)', borderRadius: 7, padding: '4px 10px', fontSize: 11, color: '#00c851', textAlign: 'center' }}>✅ Completed</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════
// CS LAB PAGE
// ════════════════════════════════════════
const CsLabPage = () => {
  const [labs, setLabs] = useState([])
  const [selected, setSelected] = useState(null)
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const diffColor = { easy: '#00c851', medium: '#ff9500', hard: '#ff6b6b' }

  const fallbackLabs = [
    { _id: '1', title: 'Hello World in JS', category: 'JavaScript', difficulty: 'easy', points: 10, instructions: 'Write a function that returns "Hello, World!" string.', starterCode: 'function helloWorld() {\n  // Your code here\n  \n}' },
    { _id: '2', title: 'Fibonacci Sequence', category: 'Python', difficulty: 'medium', points: 20, instructions: 'Write a function to return the nth Fibonacci number.', starterCode: 'def fibonacci(n):\n    # Your code here\n    pass' },
    { _id: '3', title: 'Reverse a String', category: 'JavaScript', difficulty: 'easy', points: 10, instructions: 'Write a function that reverses a string.', starterCode: 'function reverseString(str) {\n  // Your code here\n  \n}' },
    { _id: '4', title: 'Binary Search', category: 'Algorithm', difficulty: 'hard', points: 30, instructions: 'Implement binary search that returns the index of target.', starterCode: 'function binarySearch(arr, target) {\n  // Your code here\n  \n}' },
    { _id: '5', title: 'Find Duplicates', category: 'JavaScript', difficulty: 'medium', points: 20, instructions: 'Write a function that finds all duplicate numbers in an array.', starterCode: 'function findDuplicates(arr) {\n  // Your code here\n  \n}' },
    { _id: '6', title: 'Palindrome Check', category: 'Python', difficulty: 'easy', points: 10, instructions: 'Write a function that checks if a string is a palindrome.', starterCode: 'def is_palindrome(s):\n    # Your code here\n    pass' },
  ]

  useEffect(() => {
    API.get('/labs')
      .then(({ data }) => setLabs(data.length > 0 ? data : fallbackLabs))
      .catch(() => setLabs(fallbackLabs))
  }, [])

  return (
    <div style={{ padding: 24, overflowY: 'auto' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 28, margin: '0 0 4px' }}>⚗️ CS Lab</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontSize: 13 }}>Practice coding challenges and earn points</p>

      {!selected ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 14 }}>
          {labs.map((lab, i) => (
            <div key={lab._id} onClick={() => { setSelected(lab); setCode(lab.starterCode || ''); setOutput('') }}
              style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, cursor: 'pointer', transition: 'all 0.3s', animation: `fadeUp 0.5s ease ${i * 0.07}s both`, position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = (diffColor[lab.difficulty] || '#6c47ff') + '60'; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${diffColor[lab.difficulty]},transparent)` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ background: 'rgba(108,71,255,0.15)', color: '#a78bff', fontSize: 10, padding: '2px 8px', borderRadius: 100 }}>{lab.category}</span>
                <span style={{ background: (diffColor[lab.difficulty]) + '15', color: diffColor[lab.difficulty], fontSize: 10, padding: '2px 8px', borderRadius: 100, textTransform: 'capitalize' }}>{lab.difficulty}</span>
              </div>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 6px', color: '#fff' }}>{lab.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '0 0 12px', lineHeight: 1.5 }}>{lab.instructions?.slice(0, 70)}...</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#ff9500', fontSize: 12, fontWeight: 700 }}>⚡ {lab.points} pts</span>
                <span style={{ color: '#6c47ff', fontSize: 12, fontWeight: 600 }}>Start →</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '7px 16px', borderRadius: 9, cursor: 'pointer', marginBottom: 16, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
            ← Back to Labs
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, margin: '0 0 8px' }}>{selected.title}</h2>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                <span style={{ background: 'rgba(108,71,255,0.15)', color: '#a78bff', fontSize: 10, padding: '2px 8px', borderRadius: 100 }}>{selected.category}</span>
                <span style={{ background: (diffColor[selected.difficulty]) + '15', color: diffColor[selected.difficulty], fontSize: 10, padding: '2px 8px', borderRadius: 100, textTransform: 'capitalize' }}>{selected.difficulty}</span>
                <span style={{ color: '#ff9500', fontSize: 11, fontWeight: 700 }}>⚡ {selected.points} pts</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Instructions</p>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{selected.instructions}</p>
              </div>
              {output && (
                <div style={{ background: output.includes('✅') ? 'rgba(0,200,81,0.1)' : 'rgba(255,107,107,0.1)', border: `1px solid ${output.includes('✅') ? 'rgba(0,200,81,0.3)' : 'rgba(255,107,107,0.3)'}`, borderRadius: 10, padding: 12 }}>
                  <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 12, color: output.includes('✅') ? '#00c851' : '#ff6b6b', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{output}</p>
                </div>
              )}
            </div>
            <div style={{ background: '#0d0d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: '#1a1a24', padding: '9px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                  {selected.category === 'Python' ? '🐍 solution.py' : '⚡ solution.js'}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setOutput('▶ Running tests...\n✅ All test cases passed!\n⚡ +' + selected.points + ' points earned!')}
                    style={{ background: '#00c851', border: 'none', color: '#fff', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'DM Sans,sans-serif' }}>
                    ▶ Run
                  </button>
                  <button onClick={() => {
                    setOutput('✅ Submitted!\n🏆 +' + selected.points + ' points added!')
                    API.put(`/labs/${selected._id}/complete`).catch(() => {})
                  }}
                    style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'DM Sans,sans-serif' }}>
                    Submit
                  </button>
                </div>
              </div>
              <textarea value={code} onChange={e => setCode(e.target.value)}
                style={{ flex: 1, minHeight: 340, background: 'transparent', border: 'none', color: '#a9b7d0', fontFamily: 'monospace', fontSize: 13, padding: 16, resize: 'none', outline: 'none', lineHeight: 1.8, boxSizing: 'border-box' }}
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════
// SCORECARD PAGE
// ════════════════════════════════════════
const ScorecardPage = ({ user }) => {
  const rank = user?.scorecard?.rank || 'Newcomer'
  const points = user?.scorecard?.totalPoints || 0
  const rankColors = { Expert: '#ff9500', Advanced: '#6c47ff', Intermediate: '#00d2ff', Beginner: '#00c851', Newcomer: 'rgba(255,255,255,0.4)' }
  const rankEmoji = { Expert: '🥇', Advanced: '🥈', Intermediate: '🥉', Beginner: '⭐', Newcomer: '🌱' }
  const nextPoints = rank === 'Newcomer' ? 50 : rank === 'Beginner' ? 200 : rank === 'Intermediate' ? 500 : rank === 'Advanced' ? 1000 : 9999
  const progress = Math.min((points / nextPoints) * 100, 100)

  return (
    <div style={{ padding: 24, overflowY: 'auto' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 28, margin: '0 0 20px' }}>🏆 Scorecard</h1>

      <div style={{ background: 'linear-gradient(135deg,rgba(108,71,255,0.15),rgba(255,107,107,0.08))', border: '1px solid rgba(108,71,255,0.25)', borderRadius: 20, padding: 26, marginBottom: 20, textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{rankEmoji[rank]}</div>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 30, margin: '0 0 4px', color: rankColors[rank] }}>{rank}</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', margin: '0 0 16px', fontSize: 14 }}>{user?.name}</p>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', borderRadius: 100, padding: '8px 22px', marginBottom: 16 }}>
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 28, color: '#ff9500' }}>{points}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginLeft: 6 }}>total points</span>
        </div>
        {rank !== 'Expert' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
              <span>Progress to next rank</span>
              <span>{points}/{nextPoints} pts</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 7 }}>
              <div style={{ height: 7, borderRadius: 100, width: `${progress}%`, background: `linear-gradient(90deg,${rankColors[rank]},#ff6b6b)`, transition: 'width 1.5s ease' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { icon: '⚗️', label: 'Labs Completed', value: user?.scorecard?.labsCompleted || 0, color: '#00d2ff' },
          { icon: '📝', label: 'Exams Passed', value: user?.scorecard?.examsCompleted || 0, color: '#6c47ff' },
          { icon: '🗂️', label: 'Projects Done', value: user?.scorecard?.projectsCompleted || 0, color: '#00c851' },
          { icon: '🔥', label: 'Day Streak', value: 7, color: '#ff9500' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#13131a', border: `1px solid ${s.color}20`, borderRadius: 14, padding: '16px 18px', transition: 'all 0.3s', animation: `fadeUp 0.5s ease ${i * 0.1}s both` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = s.color + '50'; e.currentTarget.style.transform = 'translateY(-3px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = s.color + '20'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 26, color: '#fff' }}>{s.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
        <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 14px' }}>Recent Activity</h3>
        {[
          { text: 'Completed "Hello World" lab', pts: '+10', time: '2h ago', icon: '⚗️' },
          { text: 'Enrolled in React JS Course', pts: '—', time: '1d ago', icon: '📚' },
          { text: 'Passed Web Dev Quiz', pts: '+25', time: '2d ago', icon: '✅' },
          { text: 'Joined CyberSquare', pts: '+5', time: '3d ago', icon: '🎉' },
        ].map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(108,71,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{a.text}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{a.time}</p>
            </div>
            {a.pts !== '—' && <span style={{ color: '#00c851', fontWeight: 700, fontSize: 12 }}>{a.pts}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// PROJECTS PAGE
// ════════════════════════════════════════
const ProjectsPage = () => {
  const diffColor = { easy: '#00c851', medium: '#ff9500', hard: '#ff6b6b' }
  const projects = [
    { id: 1, title: 'E-Commerce Platform', tech: ['React', 'Node.js', 'MongoDB'], desc: 'Full-stack shopping platform with cart, payments and admin panel.', difficulty: 'hard', points: 100 },
    { id: 2, title: 'Chat Application', tech: ['React', 'Socket.io', 'Express'], desc: 'Real-time chat with rooms, private messages and file sharing.', difficulty: 'medium', points: 60 },
    { id: 3, title: 'Portfolio Website', tech: ['React', 'Tailwind', 'Framer'], desc: 'Stunning developer portfolio with animations and dark mode.', difficulty: 'easy', points: 30 },
    { id: 4, title: 'AI Image Generator', tech: ['Python', 'Flask', 'OpenAI'], desc: 'Web app that generates images using AI APIs.', difficulty: 'hard', points: 120 },
    { id: 5, title: 'Task Management App', tech: ['React', 'Redux', 'Firebase'], desc: 'Kanban-style task manager with drag-and-drop collaboration.', difficulty: 'medium', points: 70 },
    { id: 6, title: 'Weather Dashboard', tech: ['React', 'API', 'Chart.js'], desc: 'Real-time weather app with 7-day forecast and charts.', difficulty: 'easy', points: 40 },
  ]

  return (
    <div style={{ padding: 24, overflowY: 'auto' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 28, margin: '0 0 4px' }}>🗂️ Projects</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontSize: 13 }}>Build real-world projects and earn points</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 16 }}>
        {projects.map((p, i) => (
          <div key={p.id} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, transition: 'all 0.3s', animation: `fadeUp 0.5s ease ${i * 0.07}s both`, position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = (diffColor[p.difficulty]) + '50'; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${diffColor[p.difficulty]}15` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${diffColor[p.difficulty]},transparent)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ background: (diffColor[p.difficulty]) + '15', color: diffColor[p.difficulty], fontSize: 10, padding: '2px 9px', borderRadius: 100, textTransform: 'capitalize', fontWeight: 600 }}>{p.difficulty}</span>
              <span style={{ color: '#ff9500', fontSize: 12, fontWeight: 700 }}>⚡ {p.points} pts</span>
            </div>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, margin: '0 0 7px', color: '#fff' }}>{p.title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.6, margin: '0 0 12px' }}>{p.desc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
              {p.tech.map(t => (
                <span key={t} style={{ background: 'rgba(108,71,255,0.12)', color: '#a78bff', fontSize: 10, padding: '2px 9px', borderRadius: 100 }}>{t}</span>
              ))}
            </div>
            <button style={{ width: '100%', background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '9px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'DM Sans,sans-serif', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Start Project →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// LIVE CLASSROOM PAGE
// ════════════════════════════════════════
const LiveClassPage = () => {
  const [active, setActive] = useState(null)
  const classes = [
    { id: 1, title: 'React Advanced Patterns', instructor: 'Rahul Dev', time: 'Today 3:00 PM', status: 'live', viewers: 142, thumbnail: 'https://img.youtube.com/vi/w7ejDZ8SWv8/maxresdefault.jpg', videoId: 'w7ejDZ8SWv8' },
    { id: 2, title: 'Node.js REST APIs', instructor: 'Priya Nair', time: 'Today 5:00 PM', status: 'upcoming', viewers: 0, thumbnail: 'https://img.youtube.com/vi/fBNz5xF-Kx4/maxresdefault.jpg', videoId: 'fBNz5xF-Kx4' },
    { id: 3, title: 'Python ML Basics', instructor: 'Arjun Menon', time: 'Tomorrow 10:00 AM', status: 'upcoming', viewers: 0, thumbnail: 'https://img.youtube.com/vi/_uQrJ0TkZlc/maxresdefault.jpg', videoId: '_uQrJ0TkZlc' },
    { id: 4, title: 'Git & GitHub Masterclass', instructor: 'Sarah K', time: 'Yesterday', status: 'recorded', viewers: 891, thumbnail: 'https://img.youtube.com/vi/RGOj5yH7evk/maxresdefault.jpg', videoId: 'RGOj5yH7evk' },
    { id: 5, title: 'Tailwind CSS Guide', instructor: 'Dave G', time: 'Monday', status: 'recorded', viewers: 543, thumbnail: 'https://img.youtube.com/vi/lCxcTsOHrjo/maxresdefault.jpg', videoId: 'lCxcTsOHrjo' },
    { id: 6, title: 'MongoDB Aggregation', instructor: 'Tech Lead', time: 'Wednesday', status: 'recorded', viewers: 321, thumbnail: 'https://img.youtube.com/vi/ExcRbA7fy_A/maxresdefault.jpg', videoId: 'ExcRbA7fy_A' },
  ]
  const statusColor = { live: '#ff6b6b', upcoming: '#ff9500', recorded: '#00c851' }

  return (
    <div style={{ padding: 24, overflowY: 'auto' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 28, margin: '0 0 4px' }}>🖥️ Live Class Room</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontSize: 13 }}>Join live sessions and access recorded classes</p>

      {active ? (
        <div>
          <button onClick={() => setActive(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '7px 16px', borderRadius: 9, cursor: 'pointer', marginBottom: 16, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
            ← Back
          </button>
          <div style={{ background: '#13131a', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ width: '100%', aspectRatio: '16/9' }}>
              <iframe src={`https://www.youtube.com/embed/${active.videoId}?autoplay=1`} title={active.title} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, margin: '0 0 4px' }}>{active.title}</h2>
                  <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: 13 }}>by {active.instructor} · {active.time}</p>
                </div>
                <span style={{ background: statusColor[active.status] + '15', color: statusColor[active.status], padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, border: `1px solid ${statusColor[active.status]}30` }}>
                  {active.status === 'live' ? '● LIVE' : active.status === 'upcoming' ? '🕐 Upcoming' : '📹 Recorded'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          {classes.map((c, i) => (
            <div key={c.id} onClick={() => setActive(c)} style={{ background: '#13131a', border: `1px solid ${c.status === 'live' ? 'rgba(255,107,107,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s', animation: `fadeUp 0.5s ease ${i * 0.07}s both` }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ position: 'relative' }}>
                <img src={c.thumbnail} alt={c.title} style={{ width: '100%', height: 145, objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,#13131a 0%,transparent 50%)' }} />
                <div style={{ position: 'absolute', top: 9, left: 9 }}>
                  {c.status === 'live' && <span style={{ background: '#ff6b6b', color: '#fff', fontSize: 10, padding: '3px 9px', borderRadius: 100, fontWeight: 700 }}>● LIVE</span>}
                  {c.status === 'recorded' && <span style={{ background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 10, padding: '3px 9px', borderRadius: 100 }}>📹 Recorded</span>}
                  {c.status === 'upcoming' && <span style={{ background: 'rgba(255,149,0,0.85)', color: '#fff', fontSize: 10, padding: '3px 9px', borderRadius: 100, fontWeight: 600 }}>🕐 Upcoming</span>}
                </div>
              </div>
              <div style={{ padding: '13px 14px' }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, margin: '0 0 4px', color: '#fff' }}>{c.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 7px' }}>by {c.instructor}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
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
// LAB EXAM PAGE
// ════════════════════════════════════════
const LabExamPage = () => {
  const [exams, setExams] = useState([])
  const [active, setActive] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)

  const fallbackExams = [
    {
      _id: 'e1', title: 'JavaScript Fundamentals', description: 'Test your core JS knowledge', duration: 30, totalMarks: 30, passingMarks: 18,
      questions: [
        { question: 'What is a closure in JavaScript?', options: ['A function with no params', 'Function retaining outer scope access', 'A loop construct', 'An object method'], correctAnswer: 1, points: 10 },
        { question: 'Which method removes the last element?', options: ['shift()', 'pop()', 'splice()', 'slice()'], correctAnswer: 1, points: 10 },
        { question: 'What does === check?', options: ['Value only', 'Type only', 'Value and type', 'Neither'], correctAnswer: 2, points: 10 },
      ]
    },
    {
      _id: 'e2', title: 'React Basics Quiz', description: 'Test your React knowledge', duration: 20, totalMarks: 20, passingMarks: 12,
      questions: [
        { question: 'What is JSX?', options: ['A JS library', 'Syntax extension for JS', 'A CSS framework', 'A database'], correctAnswer: 1, points: 10 },
        { question: 'Which hook handles side effects?', options: ['useState', 'useEffect', 'useRef', 'useContext'], correctAnswer: 1, points: 10 },
      ]
    },
    {
      _id: 'e3', title: 'Python Basics', description: 'Test your Python knowledge', duration: 25, totalMarks: 30, passingMarks: 18,
      questions: [
        { question: 'How do you create a list in Python?', options: ['list = {}', 'list = []', 'list = ()', 'list = <>'], correctAnswer: 1, points: 10 },
        { question: 'What is the output of type([])?', options: ["<class 'dict'>", "<class 'list'>", "<class 'tuple'>", "<class 'array'>"], correctAnswer: 1, points: 10 },
        { question: 'How do you define a function?', options: ['function f():', 'def f():', 'func f():', 'define f():'], correctAnswer: 1, points: 10 },
      ]
    }
  ]

  useEffect(() => {
    API.get('/exams')
      .then(({ data }) => setExams(data.length > 0 ? data : fallbackExams))
      .catch(() => setExams(fallbackExams))
  }, [])

  useEffect(() => {
    if (active && timeLeft > 0 && !result) {
      const t = setInterval(() => setTimeLeft(p => {
        if (p <= 1) { clearInterval(t); return 0 }
        return p - 1
      }), 1000)
      return () => clearInterval(t)
    }
  }, [active, timeLeft, result])

  const startExam = (exam) => { setActive(exam); setAnswers({}); setResult(null); setTimeLeft(exam.duration * 60) }

  const submitExam = () => {
    let score = 0
    active.questions.forEach((q, i) => {
      if (Number(answers[i]) === q.correctAnswer) score += q.points
    })
    const passed = score >= active.passingMarks
    setResult({ score, passed, total: active.totalMarks })
    API.post(`/exams/${active._id}/submit`, { answers }).catch(() => {})
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')

  return (
    <div style={{ padding: 24, overflowY: 'auto' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 28, margin: '0 0 4px' }}>🧪 Lab Exam</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontSize: 13 }}>Test your knowledge and earn certifications</p>

      {!active ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          {exams.map((exam, i) => (
            <div key={exam._id} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22, transition: 'all 0.3s', animation: `fadeUp 0.5s ease ${i * 0.1}s both` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,71,255,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: 34, marginBottom: 12 }}>📝</div>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, margin: '0 0 6px' }}>{exam.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 12px' }}>{exam.description}</p>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 16, flexWrap: 'wrap' }}>
                <span>⏱ {exam.duration} mins</span>
                <span>📊 {exam.totalMarks} marks</span>
                <span>✅ Pass: {exam.passingMarks}</span>
                <span>❓ {exam.questions?.length} Qs</span>
              </div>
              <button onClick={() => startExam(exam)} style={{ width: '100%', background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '11px', borderRadius: 11, cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans,sans-serif', boxShadow: '0 0 20px rgba(108,71,255,0.3)' }}>
                Start Exam →
              </button>
            </div>
          ))}
        </div>
      ) : result ? (
        <div style={{ maxWidth: 440, margin: '0 auto', textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ background: '#13131a', border: `1px solid ${result.passed ? 'rgba(0,200,81,0.3)' : 'rgba(255,107,107,0.3)'}`, borderRadius: 20, padding: 36 }}>
            <div style={{ fontSize: 58, marginBottom: 12 }}>{result.passed ? '🎉' : '😔'}</div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 28, margin: '0 0 8px', color: result.passed ? '#00c851' : '#ff6b6b' }}>
              {result.passed ? 'Passed!' : 'Failed'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 8, fontSize: 15 }}>
              Score: <strong style={{ color: '#fff', fontSize: 20 }}>{result.score}</strong> / {result.total}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 22 }}>
              {result.passed ? '🏆 Points added to your scorecard!' : 'Keep practicing and try again!'}
            </p>
            <button onClick={() => setActive(null)} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '11px 28px', borderRadius: 11, cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans,sans-serif' }}>
              Back to Exams
            </button>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, margin: 0 }}>{active.title}</h2>
            <div style={{ background: timeLeft < 300 ? 'rgba(255,107,107,0.15)' : 'rgba(108,71,255,0.15)', border: `1px solid ${timeLeft < 300 ? 'rgba(255,107,107,0.4)' : 'rgba(108,71,255,0.3)'}`, borderRadius: 11, padding: '7px 14px', fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color: timeLeft < 300 ? '#ff6b6b' : '#a78bff' }}>
              ⏱ {mins}:{secs}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {active.questions.map((q, qi) => (
              <div key={qi} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
                <p style={{ fontWeight: 600, fontSize: 15, margin: '0 0 12px', color: '#fff', lineHeight: 1.5 }}>
                  <span style={{ color: '#6c47ff', marginRight: 7 }}>Q{qi + 1}.</span>{q.question}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {q.options.map((opt, oi) => (
                    <button key={oi} onClick={() => setAnswers({ ...answers, [qi]: oi })} style={{
                      textAlign: 'left', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'DM Sans,sans-serif', fontSize: 13,
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
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button onClick={() => setActive(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.5)', padding: '11px 20px', borderRadius: 11, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: 13 }}>
              Cancel
            </button>
            <button onClick={submitExam} style={{ flex: 1, background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '11px', borderRadius: 11, cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans,sans-serif', boxShadow: '0 0 20px rgba(108,71,255,0.3)' }}>
              Submit ({Object.keys(answers).length}/{active.questions.length} answered) →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════
// TRAINING SESSIONS PAGE
// ════════════════════════════════════════
const TrainingPage = () => {
  const sessions = [
    { id: 1, title: 'Full Stack Web Development', mentor: 'Rahul Dev', date: 'Mon, Wed, Fri', time: '7:00 PM - 9:00 PM', duration: '3 months', seats: 12, enrolled: 8, color: '#6c47ff' },
    { id: 2, title: 'Data Science with Python', mentor: 'Arjun Menon', date: 'Tue, Thu', time: '6:00 PM - 8:00 PM', duration: '2 months', seats: 10, enrolled: 10, color: '#ff9500' },
    { id: 3, title: 'UI/UX Design Bootcamp', mentor: 'Priya Nair', date: 'Sat, Sun', time: '10:00 AM - 1:00 PM', duration: '6 weeks', seats: 15, enrolled: 6, color: '#ff3cac' },
    { id: 4, title: 'DevOps & Cloud Engineering', mentor: 'Sarah K', date: 'Mon, Thu', time: '8:00 PM - 10:00 PM', duration: '2 months', seats: 8, enrolled: 5, color: '#00c851' },
  ]

  return (
    <div style={{ padding: 24, overflowY: 'auto' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 28, margin: '0 0 4px' }}>📅 Training Sessions</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontSize: 13 }}>Live mentorship sessions with industry experts</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {sessions.map((s, i) => (
          <div key={s.id} style={{ background: '#13131a', border: `1px solid ${s.color}20`, borderRadius: 16, padding: 20, transition: 'all 0.3s', animation: `fadeUp 0.5s ease ${i * 0.08}s both`, position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = s.color + '50'; e.currentTarget.style.transform = 'translateY(-4px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = s.color + '20'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${s.color},transparent)` }} />
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, margin: '0 0 8px', color: '#fff' }}>{s.title}</h3>
            <p style={{ color: s.color, fontSize: 12, fontWeight: 600, margin: '0 0 12px' }}>👨‍🏫 {s.mentor}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {[
                { icon: '📅', text: s.date },
                { icon: '🕐', text: s.time },
                { icon: '⏱', text: s.duration },
              ].map((item, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                  <span>{item.icon}</span><span>{item.text}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>
                <span>Seats filled</span>
                <span>{s.enrolled}/{s.seats}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 5 }}>
                <div style={{ height: 5, borderRadius: 100, width: `${(s.enrolled / s.seats) * 100}%`, background: s.enrolled >= s.seats ? '#ff6b6b' : s.color }} />
              </div>
            </div>
            <button disabled={s.enrolled >= s.seats} style={{
              width: '100%', padding: '9px', borderRadius: 10, border: 'none', cursor: s.enrolled >= s.seats ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'DM Sans,sans-serif', transition: 'opacity 0.2s',
              background: s.enrolled >= s.seats ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg,${s.color},${s.color}cc)`,
              color: s.enrolled >= s.seats ? 'rgba(255,255,255,0.3)' : '#fff'
            }}>
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
    { icon: '⚗️', title: 'Completed CS Lab', desc: 'Hello World in JS', pts: '+10', time: '2 hours ago', color: '#00d2ff' },
    { icon: '📚', title: 'Course Enrollment', desc: 'React JS Full Course', pts: '—', time: '1 day ago', color: '#6c47ff' },
    { icon: '✅', title: 'Exam Passed', desc: 'JavaScript Fundamentals — Score: 28/30', pts: '+25', time: '2 days ago', color: '#00c851' },
    { icon: '🖥️', title: 'Live Class Attended', desc: 'React Advanced Patterns', pts: '+5', time: '3 days ago', color: '#ff9500' },
    { icon: '🗂️', title: 'Project Started', desc: 'Portfolio Website', pts: '—', time: '4 days ago', color: '#ff3cac' },
    { icon: '🎉', title: 'Joined CyberSquare', desc: 'Welcome to the platform!', pts: '+5', time: '5 days ago', color: '#ff6b6b' },
  ]

  return (
    <div style={{ padding: 24, overflowY: 'auto' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 28, margin: '0 0 4px' }}>⚡ My Activities</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontSize: 13 }}>Track your learning journey and progress</p>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { icon: '🔥', label: 'Day Streak', value: '7', color: '#ff9500' },
          { icon: '⚡', label: 'This Week', value: '12 activities', color: '#6c47ff' },
          { icon: '🏆', label: 'Points Earned', value: `${user?.scorecard?.totalPoints || 0}`, color: '#00c851' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#13131a', border: `1px solid ${s.color}20`, borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 22, color: '#fff' }}>{s.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: 0 }}>Activity Timeline</h3>
        </div>
        {activities.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < activities.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: a.color + '20', border: `1px solid ${a.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {a.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#fff' }}>{a.title}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{a.desc}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              {a.pts !== '—' && <p style={{ margin: 0, color: '#00c851', fontWeight: 700, fontSize: 13 }}>{a.pts} pts</p>}
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// DIGITAL FEST PAGE
// ════════════════════════════════════════
const DigitalFestPage = () => {
  const events = [
    { id: 1, title: 'Hackathon 2026', desc: '24-hour coding challenge. Build something amazing!', date: 'April 15-16, 2026', prize: '₹50,000', type: 'Hackathon', color: '#6c47ff', spots: 50 },
    { id: 2, title: 'UI/UX Design Challenge', desc: 'Design the best user experience for a given problem.', date: 'April 20, 2026', prize: '₹20,000', type: 'Design', color: '#ff3cac', spots: 30 },
    { id: 3, title: 'Tech Quiz Championship', desc: 'Test your tech knowledge against the best students.', date: 'April 25, 2026', prize: '₹10,000', type: 'Quiz', color: '#ff9500', spots: 100 },
    { id: 4, title: 'Open Source Sprint', desc: 'Contribute to open source projects in 48 hours.', date: 'May 1-2, 2026', prize: '₹30,000', type: 'Open Source', color: '#00c851', spots: 40 },
  ]

  return (
    <div style={{ padding: 24, overflowY: 'auto' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,rgba(108,71,255,0.2),rgba(255,60,172,0.15))', border: '1px solid rgba(108,71,255,0.25)', borderRadius: 20, padding: '28px 24px', marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🎪</div>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 32, margin: '0 0 8px', background: 'linear-gradient(135deg,#a78bff,#ff3cac)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          CyberSquare Digital Fest 2026
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 16px', fontSize: 14 }}>Compete, create, and win exciting prizes!</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          <span>📅 April 15 - May 2, 2026</span>
          <span>🏆 Total Prize Pool: ₹1,10,000</span>
          <span>👥 220+ Spots</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 16 }}>
        {events.map((e, i) => (
          <div key={e.id} style={{ background: '#13131a', border: `1px solid ${e.color}20`, borderRadius: 16, padding: 20, transition: 'all 0.3s', animation: `fadeUp 0.5s ease ${i * 0.08}s both`, position: 'relative', overflow: 'hidden' }}
            onMouseEnter={el => { el.currentTarget.style.borderColor = e.color + '50'; el.currentTarget.style.transform = 'translateY(-4px)' }}
            onMouseLeave={el => { el.currentTarget.style.borderColor = e.color + '20'; el.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${e.color},transparent)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ background: e.color + '15', color: e.color, fontSize: 10, padding: '2px 9px', borderRadius: 100, fontWeight: 600 }}>{e.type}</span>
              <span style={{ color: '#ff9500', fontSize: 12, fontWeight: 700 }}>🏆 {e.prize}</span>
            </div>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, margin: '0 0 7px', color: '#fff' }}>{e.title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.6, margin: '0 0 12px' }}>{e.desc}</p>
            <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
              <span>📅 {e.date}</span>
              <span>👥 {e.spots} spots</span>
            </div>
            <button style={{ width: '100%', background: `linear-gradient(135deg,${e.color},${e.color}aa)`, border: 'none', color: '#fff', padding: '9px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
              Register Now →
            </button>
          </div>
        ))}
      </div>
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
  '/student/training': '📅 Training Sessions',
  '/student/activities': '⚡ My Activities',
  '/student/scorecard': '🏆 Scorecard',
  '/student/projects': '🗂️ Projects',
  '/student/digitalfest': '🎪 Digital Fest',
  '/student/live': '🖥️ Live Class Room',
  '/student/exam': '🧪 Lab Exam',
  '/student/exams': '📝 Exams',
}

// ════════════════════════════════════════
// MAIN STUDENT DASHBOARD
// ════════════════════════════════════════
const StudentDashboard = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [enrollments, setEnrollments] = useState([])

  useEffect(() => {
    API.get('/enrollments/my').then(({ data }) => setEnrollments(data)).catch(() => {})
  }, [])

  const sidebarWidth = collapsed ? 64 : 240
  const title = pageTitles[location.pathname] || 'Dashboard'

  return (
    <div style={{
      background: '#07070f',
      minHeight: '100vh',
      color: '#fff',
      fontFamily: "'DM Sans',sans-serif",
      display: 'flex'
    }}>

      {/* Fixed Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div style={{
        marginLeft: sidebarWidth,
        flex: 1,
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100vh',
        overflowY: 'auto'
      }}>
        <TopBar user={user} title={title} />

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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        * { box-sizing: border-box; }
        textarea { caret-color: #a78bff; }
        a { text-decoration: none; }
        nav::-webkit-scrollbar { width: 3px; }
        nav::-webkit-scrollbar-track { background: #0d0d16; }
        nav::-webkit-scrollbar-thumb { background: #6c47ff; border-radius: 10px; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #07070f; }
        ::-webkit-scrollbar-thumb { background: #6c47ff; border-radius: 10px; }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
    </div>
  )
}

export default StudentDashboard