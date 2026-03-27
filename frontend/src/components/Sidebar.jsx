import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const { user } = useAuth()

  const links = {
    admin: [
      { label: '📊 Dashboard', path: '/dashboard' },
      { label: '👥 Manage Users', path: '/admin' },
      { label: '📚 All Courses', path: '/courses' },
    ],
    instructor: [
      { label: '📊 Dashboard', path: '/dashboard' },
      { label: '🎓 My Courses', path: '/instructor' },
    ],
    student: [
      { label: '📊 Dashboard', path: '/dashboard' },
      { label: '📚 Browse Courses', path: '/courses' },
    ],
    moderator: [
      { label: '📊 Dashboard', path: '/dashboard' },
      { label: '✅ Approve Courses', path: '/courses' },
    ],
    content_manager: [
      { label: '📊 Dashboard', path: '/dashboard' },
      { label: '📝 Manage Content', path: '/courses' },
    ],
  }

  const navLinks = links[user?.role] || links.student

  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col py-6 px-4 gap-2">
      <p className="text-xs uppercase text-gray-400 mb-4 tracking-widest">Menu</p>
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
        >
          {link.label}
        </Link>
      ))}
    </aside>
  )
}

export default Sidebar