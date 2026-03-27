import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await API.post('/auth/login', form)
      login(data); navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-700 rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-700 rounded-full opacity-10 blur-3xl animate-pulse" style={{animationDelay:'1s'}} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center font-bold">L</div>
            <span className="font-black text-2xl text-[var(--text-primary)]" style={{fontFamily:'Syne'}}>LearnHub</span>
          </Link>
          <h1 className="text-4xl font-black text-[var(--text-primary)] mb-2" style={{fontFamily:'Syne'}}>Welcome back</h1>
          <p className="text-[var(--text-secondary)]">Sign in to continue learning</p>
        </div>

        <div className="glass rounded-3xl p-8">
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Email</label>
              <input type="email" placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition text-sm"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Password</label>
              <input type="password" placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition text-sm"
                value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:opacity-90 transition glow-btn mt-2">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">Create one free</Link>
        </p>
      </div>
    </div>
  )
}

export default Login