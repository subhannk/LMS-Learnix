import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'

const Register = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await API.post('/auth/register', form)
      if (data.pending) setPending(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
    setLoading(false)
  }

  if (pending) return (
    <div style={{ minHeight: '100vh', background: '#07070f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: 24 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>⏳</div>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 32, color: '#fff', marginBottom: 12 }}>Account Submitted!</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 28, lineHeight: 1.7 }}>
          Your account is pending admin approval. You'll receive access once an admin activates your account.
        </p>
        <Link to="/login" style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', color: '#fff', textDecoration: 'none', padding: '14px 32px', borderRadius: 14, fontWeight: 700, fontSize: 16 }}>
          Go to Login →
        </Link>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@900&family=DM+Sans:wght@400;500&display=swap');`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '20%', right: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,71,255,0.1) 0%,transparent 70%)' }} />
      </div>
      <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#fff', marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20 }}>C</div>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22 }}>Cyber<span style={{ color: '#6c47ff' }}>Square</span></span>
          </Link>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 36, margin: '0 0 8px', color: '#fff' }}>Create Account</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>Join 50,000+ learners at CyberSquare</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32 }}>
          {error && (
            <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#ff6b6b', fontSize: 14 }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })} required
                  style={{ width: '100%', padding: '13px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans,sans-serif' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(108,71,255,0.7)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>I want to</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                style={{ width: '100%', padding: '13px 16px', borderRadius: 12, background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans,sans-serif' }}>
                <option value="student">Learn as a Student</option>
                <option value="instructor">Teach as an Instructor</option>
              </select>
            </div>
            <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', marginTop: 4, boxShadow: '0 0 30px rgba(108,71,255,0.4)' }}>
              {loading ? 'Creating...' : 'Create Account →'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#a78bff', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap'); input::placeholder,select option{color:rgba(255,255,255,0.25);} select option{background:#1a1a24;}`}</style>
    </div>
  )
}

export default Register