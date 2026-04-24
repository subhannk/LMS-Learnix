import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
      return
    }

    // Redirect based on role
    if (user.role === 'admin') {
      navigate('/admin', { replace: true })
    } else if (user.role === 'instructor') {
      navigate('/instructor', { replace: true })
    } else if (user.role === 'student') {
      navigate('/student', { replace: true })
    } else {
      navigate('/student', { replace: true })
    }
  }, [user, navigate])

  // Loading screen while redirecting
  return (
    <div style={{
      background: '#07070f',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 20,
      fontFamily: "'DM Sans',sans-serif"
    }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '20%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,71,255,0.12) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,107,107,0.08) 0%,transparent 70%)' }} />
      </div>

      {/* Logo */}
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 30, margin: '0 auto 20px', boxShadow: '0 0 40px rgba(108,71,255,0.4)', animation: 'pulse 2s ease infinite' }}>
          C
        </div>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 28, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          Cyber<span style={{ color: '#6c47ff' }}>Square</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, margin: '0 0 32px' }}>
          Welcome back, <strong style={{ color: '#fff' }}>{user?.name?.split(' ')[0]}</strong>!
        </p>

        {/* Animated loader */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#6c47ff', animation: `bounce 1s ease infinite ${i * 0.15}s` }} />
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0 }}>
            Redirecting to your dashboard...
          </p>
        </div>

        {/* Role badge */}
        {user?.role && (
          <div style={{ marginTop: 24, display: 'inline-block', background: user.role === 'admin' ? 'rgba(255,107,107,0.12)' : user.role === 'instructor' ? 'rgba(108,71,255,0.12)' : 'rgba(0,210,255,0.12)', border: `1px solid ${user.role === 'admin' ? 'rgba(255,107,107,0.3)' : user.role === 'instructor' ? 'rgba(108,71,255,0.3)' : 'rgba(0,210,255,0.3)'}`, borderRadius: 100, padding: '6px 18px' }}>
            <span style={{ color: user.role === 'admin' ? '#ff6b6b' : user.role === 'instructor' ? '#a78bff' : '#00d2ff', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
              {user.role === 'admin' ? '🛡️' : user.role === 'instructor' ? '👨‍🏫' : '🎓'} {user.role}
            </span>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(108,71,255,0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(108,71,255,0.6); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}

export default Dashboard