import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CourseDetail = () => {
  const { id } = useParams()
  const { state } = useLocation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const course = state?.course
  const [activeLesson, setActiveLesson] = useState(null)
  const [enrolled, setEnrolled] = useState(false)
  const [openSection, setOpenSection] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [completedLessons, setCompletedLessons] = useState([])

  useEffect(() => { setMounted(true) }, [])

  if (!course) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">📚</p>
        <p className="text-gray-400 text-xl mb-6">Course not found</p>
        <button onClick={() => navigate('/courses')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold">
          Back to Courses
        </button>
      </div>
    </div>
  )

  const totalLessons = course.sections.reduce((a, s) => a + s.lessons.length, 0)
  const progress = Math.round((completedLessons.length / totalLessons) * 100)

  const handleEnroll = () => {
    if (!user) { navigate('/login'); return }
    setEnrolled(true)
    setActiveLesson(course.sections[0].lessons[0])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const markComplete = (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId])
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-white transition-colors duration-300">

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-[100px]" />
      </div>

      {activeLesson ? (
        /* ── VIDEO PLAYER VIEW ── */
        <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">

          {/* Main video */}
          <div className="flex-1 p-4 lg:p-6">
            {/* Back */}
            <button onClick={() => setActiveLesson(null)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-4 text-sm">
              ← Back to Course
            </button>

            {/* Video */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/30 mb-4 bg-black">
              <iframe
                src={activeLesson.videoUrl}
                title={activeLesson.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>

            {/* Lesson info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xl shadow-indigo-500/5">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-syne font-black text-slate-900 dark:text-white leading-tight uppercase mb-1">
                    {activeLesson.title}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium italic">⏱ {activeLesson.duration} • {course.title}</p>
                </div>
                <button
                  onClick={() => markComplete(activeLesson._id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    completedLessons.includes(activeLesson._id)
                      ? 'bg-green-900/50 text-green-400 border border-green-500/30'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                  }`}
                >
                  {completedLessons.includes(activeLesson._id) ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>

              {/* Progress bar */}
              {enrolled && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Course Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                      style={{width:`${progress}%`}}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar playlist */}
          <div className="w-full lg:w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-white/5 overflow-y-auto lg:max-h-screen transition-colors">
            <div className="p-6 border-b border-slate-200 dark:border-white/5">
              <h3 className="font-syne font-black text-sm text-slate-900 dark:text-white uppercase tracking-widest">Course Content</h3>
              <p className="text-slate-500 dark:text-slate-500 text-xs mt-1 font-bold">{completedLessons.length}/{totalLessons} COMPLETED</p>
            </div>
            {course.sections.map((section, si) => (
              <div key={si}>
                <button
                  onClick={() => setOpenSection(openSection === si ? -1 : si)}
                  className="w-full flex justify-between items-center px-4 py-3 hover:bg-white/5 transition text-left border-b border-white/5"
                >
                  <span className="text-sm font-semibold text-gray-300">{section.title}</span>
                  <span className="text-gray-500 text-xs">{openSection === si ? '▲' : '▼'}</span>
                </button>
                {openSection === si && section.lessons.map((lesson, li) => (
                  <button
                    key={li}
                    onClick={() => { setActiveLesson(lesson); window.scrollTo({top:0,behavior:'smooth'}) }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition border-b border-white/5 ${
                      activeLesson?._id === lesson._id
                        ? 'bg-purple-900/30 border-l-2 border-l-purple-500'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                      completedLessons.includes(lesson._id)
                        ? 'bg-green-500 text-white'
                        : activeLesson?._id === lesson._id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-400'
                    }`}>
                      {completedLessons.includes(lesson._id) ? '✓' : li + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 truncate">{lesson.title}</p>
                      <p className="text-xs text-gray-600">{lesson.duration}</p>
                    </div>
                    {activeLesson?._id === lesson._id && (
                      <span className="text-purple-400 text-xs">▶</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

      ) : (
        /* ── COURSE INFO VIEW ── */
        <div className="relative z-10">
          {/* Hero */}
          <div className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${course.color || 'from-purple-900 to-pink-900'} opacity-20`} />
            <div className="relative px-6 py-16 max-w-6xl mx-auto">
              <div className={`animate-fadeUp ${mounted?'':'opacity-0'}`}>
                <span className="glass text-xs px-3 py-1 rounded-full text-purple-300 mb-4 inline-block">
                  {course.category}
                </span>
                <h1 className="text-4xl md:text-6xl font-black mb-4 max-w-3xl leading-tight"
                  style={{fontFamily:'Syne'}}>
                  {course.title}
                </h1>
                <p className="text-gray-400 text-lg mb-6 max-w-2xl">{course.description}</p>
                <div className="flex flex-wrap gap-6 text-sm text-gray-300 mb-6">
                  <span>⭐ {course.averageRating} rating</span>
                  <span>👥 {course.totalStudents?.toLocaleString()} students</span>
                  <span>🎬 {totalLessons} lessons</span>
                  <span>⏱ {course.duration}</span>
                  <span className="capitalize">📊 {course.level}</span>
                </div>
                <p className="text-gray-500 text-sm">
                  By <span className="text-white font-semibold">{course.instructor?.name}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">

            {/* Left */}
            <div className="flex-1">
              {/* What you learn */}
              <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-8 mb-8 shadow-xl shadow-indigo-500/5 animate-fadeUp ${mounted?'':'opacity-0'}`}>
                <h2 className="font-syne font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tighter mb-6">What You'll Learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.sections.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                      <span className="text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0 font-black">✦</span>
                      <span className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">{s.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curriculum */}
              <div className={`animate-fadeUp stagger-2 ${mounted?'':'opacity-0'}`}>
                <h2 className="text-2xl font-black mb-4" style={{fontFamily:'Syne'}}>Course Curriculum</h2>
                {course.sections.map((section, si) => (
                  <div key={si} className="mb-4 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm">
                    <button
                      onClick={() => setOpenSection(openSection === si ? -1 : si)}
                      className="w-full flex justify-between items-center px-5 py-4 hover:bg-white/5 transition text-left"
                    >
                      <div>
                        <span className="font-bold text-white" style={{fontFamily:'Syne'}}>{section.title}</span>
                        <span className="text-gray-500 text-xs ml-2">({section.lessons.length} lessons)</span>
                      </div>
                      <span className="text-purple-400">{openSection === si ? '▲' : '▼'}</span>
                    </button>
                    {openSection === si && (
                      <div className="border-t border-white/5">
                        {section.lessons.map((lesson, li) => (
                          <div key={li}
                            className="flex items-center gap-3 px-5 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                            <span className="w-7 h-7 rounded-full bg-purple-900/50 text-purple-400 flex items-center justify-center text-xs flex-shrink-0">
                              {li + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm text-gray-200">{lesson.title}</p>
                              <p className="text-xs text-gray-500">🎬 Video • {lesson.duration}</p>
                            </div>
                            {enrolled ? (
                              <button
                                onClick={() => { setActiveLesson(lesson); window.scrollTo({top:0}) }}
                                className="text-xs px-3 py-1 rounded-full bg-purple-600/20 text-purple-400 hover:bg-purple-600/40 transition"
                              >
                                Watch
                              </button>
                            ) : (
                              <span className="text-gray-600 text-xs">🔒</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Enroll card */}
            <div className="w-full lg:w-80">
              <div className="sticky top-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10">
                <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="p-6 space-y-6">
                  <div>
                    <p className="text-4xl font-syne font-black text-emerald-500 mb-1 tracking-tighter uppercase">FREE</p>
                    <p className="text-slate-500 dark:text-slate-500 text-xs font-bold uppercase tracking-widest leading-none">Full lifetime access</p>
                  </div>

                  <div className="space-y-3">
                    {enrolled ? (
                      <button
                        onClick={() => setActiveLesson(course.sections[0].lessons[0])}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/30 transition-all hover:-translate-y-1"
                      >
                        Continue Learning →
                      </button>
                    ) : (
                      <button
                        onClick={handleEnroll}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/30 transition-all hover:-translate-y-1"
                      >
                        {user ? 'Enroll Now — Free' : 'Login to Enroll'}
                      </button>
                    )}
                  </div>

                  {enrolled && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                        <span>Progress</span><span>{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 transition-all duration-500"
                          style={{width:`${progress}%`}} />
                      </div>
                    </div>
                  )}

                  <ul className="space-y-4">
                    {[
                      { icon: '🎬', text: `${totalLessons} video lessons` },
                      { icon: '⏱', text: `${course.duration} total duration` },
                      { icon: '📱', text: 'Mobile & desktop access' },
                      { icon: '🏆', text: 'Verifiable certificate' },
                      { icon: '♾️', text: 'Full lifetime access' },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-xs font-medium">
                        <span className="text-base">{item.icon}</span>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseDetail