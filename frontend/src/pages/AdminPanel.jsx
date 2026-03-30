import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

const tabs = ['Overview', 'Users', 'Courses', 'Approvals', 'Access Control', 'Analytics']

const StatCard = ({ icon, label, value, sub, color, delay = 0 }) => (
  <div style={{
    background: '#13131a', border: `1px solid ${color}25`,
    borderRadius: 16, padding: '18px 20px',
    animation: `fadeUp 0.6s ease ${delay}s both`,
    transition: 'all 0.3s', position: 'relative', overflow: 'hidden'
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color + '60'; e.currentTarget.style.transform = 'translateY(-3px)' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = color + '25'; e.currentTarget.style.transform = 'translateY(0)' }}
  >
    <div style={{ position: 'absolute', top: -15, right: -15, width: 60, height: 60, borderRadius: '50%', background: color + '15' }} />
    <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 26, color: '#fff', marginBottom: 3 }}>{value}</div>
    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: sub ? 3 : 0 }}>{label}</div>
    {sub && <div style={{ color, fontSize: 11, fontWeight: 600 }}>{sub}</div>}
  </div>
)

const AdminPanel = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Overview')
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [pendingCourses, setPendingCourses] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [tabMenuOpen, setTabMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  useEffect(() => {
    Promise.all([
      API.get('/users'),
      API.get('/courses'),
      API.get('/courses/admin/pending'),
      API.get('/users/pending')
    ]).then(([u, c, p, pu]) => {
      setUsers(u.data)
      setCourses(c.data)
      setPendingCourses(p.data)
      setPendingUsers(pu.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await API.delete(`/users/${id}`)
      setUsers(users.filter(u => u._id !== id))
      showMsg('✅ User deleted')
    } catch { showMsg('❌ Failed', 'error') }
  }

  const handleRoleChange = async (id, role) => {
    try {
      const { data } = await API.put(`/users/${id}/role`, { role })
      setUsers(users.map(u => u._id === id ? data : u))
      showMsg('✅ Role updated')
    } catch { showMsg('❌ Failed', 'error') }
  }

  const handleApproveCourse = async (id) => {
    try {
      const { data } = await API.put(`/courses/${id}/approve`)
      setPendingCourses(pendingCourses.filter(c => c._id !== id))
      setCourses([...courses, data])
      showMsg('✅ Course approved!')
    } catch { showMsg('❌ Failed', 'error') }
  }

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return
    try {
      await API.delete(`/courses/${id}`)
      setCourses(courses.filter(c => c._id !== id))
      setPendingCourses(pendingCourses.filter(c => c._id !== id))
      showMsg('✅ Course deleted')
    } catch { showMsg('❌ Failed', 'error') }
  }

  const handleApproveUser = async (id) => {
    try {
      await API.put(`/users/${id}/approve`)
      setPendingUsers(pendingUsers.filter(u => u._id !== id))
      const { data } = await API.get('/users')
      setUsers(data)
      showMsg('✅ User approved!')
    } catch { showMsg('❌ Failed', 'error') }
  }

  const handleRejectUser = async (id) => {
    if (!window.confirm('Reject this user?')) return
    try {
      await API.delete(`/users/${id}`)
      setPendingUsers(pendingUsers.filter(u => u._id !== id))
      showMsg('✅ User rejected')
    } catch { showMsg('❌ Failed', 'error') }
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const roleColors = {
    admin: '#ff6b6b', instructor: '#6c47ff',
    student: '#00d2ff', moderator: '#ff9500', content_manager: '#00c851'
  }

  const barData = [
    { label: 'Students', value: users.filter(u => u.role === 'student').length, color: '#00d2ff' },
    { label: 'Instructors', value: users.filter(u => u.role === 'instructor').length, color: '#6c47ff' },
    { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#ff6b6b' },
    { label: 'Moderators', value: users.filter(u => u.role === 'moderator').length, color: '#ff9500' },
  ]
  const maxBar = Math.max(...barData.map(b => b.value), 1)

  const tabIcons = {
    Overview: '📊', Users: '👥', Courses: '📚',
    Approvals: '✅', 'Access Control': '🔐', Analytics: '📈'
  }

  return (
    <div style={{ background: '#07070f', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans',sans-serif" }}>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '5%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,107,107,0.06) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,71,255,0.06) 0%,transparent 70%)' }} />
      </div>

      {/* Toast */}
      {message.text && (
        <div style={{ position: 'fixed', top: 16, right: 16, left: 16, zIndex: 999, background: message.type === 'error' ? 'rgba(255,107,107,0.15)' : 'rgba(0,200,81,0.15)', border: `1px solid ${message.type === 'error' ? 'rgba(255,107,107,0.4)' : 'rgba(0,200,81,0.4)'}`, borderRadius: 12, padding: '12px 16px', fontSize: 14, color: message.type === 'error' ? '#ff6b6b' : '#00c851', backdropFilter: 'blur(20px)', animation: 'fadeUp 0.3s ease both', textAlign: 'center' }}>
          {message.text}
        </div>
      )}

      <div style={{ position: 'relative', maxWidth: 1300, margin: '0 auto', padding: isMobile ? '16px 12px' : '28px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12, animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#ff6b6b,#ff9500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛡️</div>
            <div>
              <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: isMobile ? 20 : 26, margin: 0, letterSpacing: '-0.5px' }}>Admin Center</h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', margin: 0, fontSize: 12 }}>CyberSquare Management</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {pendingUsers.length > 0 && (
              <div onClick={() => setActiveTab('Access Control')} style={{ background: 'rgba(108,71,255,0.12)', border: '1px solid rgba(108,71,255,0.3)', borderRadius: 10, padding: '6px 12px', fontSize: 12, color: '#a78bff', cursor: 'pointer' }}>
                🔐 {pendingUsers.length} requests
              </div>
            )}
            {pendingCourses.length > 0 && (
              <div onClick={() => setActiveTab('Approvals')} style={{ background: 'rgba(255,149,0,0.12)', border: '1px solid rgba(255,149,0,0.3)', borderRadius: 10, padding: '6px 12px', fontSize: 12, color: '#ff9500', cursor: 'pointer' }}>
                ⚡ {pendingCourses.length} approvals
              </div>
            )}
          </div>
        </div>

        {/* Tabs - Mobile dropdown OR Desktop pills */}
        {isMobile ? (
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <button onClick={() => setTabMenuOpen(!tabMenuOpen)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: 14, fontWeight: 600 }}>
              <span>{tabIcons[activeTab]} {activeTab}</span>
              <span style={{ fontSize: 12 }}>{tabMenuOpen ? '▲' : '▼'}</span>
            </button>
            {tabMenuOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#13131a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, zIndex: 50, overflow: 'hidden', marginTop: 4 }}>
                {tabs.map(tab => (
                  <button key={tab} onClick={() => { setActiveTab(tab); setTabMenuOpen(false) }} style={{ width: '100%', padding: '12px 16px', background: activeTab === tab ? 'rgba(255,107,107,0.15)' : 'transparent', border: 'none', color: activeTab === tab ? '#ff6b6b' : 'rgba(255,255,255,0.6)', textAlign: 'left', cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans,sans-serif', fontWeight: activeTab === tab ? 600 : 400, borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{tabIcons[tab]} {tab}</span>
                    {tab === 'Approvals' && pendingCourses.length > 0 && <span style={{ background: '#ff9500', color: '#fff', borderRadius: 100, padding: '1px 8px', fontSize: 10 }}>{pendingCourses.length}</span>}
                    {tab === 'Access Control' && pendingUsers.length > 0 && <span style={{ background: '#6c47ff', color: '#fff', borderRadius: 100, padding: '1px 8px', fontSize: 10 }}>{pendingUsers.length}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 4, border: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', animation: 'fadeUp 0.5s ease 0.1s both' }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', background: activeTab === tab ? 'linear-gradient(135deg,#ff6b6b,#ff9500)' : 'transparent', color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)', boxShadow: activeTab === tab ? '0 0 20px rgba(255,107,107,0.3)' : 'none', position: 'relative' }}>
                {tabIcons[tab]} {tab}
                {tab === 'Approvals' && pendingCourses.length > 0 && <span style={{ marginLeft: 5, background: '#ff9500', color: '#fff', borderRadius: 100, padding: '1px 6px', fontSize: 10 }}>{pendingCourses.length}</span>}
                {tab === 'Access Control' && pendingUsers.length > 0 && <span style={{ marginLeft: 5, background: '#6c47ff', color: '#fff', borderRadius: 100, padding: '1px 6px', fontSize: 10 }}>{pendingUsers.length}</span>}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>⚙️</div>
            <p>Loading platform data...</p>
          </div>
        ) : (
          <>
            {/* ══ OVERVIEW ══ */}
            {activeTab === 'Overview' && (
              <div style={{ animation: 'fadeIn 0.4s ease both' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
                  <StatCard icon="👥" label="Total Users" value={users.length} sub={`${users.filter(u => u.isApproved).length} approved`} color="#6c47ff" delay={0.1} />
                  <StatCard icon="📚" label="Live Courses" value={courses.length} color="#00d2ff" delay={0.2} />
                  <StatCard icon="⏳" label="Pending Courses" value={pendingCourses.length} color="#ff9500" delay={0.3} />
                  <StatCard icon="🔐" label="Access Requests" value={pendingUsers.length} color="#ff6b6b" delay={0.4} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 16px' }}>User Distribution</h3>
                    {barData.map((b, i) => (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{b.label}</span>
                          <span style={{ color: b.color, fontWeight: 700 }}>{b.value}</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 7 }}>
                          <div style={{ height: 7, borderRadius: 100, width: `${(b.value / maxBar) * 100}%`, background: b.color, transition: 'width 1s ease' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 16px' }}>Recent Users</h3>
                    {users.slice(0, 4).map((u, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${roleColors[u.role] || '#6c47ff'},#ff6b6b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, color: '#fff', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                          <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
                        </div>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: (roleColors[u.role] || '#6c47ff') + '20', color: roleColors[u.role] || '#6c47ff', flexShrink: 0, textTransform: 'capitalize' }}>{u.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg,rgba(255,107,107,0.08),rgba(255,149,0,0.04))', border: '1px solid rgba(255,107,107,0.15)', borderRadius: 16, padding: 18 }}>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, margin: '0 0 12px' }}>Quick Actions</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                    {[
                      { label: 'Manage Users', tab: 'Users', icon: '👥', color: '#6c47ff' },
                      { label: 'Access Control', tab: 'Access Control', icon: '🔐', color: '#ff9500' },
                      { label: 'Approve Courses', tab: 'Approvals', icon: '✅', color: '#00c851' },
                      { label: 'Analytics', tab: 'Analytics', icon: '📈', color: '#00d2ff' },
                    ].map((a, i) => (
                      <button key={i} onClick={() => setActiveTab(a.tab)} style={{ background: a.color + '15', border: `1px solid ${a.color}30`, color: a.color, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s', textAlign: 'left' }}>
                        {a.icon} {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ USERS ══ */}
            {activeTab === 'Users' && (
              <div style={{ animation: 'fadeIn 0.4s ease both' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, margin: 0 }}>
                    Users <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>({users.length})</span>
                  </h2>
                  <input placeholder="🔍 Search users..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ padding: '9px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'DM Sans,sans-serif', width: isMobile ? '100%' : 220 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(255,107,107,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>

                {isMobile ? (
                  // Mobile: Card list
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filteredUsers.map((u, i) => (
                      <div key={u._id} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${roleColors[u.role] || '#6c47ff'},#ff6b6b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 600, color: '#fff', fontSize: 14 }}>{u.name}</p>
                            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} style={{ background: (roleColors[u.role] || '#6c47ff') + '15', border: `1px solid ${(roleColors[u.role] || '#6c47ff')}40`, color: roleColors[u.role] || '#6c47ff', padding: '5px 8px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none', fontFamily: 'DM Sans,sans-serif', flex: 1 }}>
                            {['admin', 'instructor', 'student', 'content_manager', 'moderator'].map(r => (
                              <option key={r} value={r} style={{ background: '#1a1a24', color: '#fff' }}>{r}</option>
                            ))}
                          </select>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 100, background: u.isApproved ? 'rgba(0,200,81,0.12)' : 'rgba(255,149,0,0.12)', color: u.isApproved ? '#00c851' : '#ff9500' }}>
                            {u.isApproved ? '● Active' : '○ Pending'}
                          </span>
                          <button onClick={() => handleDeleteUser(u._id)} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans,sans-serif' }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Desktop: Table
                  <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                            {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.35)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((u, i) => (
                            <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${roleColors[u.role] || '#6c47ff'},#ff6b6b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                                    {u.name?.[0]?.toUpperCase()}
                                  </div>
                                  <span style={{ fontWeight: 600, color: '#fff' }}>{u.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{u.email}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} style={{ background: (roleColors[u.role] || '#6c47ff') + '15', border: `1px solid ${(roleColors[u.role] || '#6c47ff')}40`, color: roleColors[u.role] || '#6c47ff', padding: '4px 8px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', outline: 'none', fontFamily: 'DM Sans,sans-serif' }}>
                                  {['admin', 'instructor', 'student', 'content_manager', 'moderator'].map(r => (
                                    <option key={r} value={r} style={{ background: '#1a1a24', color: '#fff' }}>{r}</option>
                                  ))}
                                </select>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: u.isApproved ? 'rgba(0,200,81,0.12)' : 'rgba(255,149,0,0.12)', color: u.isApproved ? '#00c851' : '#ff9500' }}>
                                  {u.isApproved ? '● Active' : '○ Pending'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                                {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <button onClick={() => handleDeleteUser(u._id)} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '5px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontFamily: 'DM Sans,sans-serif' }}>Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {filteredUsers.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.3)' }}>No users found</div>}
                  </div>
                )}
              </div>
            )}

            {/* ══ COURSES ══ */}
            {activeTab === 'Courses' && (
              <div style={{ animation: 'fadeIn 0.4s ease both' }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, margin: '0 0 16px' }}>
                  All Courses <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>({courses.length})</span>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {courses.map((c, i) => (
                    <div key={c._id} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#fff', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{c.instructor?.name} · {c.category} · {c.level}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: c.isApproved ? 'rgba(0,200,81,0.12)' : 'rgba(255,149,0,0.12)', color: c.isApproved ? '#00c851' : '#ff9500' }}>
                          {c.isApproved ? '✓ Live' : '⏳ Pending'}
                        </span>
                        <button onClick={() => handleDeleteCourse(c._id)} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '5px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontFamily: 'DM Sans,sans-serif' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>No courses yet</div>}
                </div>
              </div>
            )}

            {/* ══ APPROVALS ══ */}
            {activeTab === 'Approvals' && (
              <div style={{ animation: 'fadeIn 0.4s ease both' }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, margin: '0 0 16px' }}>
                  Course Approvals
                  {pendingCourses.length > 0 && <span style={{ marginLeft: 10, background: '#ff9500', color: '#fff', borderRadius: 100, padding: '2px 10px', fontSize: 13 }}>{pendingCourses.length}</span>}
                </h2>
                {pendingCourses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', background: '#13131a', borderRadius: 18, border: '1px dashed rgba(0,200,81,0.3)' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>No pending approvals!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pendingCourses.map((c, i) => (
                      <div key={c._id} style={{ background: '#13131a', border: '1px solid rgba(255,149,0,0.2)', borderRadius: 16, padding: 18, animation: `fadeUp 0.5s ease ${i * 0.08}s both` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, margin: '0 0 6px' }}>{c.title}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 10px', lineHeight: 1.5 }}>
                              {c.description?.slice(0, 100)}{c.description?.length > 100 ? '...' : ''}
                            </p>
                            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap' }}>
                              <span>👨‍🏫 {c.instructor?.name}</span>
                              <span>📂 {c.category}</span>
                              <span style={{ textTransform: 'capitalize' }}>📊 {c.level}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                            <button onClick={() => handleApproveCourse(c._id)} style={{ background: 'linear-gradient(135deg,#00c851,#00a844)', border: 'none', color: '#fff', padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>✅ Approve</button>
                            <button onClick={() => handleDeleteCourse(c._id)} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '9px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>❌</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ ACCESS CONTROL ══ */}
            {activeTab === 'Access Control' && (
              <div style={{ animation: 'fadeIn 0.4s ease both' }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, margin: '0 0 6px' }}>
                  🔐 Access Control
                  {pendingUsers.length > 0 && <span style={{ marginLeft: 10, background: '#6c47ff', color: '#fff', borderRadius: 100, padding: '2px 10px', fontSize: 13 }}>{pendingUsers.length}</span>}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 16, fontSize: 13 }}>Approve or reject user login access</p>

                {pendingUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', background: '#13131a', borderRadius: 16, border: '1px dashed rgba(0,200,81,0.3)', marginBottom: 20 }}>
                    <div style={{ fontSize: 44, marginBottom: 10 }}>✅</div>
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>No pending requests!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {pendingUsers.map((u, i) => (
                      <div key={u._id} style={{ background: '#13131a', border: '1px solid rgba(255,149,0,0.2)', borderRadius: 14, padding: 16, animation: `fadeUp 0.5s ease ${i * 0.07}s both` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#fff' }}>{u.name}</p>
                            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
                            <span style={{ fontSize: 11, color: '#ff9500', textTransform: 'capitalize' }}>Role: {u.role}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleApproveUser(u._id)} style={{ flex: 1, background: 'linear-gradient(135deg,#00c851,#00a844)', border: 'none', color: '#fff', padding: '10px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
                            ✅ Approve
                          </button>
                          <button onClick={() => handleRejectUser(u._id)} style={{ flex: 1, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '10px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, margin: '0 0 12px' }}>
                  Active Users <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>({users.filter(u => u.isApproved).length})</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {users.filter(u => u.isApproved).map((u, i) => (
                    <div key={u._id} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${roleColors[u.role] || '#6c47ff'},#ff6b6b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#fff', fontSize: 13 }}>{u.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
                      </div>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: (roleColors[u.role] || '#6c47ff') + '15', color: roleColors[u.role] || '#6c47ff', flexShrink: 0, textTransform: 'capitalize' }}>{u.role}</span>
                      <button onClick={() => handleDeleteUser(u._id)} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '4px 10px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontFamily: 'DM Sans,sans-serif', flexShrink: 0 }}>Revoke</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ ANALYTICS ══ */}
            {activeTab === 'Analytics' && (
              <div style={{ animation: 'fadeIn 0.4s ease both' }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, margin: '0 0 16px' }}>Platform Analytics</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
                  <StatCard icon="👥" label="Total Users" value={users.length} color="#6c47ff" delay={0.1} />
                  <StatCard icon="✅" label="Approved" value={users.filter(u => u.isApproved).length} color="#00c851" delay={0.2} />
                  <StatCard icon="📚" label="Live Courses" value={courses.length} color="#00d2ff" delay={0.3} />
                  <StatCard icon="👨‍🏫" label="Instructors" value={users.filter(u => u.role === 'instructor').length} color="#ff9500" delay={0.4} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                  <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 20px' }}>Monthly Growth</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
                      {[
                        { month: 'Oct', users: 40 }, { month: 'Nov', users: 65 },
                        { month: 'Dec', users: 55 }, { month: 'Jan', users: 80 },
                        { month: 'Feb', users: 70 }, { month: 'Mar', users: 100 },
                      ].map((d, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: '100%', borderRadius: '4px 4px 0 0', height: `${d.users}%`, background: i === 5 ? 'linear-gradient(to top,#6c47ff,#9c47ff)' : 'rgba(108,71,255,0.3)', transition: 'all 0.3s', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(to top,#6c47ff,#9c47ff)'}
                            onMouseLeave={e => { if (i !== 5) e.currentTarget.style.background = 'rgba(108,71,255,0.3)' }} />
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{d.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 16px' }}>Platform Health</h3>
                    {[
                      { label: 'User Approval Rate', value: users.length > 0 ? Math.round((users.filter(u => u.isApproved).length / users.length) * 100) : 0, color: '#00c851' },
                      { label: 'Course Approval Rate', value: (courses.length + pendingCourses.length) > 0 ? Math.round((courses.length / (courses.length + pendingCourses.length)) * 100) : 0, color: '#6c47ff' },
                      { label: 'Platform Engagement', value: 78, color: '#00d2ff' },
                      { label: 'Content Quality', value: 92, color: '#ff9500' },
                    ].map((item, i) => (
                      <div key={i} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                          <span style={{ color: item.color, fontWeight: 700 }}>{item.value}%</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 7 }}>
                          <div style={{ height: 7, borderRadius: 100, width: `${item.value}%`, background: item.color, transition: 'width 1.2s ease' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        select option { background: #1a1a24; color: #fff; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #07070f; }
        ::-webkit-scrollbar-thumb { background: #ff6b6b; border-radius: 10px; }
        @media (max-width: 768px) { * { -webkit-tap-highlight-color: transparent; } }
      `}</style>
    </div>
  )
}

export default AdminPanel