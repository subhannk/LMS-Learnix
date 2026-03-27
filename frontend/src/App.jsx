import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CourseList from './pages/CourseList'
import CourseDetail from './pages/CourseDetail'
import AdminPanel from './pages/AdminPanel'
import InstructorPanel from './pages/InstructorPanel'
import StudentDashboard from './pages/StudentDashboard'

const hideNavbarPaths = ['/', '/login', '/register']

const Layout = ({ children }) => {
  const location = useLocation()
  const { user } = useAuth()
  const hide = hideNavbarPaths.includes(location.pathname) ||
    (!user && location.pathname === '/courses') ||
    location.pathname.startsWith('/student')
  return <>{!hide && <Navbar />}{children}</>
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>
            } />
            <Route path="/instructor" element={
              <ProtectedRoute roles={['instructor', 'admin']}><InstructorPanel /></ProtectedRoute>
            } />
            <Route path="/student/*" element={
              <ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App