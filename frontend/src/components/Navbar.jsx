import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav style={{ background: 'rgba(7,7,15,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, fontFamily: "'DM Sans',sans-serif" }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#fff' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16 }}>C</div>
        <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18 }}>Cyber<span style={{ color: '#6c47ff' }}>Square</span></span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Link to="/courses" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '7px 14px', fontSize: 14, borderRadius: 8, transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = '#fff'}
          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
          Courses
        </Link>

        {user && (
          <Link to="/dashboard" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '7px 14px', fontSize: 14, borderRadius: 8, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
            Dashboard
          </Link>
        )}

        {user?.role === 'instructor' && (
          <Link to="/instructor" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '7px 14px', fontSize: 14, borderRadius: 8 }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
            My Courses
          </Link>
        )}

        {user?.role === 'admin' && (
          <Link to="/admin" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '7px 14px', fontSize: 14, borderRadius: 8 }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
            Admin
          </Link>
        )}

        {user && (
          <span style={{ background: 'rgba(108,71,255,0.15)', border: '1px solid rgba(108,71,255,0.3)', color: '#a78bff', fontSize: 11, padding: '4px 12px', borderRadius: 100, fontWeight: 600, textTransform: 'capitalize', marginLeft: 4 }}>
            {user.role}
          </span>
        )}

        {user ? (
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '7px 16px', borderRadius: 9, cursor: 'pointer', fontSize: 14, marginLeft: 6, transition: 'all 0.2s', fontFamily: 'DM Sans,sans-serif' }}
            onMouseEnter={e => { e.target.style.background = 'rgba(255,59,59,0.1)'; e.target.style.borderColor = 'rgba(255,59,59,0.3)'; e.target.style.color = '#ff6b6b' }}
            onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.color = 'rgba(255,255,255,0.6)' }}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '7px 14px', fontSize: 14, borderRadius: 8 }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
              Login
            </Link>
            <Link to="/register" style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', color: '#fff', textDecoration: 'none', padding: '8px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600, marginLeft: 4 }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar