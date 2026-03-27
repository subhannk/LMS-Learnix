import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const menuItems = [
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

const StudentSidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div style={{
      width: collapsed ? 64 : 240, minHeight: '100vh',
      background: '#0d0d16', borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
      position: 'fixed', top: 0, left: 0, zIndex: 100,
      overflow: 'hidden'
    }}>

      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 16px' : '20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, flexShrink: 0 }}>C</div>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, color: '#fff', whiteSpace: 'nowrap' }}>
              Cyber<span style={{ color: '#6c47ff' }}>Square</span>
            </span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.5)', width: 28, height: 28, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User Profile */}
      {!collapsed && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
            </div>
          </div>
          <div style={{ marginTop: 10, background: 'rgba(108,71,255,0.12)', border: '1px solid rgba(108,71,255,0.25)', borderRadius: 8, padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#a78bff' }}>🏆 {user?.scorecard?.rank || 'Newcomer'}</span>
            <span style={{ fontSize: 11, color: '#6c47ff', fontWeight: 700 }}>{user?.scorecard?.totalPoints || 0} pts</span>
          </div>
        </div>
      )}

      {collapsed && (
        <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 12,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 12, marginBottom: 2, transition: 'all 0.2s',
                background: isActive ? 'rgba(108,71,255,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #6c47ff' : '3px solid transparent',
                cursor: 'pointer'
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && (
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#a78bff' : 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={logout} style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: collapsed ? 0 : 12, padding: collapsed ? '10px 0' : '10px 12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          background: 'transparent', border: 'none', borderRadius: 12,
          cursor: 'pointer', transition: 'all 0.2s', color: 'rgba(255,107,107,0.7)'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.1)'; e.currentTarget.style.color = '#ff6b6b' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,107,107,0.7)' }}
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          {!collapsed && <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default StudentSidebar