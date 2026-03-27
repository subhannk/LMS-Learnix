import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

const tabs = ['Overview', 'Users', 'Courses', 'Approvals', 'Access Control', 'Analytics']

const StatCard = ({ icon, label, value, sub, color, delay = 0 }) => (
  <div style={{
    background: '#13131a', border: `1px solid ${color}25`,
    borderRadius: 20, padding: '24px 28px',
    animation: `fadeUp 0.6s ease ${delay}s both`,
    transition: 'all 0.3s', position: 'relative', overflow: 'hidden'
  }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = color + '60'
      e.currentTarget.style.transform = 'translateY(-4px)'
      e.currentTarget.style.boxShadow = `0 20px 40px ${color}15`
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = color + '25'
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'none'
    }}
  >
    <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: color + '10' }} />
    <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 32, color: '#fff', marginBottom: 4 }}>{value}</div>
    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: sub ? 4 : 0 }}>{label}</div>
    {sub && <div style={{ color, fontSize: 12, fontWeight: 600 }}>{sub}</div>}
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
    if (!window.confirm('Delete this user permanently?')) return
    try {
      await API.delete(`/users/${id}`)
      setUsers(users.filter(u => u._id !== id))
      showMsg('✅ User deleted successfully')
    } catch {
      showMsg('❌ Failed to delete user', 'error')
    }
  }

  const handleRoleChange = async (id, role) => {
    try {
      const { data } = await API.put(`/users/${id}/role`, { role })
      setUsers(users.map(u => u._id === id ? data : u))
      showMsg('✅ Role updated successfully')
    } catch {
      showMsg('❌ Failed to update role', 'error')
    }
  }

  const handleApproveCourse = async (id) => {
    try {
      const { data } = await API.put(`/courses/${id}/approve`)
      setPendingCourses(pendingCourses.filter(c => c._id !== id))
      setCourses([...courses, data])
      showMsg('✅ Course approved and published!')
    } catch {
      showMsg('❌ Failed to approve course', 'error')
    }
  }

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course permanently?')) return
    try {
      await API.delete(`/courses/${id}`)
      setCourses(courses.filter(c => c._id !== id))
      setPendingCourses(pendingCourses.filter(c => c._id !== id))
      showMsg('✅ Course deleted successfully')
    } catch {
      showMsg('❌ Failed to delete course', 'error')
    }
  }

  const handleApproveUser = async (id) => {
    try {
      await API.put(`/users/${id}/approve`)
      setPendingUsers(pendingUsers.filter(u => u._id !== id))
      const { data } = await API.get('/users')
      setUsers(data)
      showMsg('✅ User approved — they can now login!')
    } catch {
      showMsg('❌ Failed to approve user', 'error')
    }
  }

  const handleRejectUser = async (id) => {
    if (!window.confirm('Reject and delete this user?')) return
    try {
      await API.delete(`/users/${id}`)
      setPendingUsers(pendingUsers.filter(u => u._id !== id))
      showMsg('✅ User rejected and removed')
    } catch {
      showMsg('❌ Failed', 'error')
    }
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const roleColors = {
    admin: '#ff6b6b',
    instructor: '#6c47ff',
    student: '#00d2ff',
    moderator: '#ff9500',
    content_manager: '#00c851'
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

      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '5%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,107,107,0.06) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,71,255,0.06) 0%,transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, flexWrap: 'wrap', gap: 16, animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#ff6b6b,#ff9500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🛡️</div>
            <div>
              <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 30, margin: 0, letterSpacing: '-0.5px' }}>Admin Control Center</h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', margin: 0, fontSize: 14 }}>CyberSquare Platform Management</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {pendingUsers.length > 0 && (
              <div onClick={() => setActiveTab('Access Control')} style={{ background: 'rgba(108,71,255,0.12)', border: '1px solid rgba(108,71,255,0.3)', borderRadius: 12, padding: '8px 16px', fontSize: 13, color: '#a78bff', cursor: 'pointer' }}>
                🔐 {pendingUsers.length} access request{pendingUsers.length > 1 ? 's' : ''}
              </div>
            )}
            {pendingCourses.length > 0 && (
              <div onClick={() => setActiveTab('Approvals')} style={{ background: 'rgba(255,149,0,0.12)', border: '1px solid rgba(255,149,0,0.3)', borderRadius: 12, padding: '8px 16px', fontSize: 13, color: '#ff9500', cursor: 'pointer' }}>
                ⚡ {pendingCourses.length} course approval{pendingCourses.length > 1 ? 's' : ''}
              </div>
            )}
            <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 12, padding: '8px 16px', fontSize: 13, color: '#ff6b6b', fontWeight: 600 }}>
              Admin
            </div>
          </div>
        </div>

        {/* Toast notification */}
        {message.text && (
          <div style={{
            position: 'fixed', top: 24, right: 24, zIndex: 999,
            background: message.type === 'error' ? 'rgba(255,107,107,0.15)' : 'rgba(0,200,81,0.15)',
            border: `1px solid ${message.type === 'error' ? 'rgba(255,107,107,0.4)' : 'rgba(0,200,81,0.4)'}`,
            borderRadius: 14, padding: '14px 20px', fontSize: 14,
            color: message.type === 'error' ? '#ff6b6b' : '#00c851',
            backdropFilter: 'blur(20px)', animation: 'fadeUp 0.3s ease both',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 4, border: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', animation: 'fadeUp 0.5s ease 0.1s both' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 13,
              transition: 'all 0.2s',
              background: activeTab === tab ? 'linear-gradient(135deg,#ff6b6b,#ff9500)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
              boxShadow: activeTab === tab ? '0 0 20px rgba(255,107,107,0.3)' : 'none',
              position: 'relative'
            }}>
              {tabIcons[tab]} {tab}
              {tab === 'Approvals' && pendingCourses.length > 0 && (
                <span style={{ marginLeft: 6, background: '#ff9500', color: '#fff', borderRadius: 100, padding: '1px 6px', fontSize: 10 }}>
                  {pendingCourses.length}
                </span>
              )}
              {tab === 'Access Control' && pendingUsers.length > 0 && (
                <span style={{ marginLeft: 6, background: '#6c47ff', color: '#fff', borderRadius: 100, padding: '1px 6px', fontSize: 10 }}>
                  {pendingUsers.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 1s linear infinite' }}>⚙️</div>
            <p>Loading platform data...</p>
          </div>
        ) : (
          <>

            {/* ══════════════ OVERVIEW ══════════════ */}
            {activeTab === 'Overview' && (
              <div style={{ animation: 'fadeIn 0.4s ease both' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 36 }}>
                  <StatCard icon="👥" label="Total Users" value={users.length} sub={`${users.filter(u => u.isApproved).length} approved`} color="#6c47ff" delay={0.1} />
                  <StatCard icon="📚" label="Live Courses" value={courses.length} sub="Published & approved" color="#00d2ff" delay={0.2} />
                  <StatCard icon="⏳" label="Pending Courses" value={pendingCourses.length} sub="Awaiting review" color="#ff9500" delay={0.3} />
                  <StatCard icon="🔐" label="Access Requests" value={pendingUsers.length} sub="Need approval" color="#ff6b6b" delay={0.4} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

                  {/* User distribution */}
                  <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, margin: '0 0 24px' }}>User Distribution</h3>
                    {barData.map((b, i) => (
                      <div key={i} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{b.label}</span>
                          <span style={{ color: b.color, fontWeight: 700 }}>{b.value}</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 8 }}>
                          <div style={{ height: 8, borderRadius: 100, width: `${(b.value / maxBar) * 100}%`, background: b.color, transition: 'width 1s ease' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent users */}
                  <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, margin: '0 0 20px' }}>Recent Users</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {users.slice(0, 5).map((u, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${roleColors[u.role] || '#6c47ff'},#ff6b6b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 14, color: '#fff', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
                          </div>
                          <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 100, background: (roleColors[u.role] || '#6c47ff') + '20', color: roleColors[u.role] || '#6c47ff', border: `1px solid ${(roleColors[u.role] || '#6c47ff')}30`, textTransform: 'capitalize', flexShrink: 0 }}>
                            {u.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div style={{ background: 'linear-gradient(135deg,rgba(255,107,107,0.08),rgba(255,149,0,0.04))', border: '1px solid rgba(255,107,107,0.15)', borderRadius: 20, padding: 24 }}>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, margin: '0 0 16px' }}>Quick Actions</h3>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Manage Users', tab: 'Users', icon: '👥', color: '#6c47ff' },
                      { label: 'Access Control', tab: 'Access Control', icon: '🔐', color: '#ff9500' },
                      { label: 'Approve Courses', tab: 'Approvals', icon: '✅', color: '#00c851' },
                      { label: 'View Analytics', tab: 'Analytics', icon: '📈', color: '#00d2ff' },
                    ].map((a, i) => (
                      <button key={i} onClick={() => setActiveTab(a.tab)} style={{
                        background: a.color + '15', border: `1px solid ${a.color}30`,
                        color: a.color, padding: '10px 20px', borderRadius: 12,
                        cursor: 'pointer', fontSize: 14, fontWeight: 600,
                        fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = a.color + '25'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = a.color + '15'; e.currentTarget.style.transform = 'translateY(0)' }}
                      >
                        {a.icon} {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ USERS ══════════════ */}
            {activeTab === 'Users' && (
              <div style={{ animation: 'fadeIn 0.4s ease both' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, margin: 0 }}>
                    User Management <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }}>({users.length})</span>
                  </h2>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
                    <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
                      style={{ paddingLeft: 40, paddingRight: 16, paddingTop: 10, paddingBottom: 10, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'DM Sans,sans-serif', width: 240 }}
                      onFocus={e => e.target.style.borderColor = 'rgba(255,107,107,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                </div>

                <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                          {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '14px 20px', textAlign: 'left', color: 'rgba(255,255,255,0.35)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u, i) => (
                          <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s', animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '14px 20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${roleColors[u.role] || '#6c47ff'},#ff6b6b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                                  {u.name?.[0]?.toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 600, color: '#fff' }}>{u.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>{u.email}</td>
                            <td style={{ padding: '14px 20px' }}>
                              <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                                style={{ background: (roleColors[u.role] || '#6c47ff') + '15', border: `1px solid ${(roleColors[u.role] || '#6c47ff')}40`, color: roleColors[u.role] || '#6c47ff', padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none', fontFamily: 'DM Sans,sans-serif' }}>
                                {['admin', 'instructor', 'student', 'content_manager', 'moderator'].map(r => (
                                  <option key={r} value={r} style={{ background: '#1a1a24', color: '#fff' }}>{r}</option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: u.isApproved ? 'rgba(0,200,81,0.12)' : 'rgba(255,149,0,0.12)', color: u.isApproved ? '#00c851' : '#ff9500', border: `1px solid ${u.isApproved ? 'rgba(0,200,81,0.25)' : 'rgba(255,149,0,0.25)'}` }}>
                                {u.isApproved ? '● Active' : '○ Pending'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                              {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <button onClick={() => handleDeleteUser(u._id)} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,107,107,0.1)'}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredUsers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>No users found</div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════ COURSES ══════════════ */}
            {activeTab === 'Courses' && (
              <div style={{ animation: 'fadeIn 0.4s ease both' }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, margin: '0 0 20px' }}>
                  All Courses <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }}>({courses.length})</span>
                </h2>
                <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                          {['Course', 'Instructor', 'Category', 'Students', 'Rating', 'Status', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '14px 20px', textAlign: 'left', color: 'rgba(255,255,255,0.35)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((c, i) => (
                          <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s', animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '14px 20px', maxWidth: 200 }}>
                              <p style={{ margin: 0, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</p>
                              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize' }}>{c.level}</p>
                            </td>
                            <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{c.instructor?.name || '—'}</td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{ background: 'rgba(108,71,255,0.15)', color: '#a78bff', fontSize: 11, padding: '3px 10px', borderRadius: 100 }}>{c.category}</span>
                            </td>
                            <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.5)' }}>{c.totalStudents || 0}</td>
                            <td style={{ padding: '14px 20px', color: '#ff9500' }}>⭐ {c.averageRating || 'N/A'}</td>
                            <td style={{ padding: '14px 20px' }}>
                              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: c.isApproved ? 'rgba(0,200,81,0.12)' : 'rgba(255,149,0,0.12)', color: c.isApproved ? '#00c851' : '#ff9500', border: `1px solid ${c.isApproved ? 'rgba(0,200,81,0.25)' : 'rgba(255,149,0,0.25)'}` }}>
                                {c.isApproved ? '✓ Live' : '⏳ Pending'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <button onClick={() => handleDeleteCourse(c._id)} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans,sans-serif' }}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {courses.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>No courses yet</div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════ APPROVALS ══════════════ */}
            {activeTab === 'Approvals' && (
              <div style={{ animation: 'fadeIn 0.4s ease both' }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, margin: '0 0 20px' }}>
                  Course Approvals
                  {pendingCourses.length > 0 && (
                    <span style={{ marginLeft: 12, background: '#ff9500', color: '#fff', borderRadius: 100, padding: '2px 12px', fontSize: 14 }}>
                      {pendingCourses.length}
                    </span>
                  )}
                </h2>

                {pendingCourses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 40px', background: '#13131a', borderRadius: 24, border: '1px dashed rgba(0,200,81,0.3)' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>All clear!</h3>
                    <p style={{ color: 'rgba(255,255,255,0.35)' }}>No courses pending approval.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {pendingCourses.map((c, i) => (
                      <div key={c._id} style={{ background: '#13131a', border: '1px solid rgba(255,149,0,0.2)', borderRadius: 20, padding: 24, animation: `fadeUp 0.5s ease ${i * 0.1}s both` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                              <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 20, margin: 0 }}>{c.title}</h3>
                              <span style={{ background: 'rgba(255,149,0,0.12)', color: '#ff9500', fontSize: 11, padding: '3px 10px', borderRadius: 100, border: '1px solid rgba(255,149,0,0.25)' }}>⏳ Pending</span>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: '0 0 12px', lineHeight: 1.6 }}>
                              {c.description?.slice(0, 150)}{c.description?.length > 150 ? '...' : ''}
                            </p>
                            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap' }}>
                              <span>👨‍🏫 {c.instructor?.name || 'Unknown'}</span>
                              <span>📂 {c.category}</span>
                              <span style={{ textTransform: 'capitalize' }}>📊 {c.level}</span>
                              <span>💰 {c.price === 0 ? 'Free' : `₹${c.price}`}</span>
                              <span>📅 {new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                            <button onClick={() => handleApproveCourse(c._id)} style={{ background: 'linear-gradient(135deg,#00c851,#00a844)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans,sans-serif', boxShadow: '0 0 20px rgba(0,200,81,0.3)', transition: 'all 0.2s' }}
                              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                              ✅ Approve & Publish
                            </button>
                            <button onClick={() => handleDeleteCourse(c._id)} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '10px 20px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'DM Sans,sans-serif' }}>
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══════════════ ACCESS CONTROL ══════════════ */}
            {activeTab === 'Access Control' && (
              <div style={{ animation: 'fadeIn 0.4s ease both' }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, margin: '0 0 8px' }}>
                  🔐 Access Control
                  {pendingUsers.length > 0 && (
                    <span style={{ marginLeft: 12, background: '#6c47ff', color: '#fff', borderRadius: 100, padding: '2px 12px', fontSize: 14 }}>
                      {pendingUsers.length} pending
                    </span>
                  )}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 28, fontSize: 15 }}>
                  Only approved users can login to CyberSquare. Review and approve access requests below.
                </p>

                {pendingUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 40px', background: '#13131a', borderRadius: 24, border: '1px dashed rgba(0,200,81,0.3)' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 8, color: '#fff' }}>All Clear!</h3>
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>No pending access requests right now.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {pendingUsers.map((u, i) => (
                      <div key={u._id} style={{
                        background: '#13131a', border: '1px solid rgba(255,149,0,0.2)',
                        borderRadius: 18, padding: 22,
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', flexWrap: 'wrap', gap: 16,
                        animation: `fadeUp 0.5s ease ${i * 0.08}s both`,
                        transition: 'all 0.3s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(108,71,255,0.4)'; e.currentTarget.style.background = 'rgba(108,71,255,0.04)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,149,0,0.2)'; e.currentTarget.style.background = '#13131a' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 17, color: '#fff' }}>{u.name}</p>
                            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{u.email}</p>
                            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                              <span style={{ background: (roleColors[u.role] || '#6c47ff') + '20', color: roleColors[u.role] || '#6c47ff', fontSize: 11, padding: '2px 10px', borderRadius: 100, textTransform: 'capitalize', fontWeight: 600 }}>
                                {u.role}
                              </span>
                              <span style={{ background: 'rgba(255,149,0,0.12)', color: '#ff9500', fontSize: 11, padding: '2px 10px', borderRadius: 100 }}>
                                ⏳ Pending Approval
                              </span>
                              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                                📅 {new Date(u.createdAt).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={() => handleApproveUser(u._id)} style={{
                            background: 'linear-gradient(135deg,#00c851,#00a844)',
                            border: 'none', color: '#fff', padding: '10px 22px',
                            borderRadius: 10, cursor: 'pointer', fontWeight: 700,
                            fontSize: 14, fontFamily: 'DM Sans,sans-serif',
                            boxShadow: '0 0 20px rgba(0,200,81,0.3)', transition: 'all 0.2s'
                          }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                            ✅ Approve Access
                          </button>
                          <button onClick={() => handleRejectUser(u._id)} style={{
                            background: 'rgba(255,107,107,0.1)',
                            border: '1px solid rgba(255,107,107,0.3)',
                            color: '#ff6b6b', padding: '10px 18px',
                            borderRadius: 10, cursor: 'pointer', fontWeight: 600,
                            fontSize: 14, fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s'
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,107,107,0.1)'}>
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Approved users list */}
                <div style={{ marginTop: 36 }}>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 20, margin: '0 0 16px' }}>
                    Active Users <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>({users.filter(u => u.isApproved).length})</span>
                  </h3>
                  <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                            {['User', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                              <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: 'rgba(255,255,255,0.35)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {users.filter(u => u.isApproved).map((u, i) => (
                            <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <td style={{ padding: '12px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${roleColors[u.role] || '#6c47ff'},#ff6b6b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                                    {u.name?.[0]?.toUpperCase()}
                                  </div>
                                  <span style={{ fontWeight: 600, color: '#fff' }}>{u.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '12px 20px', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{u.email}</td>
                              <td style={{ padding: '12px 20px' }}>
                                <span style={{ background: (roleColors[u.role] || '#6c47ff') + '15', color: roleColors[u.role] || '#6c47ff', fontSize: 11, padding: '3px 10px', borderRadius: 100, textTransform: 'capitalize' }}>{u.role}</span>
                              </td>
                              <td style={{ padding: '12px 20px' }}>
                                <span style={{ background: u.isActive ? 'rgba(0,200,81,0.12)' : 'rgba(255,107,107,0.12)', color: u.isActive ? '#00c851' : '#ff6b6b', fontSize: 11, padding: '3px 10px', borderRadius: 100 }}>
                                  {u.isActive ? '● Active' : '○ Inactive'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 20px' }}>
                                <button onClick={() => handleDeleteUser(u._id)} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans,sans-serif' }}>
                                  Revoke
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ ANALYTICS ══════════════ */}
            {activeTab === 'Analytics' && (
              <div style={{ animation: 'fadeIn 0.4s ease both' }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, margin: '0 0 24px' }}>Platform Analytics</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
                  <StatCard icon="👥" label="Total Users" value={users.length} color="#6c47ff" delay={0.1} />
                  <StatCard icon="✅" label="Approved Users" value={users.filter(u => u.isApproved).length} color="#00c851" delay={0.2} />
                  <StatCard icon="📚" label="Live Courses" value={courses.length} color="#00d2ff" delay={0.3} />
                  <StatCard icon="👨‍🏫" label="Instructors" value={users.filter(u => u.role === 'instructor').length} color="#ff9500" delay={0.4} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* Growth chart */}
                  <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, margin: '0 0 24px' }}>Monthly Growth</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>
                      {[
                        { month: 'Oct', users: 40, courses: 8 },
                        { month: 'Nov', users: 65, courses: 12 },
                        { month: 'Dec', users: 55, courses: 10 },
                        { month: 'Jan', users: 80, courses: 18 },
                        { month: 'Feb', users: 70, courses: 15 },
                        { month: 'Mar', users: 100, courses: 22 },
                      ].map((d, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: '100%', display: 'flex', gap: 3, alignItems: 'flex-end', height: 130 }}>
                            <div style={{ flex: 1, borderRadius: '4px 4px 0 0', height: `${d.users}%`, background: i === 5 ? 'linear-gradient(to top,#6c47ff,#9c47ff)' : 'rgba(108,71,255,0.3)', transition: 'all 0.3s', cursor: 'pointer' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(to top,#6c47ff,#9c47ff)'}
                              onMouseLeave={e => { if (i !== 5) e.currentTarget.style.background = 'rgba(108,71,255,0.3)' }} />
                            <div style={{ flex: 1, borderRadius: '4px 4px 0 0', height: `${d.courses}%`, background: i === 5 ? 'linear-gradient(to top,#00d2ff,#00a8cc)' : 'rgba(0,210,255,0.3)', transition: 'all 0.3s', cursor: 'pointer' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(to top,#00d2ff,#00a8cc)'}
                              onMouseLeave={e => { if (i !== 5) e.currentTarget.style.background = 'rgba(0,210,255,0.3)' }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{d.month}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: '#6c47ff' }} /> Users
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: '#00d2ff' }} /> Courses
                      </div>
                    </div>
                  </div>

                  {/* Platform health */}
                  <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28 }}>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, margin: '0 0 20px' }}>Platform Health</h3>
                    {[
                      { label: 'User Approval Rate', value: users.length > 0 ? Math.round((users.filter(u => u.isApproved).length / users.length) * 100) : 0, color: '#00c851' },
                      { label: 'Course Approval Rate', value: (courses.length + pendingCourses.length) > 0 ? Math.round((courses.length / (courses.length + pendingCourses.length)) * 100) : 0, color: '#6c47ff' },
                      { label: 'Platform Engagement', value: 78, color: '#00d2ff' },
                      { label: 'Content Quality Score', value: 92, color: '#ff9500' },
                    ].map((item, i) => (
                      <div key={i} style={{ marginBottom: 18 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                          <span style={{ color: item.color, fontWeight: 700 }}>{item.value}%</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 8 }}>
                          <div style={{ height: 8, borderRadius: 100, width: `${item.value}%`, background: item.color, transition: 'width 1.2s ease' }} />
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
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        select option { background: #1a1a24; color: #fff; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #07070f; }
        ::-webkit-scrollbar-thumb { background: #ff6b6b; border-radius: 10px; }
      `}</style>
    </div>
  )
}

export default AdminPanel