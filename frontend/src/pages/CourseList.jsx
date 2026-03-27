import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const courses = [
  {
    _id: '1',
    title: 'Complete Web Development Bootcamp',
    instructor: { name: 'Angela Yu' },
    category: 'Web Dev',
    level: 'beginner',
    price: 0,
    averageRating: 4.8,
    totalStudents: 125000,
    duration: '63 hours',
    lessons: 28,
    color: '#6c47ff',
    thumbnail: 'https://img.youtube.com/vi/mU6anWqZJcc/maxresdefault.jpg',
    description: 'Become a full-stack web developer with HTML, CSS, JS, Node, React, MongoDB and more!',
    sections: [
      {
        title: 'HTML Fundamentals',
        lessons: [
          { _id: 'l1', title: 'Intro to HTML', videoUrl: 'https://www.youtube.com/embed/qz0aGYrrlhU', duration: '12 min' },
          { _id: 'l2', title: 'HTML Elements & Tags', videoUrl: 'https://www.youtube.com/embed/UB1O30fR-EE', duration: '18 min' },
          { _id: 'l3', title: 'HTML Forms', videoUrl: 'https://www.youtube.com/embed/fNcJuPIZ2WE', duration: '15 min' },
        ]
      },
      {
        title: 'CSS Styling',
        lessons: [
          { _id: 'l4', title: 'Intro to CSS', videoUrl: 'https://www.youtube.com/embed/yfoY53QXEnI', duration: '20 min' },
          { _id: 'l5', title: 'CSS Flexbox', videoUrl: 'https://www.youtube.com/embed/JJSoEo8JSnc', duration: '25 min' },
        ]
      },
      {
        title: 'JavaScript Basics',
        lessons: [
          { _id: 'l6', title: 'JavaScript Intro', videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: '30 min' },
          { _id: 'l7', title: 'JS Functions', videoUrl: 'https://www.youtube.com/embed/xUI5Tsl2JpY', duration: '22 min' },
        ]
      }
    ]
  },
  {
    _id: '2',
    title: 'React JS Full Course 2024',
    instructor: { name: 'Traversy Media' },
    category: 'Frontend',
    level: 'intermediate',
    price: 0,
    averageRating: 4.9,
    totalStudents: 98000,
    duration: '32 hours',
    lessons: 20,
    color: '#00d2ff',
    thumbnail: 'https://img.youtube.com/vi/w7ejDZ8SWv8/maxresdefault.jpg',
    description: 'Learn React JS from scratch with hooks, context API, and React Router.',
    sections: [
      {
        title: 'React Fundamentals',
        lessons: [
          { _id: 'l8', title: 'React Intro', videoUrl: 'https://www.youtube.com/embed/w7ejDZ8SWv8', duration: '45 min' },
          { _id: 'l9', title: 'Components & Props', videoUrl: 'https://www.youtube.com/embed/Tn6-PIqc4UM', duration: '35 min' },
          { _id: 'l10', title: 'React Hooks', videoUrl: 'https://www.youtube.com/embed/TNhaISOUy6Q', duration: '40 min' },
        ]
      },
      {
        title: 'Advanced React',
        lessons: [
          { _id: 'l11', title: 'Context API', videoUrl: 'https://www.youtube.com/embed/5LrDIWkK_Bc', duration: '28 min' },
          { _id: 'l12', title: 'React Router', videoUrl: 'https://www.youtube.com/embed/Law7wfdg_ls', duration: '32 min' },
        ]
      }
    ]
  },
  {
    _id: '3',
    title: 'Node.js & Express Masterclass',
    instructor: { name: 'Traversy Media' },
    category: 'Backend',
    level: 'intermediate',
    price: 0,
    averageRating: 4.7,
    totalStudents: 76000,
    duration: '28 hours',
    lessons: 18,
    color: '#00c851',
    thumbnail: 'https://img.youtube.com/vi/fBNz5xF-Kx4/maxresdefault.jpg',
    description: 'Learn Node.js and Express from the ground up. Build REST APIs and web apps.',
    sections: [
      {
        title: 'Node.js Basics',
        lessons: [
          { _id: 'l13', title: 'Node.js Intro', videoUrl: 'https://www.youtube.com/embed/fBNz5xF-Kx4', duration: '30 min' },
          { _id: 'l14', title: 'NPM & Modules', videoUrl: 'https://www.youtube.com/embed/jHyfbLtpLrs', duration: '20 min' },
        ]
      },
      {
        title: 'Express Framework',
        lessons: [
          { _id: 'l15', title: 'Express Setup', videoUrl: 'https://www.youtube.com/embed/L72fhGm1tfE', duration: '25 min' },
          { _id: 'l16', title: 'REST API', videoUrl: 'https://www.youtube.com/embed/pKd0Rpw7O48', duration: '35 min' },
        ]
      }
    ]
  },
  {
    _id: '4',
    title: 'Python for Beginners — Full Course',
    instructor: { name: 'Mosh Hamedani' },
    category: 'Python',
    level: 'beginner',
    price: 0,
    averageRating: 4.9,
    totalStudents: 210000,
    duration: '45 hours',
    lessons: 32,
    color: '#ff9500',
    thumbnail: 'https://img.youtube.com/vi/_uQrJ0TkZlc/maxresdefault.jpg',
    description: 'Learn Python programming from scratch. Perfect for beginners with no coding experience.',
    sections: [
      {
        title: 'Python Basics',
        lessons: [
          { _id: 'l17', title: 'Python Intro', videoUrl: 'https://www.youtube.com/embed/_uQrJ0TkZlc', duration: '60 min' },
          { _id: 'l18', title: 'Variables & Types', videoUrl: 'https://www.youtube.com/embed/khKv-8q7YmY', duration: '40 min' },
        ]
      },
      {
        title: 'Python OOP',
        lessons: [
          { _id: 'l19', title: 'Functions', videoUrl: 'https://www.youtube.com/embed/9Os0o3wzS_I', duration: '35 min' },
          { _id: 'l20', title: 'Classes & Objects', videoUrl: 'https://www.youtube.com/embed/JeznW_7DlB0', duration: '45 min' },
        ]
      }
    ]
  },
  {
    _id: '5',
    title: 'MongoDB Complete Guide',
    instructor: { name: 'Academind' },
    category: 'Database',
    level: 'intermediate',
    price: 0,
    averageRating: 4.6,
    totalStudents: 54000,
    duration: '20 hours',
    lessons: 14,
    color: '#00c851',
    thumbnail: 'https://img.youtube.com/vi/ExcRbA7fy_A/maxresdefault.jpg',
    description: 'Master MongoDB from basics to advanced. Learn CRUD, aggregation, indexes and more.',
    sections: [
      {
        title: 'MongoDB Basics',
        lessons: [
          { _id: 'l21', title: 'MongoDB Intro', videoUrl: 'https://www.youtube.com/embed/ExcRbA7fy_A', duration: '30 min' },
          { _id: 'l22', title: 'CRUD Operations', videoUrl: 'https://www.youtube.com/embed/ofme2o29ngU', duration: '25 min' },
        ]
      }
    ]
  },
  {
    _id: '6',
    title: 'Tailwind CSS Full Course',
    instructor: { name: 'Dave Gray' },
    category: 'CSS',
    level: 'beginner',
    price: 0,
    averageRating: 4.8,
    totalStudents: 67000,
    duration: '16 hours',
    lessons: 12,
    color: '#00d2ff',
    thumbnail: 'https://img.youtube.com/vi/lCxcTsOHrjo/maxresdefault.jpg',
    description: 'Build beautiful modern websites faster with Tailwind CSS utility classes.',
    sections: [
      {
        title: 'Tailwind Basics',
        lessons: [
          { _id: 'l23', title: 'Tailwind Intro', videoUrl: 'https://www.youtube.com/embed/lCxcTsOHrjo', duration: '35 min' },
          { _id: 'l24', title: 'Components', videoUrl: 'https://www.youtube.com/embed/mchKIecfFGI', duration: '28 min' },
        ]
      }
    ]
  },
  {
    _id: '7',
    title: 'TypeScript Crash Course',
    instructor: { name: 'Traversy Media' },
    category: 'TypeScript',
    level: 'intermediate',
    price: 0,
    averageRating: 4.7,
    totalStudents: 43000,
    duration: '12 hours',
    lessons: 10,
    color: '#6c47ff',
    thumbnail: 'https://img.youtube.com/vi/BCg4U1FzODs/maxresdefault.jpg',
    description: 'Get up and running with TypeScript — types, interfaces, classes and generics.',
    sections: [
      {
        title: 'TypeScript Basics',
        lessons: [
          { _id: 'l25', title: 'TS Intro', videoUrl: 'https://www.youtube.com/embed/BCg4U1FzODs', duration: '40 min' },
          { _id: 'l26', title: 'Interfaces', videoUrl: 'https://www.youtube.com/embed/ahCwqrYpIuM', duration: '30 min' },
        ]
      }
    ]
  },
  {
    _id: '8',
    title: 'Git & GitHub Full Course',
    instructor: { name: 'freeCodeCamp' },
    category: 'DevOps',
    level: 'beginner',
    price: 0,
    averageRating: 4.9,
    totalStudents: 189000,
    duration: '18 hours',
    lessons: 15,
    color: '#ff6b6b',
    thumbnail: 'https://img.youtube.com/vi/RGOj5yH7evk/maxresdefault.jpg',
    description: 'Master Git and GitHub for version control. Essential for every developer.',
    sections: [
      {
        title: 'Git Basics',
        lessons: [
          { _id: 'l27', title: 'Git Intro', videoUrl: 'https://www.youtube.com/embed/RGOj5yH7evk', duration: '50 min' },
          { _id: 'l28', title: 'Branching', videoUrl: 'https://www.youtube.com/embed/e2IbNHi4uCI', duration: '35 min' },
        ]
      }
    ]
  },
  {
    _id: '9',
    title: 'Cybersecurity Fundamentals',
    instructor: { name: 'NetworkChuck' },
    category: 'Security',
    level: 'beginner',
    price: 0,
    averageRating: 4.8,
    totalStudents: 91000,
    duration: '22 hours',
    lessons: 16,
    color: '#ff3cac',
    thumbnail: 'https://img.youtube.com/vi/hXSFdwIIfkc/maxresdefault.jpg',
    description: 'Learn ethical hacking, network security, and cybersecurity fundamentals.',
    sections: [
      {
        title: 'Security Basics',
        lessons: [
          { _id: 'l29', title: 'Intro to Cybersecurity', videoUrl: 'https://www.youtube.com/embed/hXSFdwIIfkc', duration: '40 min' },
          { _id: 'l30', title: 'Network Security', videoUrl: 'https://www.youtube.com/embed/qiQR5rTSshw', duration: '35 min' },
        ]
      }
    ]
  },
  {
    _id: '10',
    title: 'Flutter Mobile App Development',
    instructor: { name: 'Flutter Dev' },
    category: 'Mobile',
    level: 'intermediate',
    price: 0,
    averageRating: 4.7,
    totalStudents: 38000,
    duration: '24 hours',
    lessons: 18,
    color: '#00d2ff',
    thumbnail: 'https://img.youtube.com/vi/VPvVD8t02U8/maxresdefault.jpg',
    description: 'Build beautiful cross-platform mobile apps with Flutter and Dart.',
    sections: [
      {
        title: 'Flutter Basics',
        lessons: [
          { _id: 'l31', title: 'Flutter Intro', videoUrl: 'https://www.youtube.com/embed/VPvVD8t02U8', duration: '45 min' },
          { _id: 'l32', title: 'Widgets & Layout', videoUrl: 'https://www.youtube.com/embed/b_sQ9bMltGU', duration: '38 min' },
        ]
      }
    ]
  },
  {
    _id: '11',
    title: 'AWS Cloud Practitioner',
    instructor: { name: 'freeCodeCamp' },
    category: 'Cloud',
    level: 'beginner',
    price: 0,
    averageRating: 4.8,
    totalStudents: 72000,
    duration: '26 hours',
    lessons: 20,
    color: '#ff9500',
    thumbnail: 'https://img.youtube.com/vi/3hLmDS179YE/maxresdefault.jpg',
    description: 'Pass the AWS Cloud Practitioner exam and start your cloud career.',
    sections: [
      {
        title: 'AWS Fundamentals',
        lessons: [
          { _id: 'l33', title: 'AWS Intro', videoUrl: 'https://www.youtube.com/embed/3hLmDS179YE', duration: '55 min' },
          { _id: 'l34', title: 'Core Services', videoUrl: 'https://www.youtube.com/embed/ulprqHHWlng', duration: '42 min' },
        ]
      }
    ]
  },
  {
    _id: '12',
    title: 'Machine Learning with Python',
    instructor: { name: 'Sentdex' },
    category: 'AI/ML',
    level: 'advanced',
    price: 0,
    averageRating: 4.9,
    totalStudents: 115000,
    duration: '40 hours',
    lessons: 30,
    color: '#ff6b6b',
    thumbnail: 'https://img.youtube.com/vi/OGxgnH8y2NM/maxresdefault.jpg',
    description: 'Master machine learning algorithms with Python, scikit-learn and TensorFlow.',
    sections: [
      {
        title: 'ML Fundamentals',
        lessons: [
          { _id: 'l35', title: 'ML Intro', videoUrl: 'https://www.youtube.com/embed/OGxgnH8y2NM', duration: '50 min' },
          { _id: 'l36', title: 'Regression Models', videoUrl: 'https://www.youtube.com/embed/R15LjD8aCzc', duration: '44 min' },
        ]
      }
    ]
  },
]

export { courses }

const categories = ['All', 'Web Dev', 'Frontend', 'Backend', 'Python', 'Database', 'CSS', 'TypeScript', 'DevOps', 'Security', 'Mobile', 'Cloud', 'AI/ML']

const CourseList = () => {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const filtered = courses.filter(c => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || c.category === category
    return matchSearch && matchCat
  })

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-white transition-colors duration-300">

      {/* ── VISITOR NAVBAR ── */}
      {!user && (
        <nav className="sticky top-0 z-50 flex justify-between items-center px-8 py-4 bg-white/80 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 transition-all">

          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#fff' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 16
            }}>C</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20 }}>
              Cyber<span style={{ color: '#6c47ff' }}>Square</span>
            </span>
          </Link>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link to="/login" style={{
              color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
              padding: '8px 18px', fontSize: 14, borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s'
            }}>
              Sign In
            </Link>
            <Link to="/register" style={{
              background: 'linear-gradient(135deg,#6c47ff,#9c47ff)',
              color: '#fff', textDecoration: 'none',
              padding: '8px 20px', fontSize: 14, borderRadius: 10,
              fontWeight: 600, boxShadow: '0 0 20px rgba(108,71,255,0.3)'
            }}>
              Get Started Free
            </Link>
          </div>
        </nav>
      )}

      {/* ── HERO ── */}
      <div className="relative text-center pt-20 pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[100px]" />
          <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-rose-500/10 dark:bg-rose-500/5 blur-[100px]" />
        </div>
        <div className="relative space-y-6">
          <span className="inline-block bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            200+ Expert Courses
          </span>
          <h1 className="font-syne font-black text-4xl md:text-7xl text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            Explore Our <span className="bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent">Courses</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            {courses.length} world-class courses · All completely free to preview
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search courses or instructors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* ── CATEGORY FILTERS ── */}
      <div className="flex flex-wrap justify-center gap-3 px-6 pb-12">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              category === c
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest">
            {filtered.length} courses discovered
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-32 space-y-4">
            <div className="text-7xl">🔍</div>
            <p className="text-slate-500 dark:text-slate-500 text-2xl font-medium italic">No courses found matching "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((course, i) => (
              <Link
                to={`/courses/${course._id}`}
                state={{ course }}
                key={course._id}
                className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 animate-fadeUp"
                style={{ animationDelay: `${(i % 8) * 0.05}s` }}
              >
                {/* Thumbnail */}
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 dark:from-slate-900/80 via-transparent to-transparent opacity-60" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-white/20">
                      {course.category}
                    </span>
                  </div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-emerald-500 px-3 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                      FREE
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex-1 space-y-3">
                    <h3 className="font-syne font-black text-lg text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 uppercase">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      by <span className="text-slate-900 dark:text-slate-200">{course.instructor.name}</span>
                    </p>
                  </div>

                  {/* Meta stats */}
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Duration</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">⏱ {course.duration}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Rating</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">⭐ {course.averageRating}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Color Bar */}
                <div 
                  className="h-1.5 opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, ${course.color}, transparent)` }}
                />
              </Link>
            ))}
          </div>
        )}

        {/* CTA for visitors */}
        {!user && (
          <div className="mt-20 text-center bg-gradient-to-br from-indigo-600/10 to-rose-500/5 dark:from-indigo-500/10 dark:to-rose-500/5 border border-indigo-500/20 dark:border-white/5 rounded-3xl py-16 px-8 relative overflow-hidden transition-all duration-300">
            <div className="relative z-10 space-y-6">
              <h2 className="font-syne font-black text-4xl md:text-5xl text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                Ready to Start <span className="text-indigo-600 dark:text-indigo-400">Learning?</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-xl mx-auto">
                Join 50,000+ students at CyberSquare. Create your free account today and unlock your potential.
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Link to="/register" className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all hover:-translate-y-1 uppercase tracking-widest text-sm">
                  Create Free Account →
                </Link>
                <Link to="/login" className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black px-10 py-4 rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-white/10 uppercase tracking-widest text-sm">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #07070f; }
        ::-webkit-scrollbar-thumb { background: #6c47ff; border-radius: 10px; }
      `}</style>
    </div>
  )
}

export default CourseList