import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav style={{
      background: 'var(--bg-color)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '14px 32px', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center',
      position: 'sticky', top: 0, zIndex: 50,
      transition: 'all 0.3s ease'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--text-primary)' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: 16
        }}>C</div>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20 }}>
          Cyber<span style={{ color: '#6c47ff' }}>Square</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Link to="/courses" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '8px 14px', fontSize: 14, borderRadius: 8, transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = '#fff'}
          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
          Courses
        </Link>

        {user && (
          <Link to="/dashboard" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '8px 14px', fontSize: 14, borderRadius: 8, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
            Dashboard
          </Link>
        )}

        {user?.role === 'instructor' && (
          <Link to="/instructor" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '8px 14px', fontSize: 14, borderRadius: 8, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
            My Courses
          </Link>
        )}

        {user?.role === 'admin' && (
          <Link to="/admin" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '8px 14px', fontSize: 14, borderRadius: 8, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
            Admin
          </Link>
        )}

        {user && (
          <span style={{
            background: 'rgba(108,71,255,0.15)',
            border: '1px solid rgba(108,71,255,0.3)',
            color: '#a78bff', fontSize: 12,
            padding: '4px 12px', borderRadius: 100,
            fontWeight: 600, textTransform: 'capitalize', marginLeft: 4
          }}>
            {user.role}
          </span>
        )}

        <ThemeToggle />
        <button onClick={handleLogout} style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'var(--text-secondary)', padding: '8px 18px',
          borderRadius: 10, cursor: 'pointer', fontSize: 14,
          marginLeft: 6, transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif'
        }}
          onMouseEnter={e => { e.target.style.background = 'rgba(255,59,59,0.1)'; e.target.style.borderColor = 'rgba(255,59,59,0.3)'; e.target.style.color = '#ff6b6b' }}
          onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.color = 'var(--text-secondary)' }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar