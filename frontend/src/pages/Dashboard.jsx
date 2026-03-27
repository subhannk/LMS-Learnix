import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    if (user.role === 'student') navigate('/student', { replace: true })
    else if (user.role === 'instructor') navigate('/instructor', { replace: true })
    else if (user.role === 'admin') navigate('/admin', { replace: true })
    else if (user.role === 'moderator' || user.role === 'content_manager') navigate('/admin', { replace: true })
  }, [user, navigate])

  return (
    <div style={{ background: '#07070f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }}>Redirecting...</div>
    </div>
  )
}

export default Dashboard