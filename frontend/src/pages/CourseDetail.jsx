import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

const CourseDetail = () => {
  const { id } = useParams()
  const { state } = useLocation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const course = state?.course
  const [activeLesson, setActiveLesson] = useState(null)
  const [enrolled, setEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [openSection, setOpenSection] = useState(0)
  const [completedLessons, setCompletedLessons] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user && course) {
      API.get('/enrollments/my').then(({ data }) => {
        const found = data.find(e => e.course?._id === course._id || e.course === course._id)
        if (found) { setEnrolled(true); setCompletedLessons(found.completedLessons || []) }
      }).catch(() => {})
    }
  }, [user, course])

  if (!course) return (
    <div style={{ minHeight: '100vh', background: '#07070f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 56 }}>📚</div>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }}>Course not found</p>
      <button onClick={() => navigate('/courses')} style={{ background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '11px 24px', borderRadius: 11, cursor: 'pointer', fontWeight: 700, fontFamily: 'DM Sans,sans-serif', fontSize: 15 }}>
        Back to Courses
      </button>
    </div>
  )

  const totalLessons = course.sections?.reduce((a, s) => a + s.lessons.length, 0) || 0
  const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return }
    setEnrolling(true)
    try {
      await API.post(`/enrollments/${course._id}`)
      setEnrolled(true)
      setMessage('✅ Enrolled successfully!')
      setActiveLesson(course.sections[0]?.lessons[0])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      const msg = err.response?.data?.message || 'Enrollment failed'
      if (msg.includes('Already')) { setEnrolled(true); setMessage('Already enrolled!') }
      else setMessage('❌ ' + msg)
    }
    setEnrolling(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const markComplete = async (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      const updated = [...completedLessons, lessonId]
      setCompletedLessons(updated)
      API.put(`/enrollments/${course._id}/progress`, { lessonId }).catch(() => {})
    }
  }

  return (
    <div style={{ background: '#07070f', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans',sans-serif" }}>

      {activeLesson ? (
        /* VIDEO PLAYER VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          {/* Top bar */}
          <div style={{ background: '#0d0d16', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            <button onClick={() => setActiveLesson(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
              ← Back
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeLesson.title}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{course.title}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 6, width: 120 }}>
                <div style={{ height: 6, borderRadius: 100, width: `${progress}%`, background: 'linear-gradient(90deg,#6c47ff,#9c47ff)', transition: 'width 0.5s' }} />
              </div>
              <span style={{ fontSize: 11, color: '#6c47ff', fontWeight: 700 }}>{progress}%</span>
            </div>
          </div>

          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Video */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ background: '#000', aspectRatio: '16/9', maxHeight: '65vh' }}>
                <iframe src={activeLesson.videoUrl} title={activeLesson.title} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
              </div>
              <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, margin: '0 0 4px' }}>{activeLesson.title}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: 13 }}>⏱ {activeLesson.duration}</p>
                  </div>
                  <button onClick={() => markComplete(activeLesson._id)} style={{
                    padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s',
                    background: completedLessons.includes(activeLesson._id) ? 'rgba(0,200,81,0.15)' : 'linear-gradient(135deg,#6c47ff,#9c47ff)',
                    color: completedLessons.includes(activeLesson._id) ? '#00c851' : '#fff',
                    border: completedLessons.includes(activeLesson._id) ? '1px solid rgba(0,200,81,0.3)' : 'none'
                  }}>
                    {completedLessons.includes(activeLesson._id) ? '✓ Completed' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar playlist */}
            <div style={{ width: 300, background: '#0d0d16', borderLeft: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', flexShrink: 0 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>Course Content</h3>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>{completedLessons.length}/{totalLessons} completed</p>
              </div>
              {course.sections?.map((section, si) => (
                <div key={si}>
                  <button onClick={() => setOpenSection(openSection === si ? -1 : si)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'DM Sans,sans-serif', textAlign: 'left' }}>
                    <span style={{ fontWeight: 600 }}>{section.title}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{openSection === si ? '▲' : '▼'}</span>
                  </button>
                  {openSection === si && section.lessons.map((lesson, li) => (
                    <button key={li} onClick={() => { setActiveLesson(lesson); window.scrollTo({ top: 0 }) }} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: activeLesson?._id === lesson._id ? 'rgba(108,71,255,0.15)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
                      borderLeft: activeLesson?._id === lesson._id ? '3px solid #6c47ff' : '3px solid transparent'
                    }}>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: completedLessons.includes(lesson._id) ? '#00c851' : activeLesson?._id === lesson._id ? '#6c47ff' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', flexShrink: 0, fontWeight: 700 }}>
                        {completedLessons.includes(lesson._id) ? '✓' : li + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lesson.title}</p>
                        <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{lesson.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

      ) : (
        /* COURSE INFO VIEW */
        <div>
          {/* Hero */}
          <div style={{ background: 'linear-gradient(180deg,#0d0d1e 0%,#07070f 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px 40px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <button onClick={() => navigate('/courses')} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.5)', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, marginBottom: 20, fontFamily: 'DM Sans,sans-serif' }}>
                  ← All Courses
                </button>
                <span style={{ background: 'rgba(108,71,255,0.15)', border: '1px solid rgba(108,71,255,0.3)', color: '#a78bff', fontSize: 11, padding: '3px 11px', borderRadius: 100, display: 'inline-block', marginBottom: 14 }}>{course.category}</span>
                <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 'clamp(24px,4vw,42px)', margin: '0 0 12px', lineHeight: 1.2 }}>{course.title}</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.6, margin: '0 0 18px', maxWidth: 560 }}>{course.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>
                  <span>⭐ {course.averageRating}</span>
                  <span>👥 {course.totalStudents?.toLocaleString()} students</span>
                  <span>🎬 {totalLessons} lessons</span>
                  <span>⏱ {course.duration}</span>
                  <span style={{ textTransform: 'capitalize' }}>📊 {course.level}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>By <strong style={{ color: '#fff' }}>{course.instructor?.name}</strong></p>

                {message && (
                  <div style={{ marginTop: 16, background: message.includes('✅') ? 'rgba(0,200,81,0.1)' : 'rgba(255,107,107,0.1)', border: `1px solid ${message.includes('✅') ? 'rgba(0,200,81,0.3)' : 'rgba(255,107,107,0.3)'}`, borderRadius: 10, padding: '10px 14px', fontSize: 14, color: message.includes('✅') ? '#00c851' : '#ff6b6b' }}>
                    {message}
                  </div>
                )}
              </div>

              {/* Enroll card */}
              <div style={{ width: 300, background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', flexShrink: 0 }}>
                <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                <div style={{ padding: '18px 20px' }}>
                  <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 32, color: '#00c851', margin: '0 0 4px' }}>FREE</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 16px' }}>Full lifetime access</p>

                  {enrolled ? (
                    <button onClick={() => { setActiveLesson(course.sections[0]?.lessons[0]); window.scrollTo({ top: 0 }) }} style={{ width: '100%', background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '13px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 15, fontFamily: 'DM Sans,sans-serif', boxShadow: '0 0 30px rgba(108,71,255,0.4)', marginBottom: 12 }}>
                      Continue Learning →
                    </button>
                  ) : (
                    <button onClick={handleEnroll} disabled={enrolling} style={{ width: '100%', background: 'linear-gradient(135deg,#6c47ff,#9c47ff)', border: 'none', color: '#fff', padding: '13px', borderRadius: 12, cursor: enrolling ? 'wait' : 'pointer', fontWeight: 700, fontSize: 15, fontFamily: 'DM Sans,sans-serif', boxShadow: '0 0 30px rgba(108,71,255,0.4)', marginBottom: 12, opacity: enrolling ? 0.7 : 1 }}>
                      {enrolling ? 'Enrolling...' : user ? 'Enroll Now — Free' : 'Login to Enroll'}
                    </button>
                  )}

                  {enrolled && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>
                        <span>Progress</span><span style={{ color: '#6c47ff', fontWeight: 700 }}>{progress}%</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 5 }}>
                        <div style={{ height: 5, borderRadius: 100, width: `${progress}%`, background: 'linear-gradient(90deg,#6c47ff,#9c47ff)' }} />
                      </div>
                    </div>
                  )}

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {[`🎬 ${totalLessons} lessons`, `⏱ ${course.duration}`, '📱 Mobile & desktop', '🏆 Certificate', '♾️ Lifetime access'].map((item, i) => (
                      <li key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Curriculum */}
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 26, margin: '0 0 20px' }}>📋 Course Curriculum</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 20px' }}>{course.sections?.length} sections · {totalLessons} lessons</p>

            {course.sections?.map((section, si) => (
              <div key={si} style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>
                <button onClick={() => setOpenSection(openSection === si ? -1 : si)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', fontFamily: 'DM Sans,sans-serif' }}>
                  <div>
                    <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15 }}>{section.title}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginLeft: 8 }}>({section.lessons.length} lessons)</span>
                  </div>
                  <span style={{ color: '#6c47ff', fontSize: 12 }}>{openSection === si ? '▲' : '▼'}</span>
                </button>
                {openSection === si && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {section.lessons.map((lesson, li) => (
                      <div key={li} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: li < section.lessons.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ width: 24, height: 24, borderRadius: '50%', background: completedLessons.includes(lesson._id) ? '#00c851' : 'rgba(108,71,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', flexShrink: 0, fontWeight: 700 }}>
                          {completedLessons.includes(lesson._id) ? '✓' : li + 1}
                        </span>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{lesson.title}</p>
                          <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>🎬 Video · {lesson.duration}</p>
                        </div>
                        {enrolled ? (
                          <button onClick={() => { setActiveLesson(lesson); window.scrollTo({ top: 0 }) }} style={{ background: 'rgba(108,71,255,0.15)', border: '1px solid rgba(108,71,255,0.3)', color: '#a78bff', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans,sans-serif' }}>
                            Watch
                          </button>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>🔒</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #07070f; }
        ::-webkit-scrollbar-thumb { background: #6c47ff; border-radius: 10px; }
      `}</style>
    </div>
  )
}

export default CourseDetail