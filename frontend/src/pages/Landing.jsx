import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

const courses = [
  { icon: '💻', title: 'Full Stack Web Dev', students: '12,400', level: 'Beginner', color: '#6c47ff' },
  { icon: '🤖', title: 'AI & Machine Learning', students: '8,900', level: 'Intermediate', color: '#ff6b6b' },
  { icon: '📱', title: 'Mobile App Dev', students: '7,200', level: 'Beginner', color: '#00d2ff' },
  { icon: '🔒', title: 'Cybersecurity', students: '9,100', level: 'Advanced', color: '#ff9500' },
  { icon: '☁️', title: 'Cloud & DevOps', students: '6,800', level: 'Intermediate', color: '#00c851' },
  { icon: '🎨', title: 'UI/UX Design', students: '5,400', level: 'Beginner', color: '#ff3cac' },
]

const stats = [
  { value: '50,000+', label: 'Students Enrolled' },
  { value: '200+', label: 'Expert Courses' },
  { value: '95%', label: 'Placement Rate' },
  { value: '8+', label: 'Years of Excellence' },
]

const testimonials = [
  { name: 'Arjun Menon', role: 'Software Engineer @ Google', text: 'CyberSquare transformed my career. The mentorship and hands-on projects gave me the confidence to crack top tech interviews.', avatar: '👨‍💻' },
  { name: 'Priya Nair', role: 'UI Designer @ Swiggy', text: 'From zero design knowledge to landing a dream job — CyberSquare\'s UI/UX course is absolutely world-class.', avatar: '👩‍🎨' },
  { name: 'Rahul Dev', role: 'ML Engineer @ Amazon', text: 'The AI course content is incredibly up-to-date. I got placed within 2 months of completing my certification.', avatar: '🧑‍🔬' },
]

const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const num = parseInt(target.replace(/[^0-9]/g, ''))
        const dur = 2000
        const step = dur / num
        let cur = 0
        const timer = setInterval(() => {
          cur += Math.ceil(num / 80)
          if (cur >= num) { setCount(num); clearInterval(timer) }
          else setCount(cur)
        }, step)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

const Landing = () => {
  const [scrollY, setScrollY] = useState(0)
  const [activeTest, setActiveTest] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveTest(p => (p + 1) % testimonials.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ background: 'var(--bg-color)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.4s ease', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: scrollY > 50 ? 'var(--bg-color)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid var(--border-color)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #6c47ff, #ff6b6b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 18
          }}>C</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>
            Cyber<span style={{ color: '#6c47ff' }}>Square</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/courses" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 16px', fontSize: 14, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>
            Courses
          </Link>
          <Link to="/login" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 16px', fontSize: 14, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>
            Sign In
          </Link>
          <ThemeToggle />
          <Link to="/register" style={{
            background: 'linear-gradient(135deg, #6c47ff, #9c47ff)',
            color: '#fff', textDecoration: 'none', padding: '10px 22px',
            borderRadius: 12, fontSize: 14, fontWeight: 600,
            boxShadow: '0 0 30px rgba(108,71,255,0.4)', transition: 'all 0.2s'
          }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}>
            Get Started Free →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative' }}>

        {/* Animated background */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,71,255,0.15) 0%, transparent 70%)', animation: 'float1 6s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,107,0.12) 0%, transparent 70%)', animation: 'float2 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '40%', left: '40%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,210,255,0.08) 0%, transparent 70%)', animation: 'float3 7s ease-in-out infinite' }} />
          {/* Grid lines */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.03 }}>
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div style={{ position: 'relative', maxWidth: 900 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(108,71,255,0.12)', border: '1px solid rgba(108,71,255,0.3)',
            borderRadius: 100, padding: '8px 18px', marginBottom: 28, fontSize: 13, color: '#a78bff'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00c851', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Kerala's #1 Tech Training Institute
          </div>

          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 900,
            fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 1.0,
            marginBottom: 24, letterSpacing: '-2px'
          }}>
            Build Your Future<br />
            <span style={{
              background: 'linear-gradient(135deg, #6c47ff 0%, #ff6b6b 50%, #00d2ff 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundSize: '200% auto', animation: 'shimmer 4s linear infinite'
            }}>
              in Tech.
            </span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(16px,2vw,22px)', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Industry-leading courses in Web Development, AI, Cybersecurity & more.
            Join 50,000+ students who chose CyberSquare to launch their tech careers.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <Link to="/register" style={{
              background: 'linear-gradient(135deg, #6c47ff, #9c47ff)',
              color: '#fff', textDecoration: 'none',
              padding: '16px 36px', borderRadius: 16, fontWeight: 700, fontSize: 16,
              boxShadow: '0 0 50px rgba(108,71,255,0.4)', transition: 'all 0.3s',
              display: 'inline-block'
            }}>
              Start Learning Free →
            </Link>
            <Link to="/courses" style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--text-primary)', textDecoration: 'none',
              padding: '16px 36px', borderRadius: 16, fontWeight: 600, fontSize: 16,
              transition: 'all 0.3s', display: 'inline-block',
              backdropFilter: 'blur(10px)'
            }}>
              Browse Courses
            </Link>
          </div>

          {/* Social proof avatars */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ display: 'flex' }}>
              {['👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎓', '👩‍🎓'].map((e, i) => (
                <div key={i} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `hsl(${i * 60 + 240},70%,50%)`,
                  border: '2px solid var(--bg-color)', marginLeft: i > 0 ? -10 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                }}>{e}</div>
              ))}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>50,000+ students</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>⭐⭐⭐⭐⭐ 4.9 rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '60px 24px', background: 'rgba(108,71,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'center' }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(32px,5vw,52px)', background: 'linear-gradient(135deg, #6c47ff, #ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
                <Counter target={s.value} suffix={s.value.includes('+') ? '+' : s.value.includes('%') ? '%' : ''} />
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COURSES ── */}
      <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ color: '#6c47ff', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>What We Teach</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(32px,5vw,56px)', marginTop: 8, letterSpacing: '-1px' }}>
            World-Class <span style={{ color: '#6c47ff' }}>Courses</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, marginTop: 12 }}>Industry-aligned curriculum built by tech veterans</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {courses.map((c, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: 28, cursor: 'pointer', transition: 'all 0.3s',
              position: 'relative', overflow: 'hidden',
              animation: `fadeUp 0.6s ease ${i * 0.1}s both`
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.borderColor = c.color + '50'
                e.currentTarget.style.boxShadow = `0 20px 40px ${c.color}20`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${c.color}, transparent)`, borderRadius: '20px 20px 0 0' }} />
              <div style={{ fontSize: 40, marginBottom: 16 }}>{c.icon}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{c.title}</h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>👥 {c.students} enrolled</span>
                <span style={{ background: c.color + '20', color: c.color, fontSize: 11, padding: '2px 10px', borderRadius: 100, fontWeight: 600 }}>{c.level}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link to="/register" style={{
            background: 'linear-gradient(135deg, #6c47ff, #9c47ff)', color: '#fff',
            textDecoration: 'none', padding: '14px 36px', borderRadius: 14,
            fontWeight: 700, fontSize: 15, display: 'inline-block',
            boxShadow: '0 0 40px rgba(108,71,255,0.35)'
          }}>
            Explore All Courses →
          </Link>
        </div>
      </section>

      {/* ── WHY CYBERSQUARE ── */}
      <section style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ color: '#ff6b6b', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>Why Choose Us</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(32px,5vw,56px)', marginTop: 8, letterSpacing: '-1px' }}>
              The CyberSquare <span style={{ color: '#ff6b6b' }}>Advantage</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { icon: '🏆', title: 'Industry Mentors', desc: 'Learn from engineers at Google, Amazon, Microsoft and top Indian startups', color: '#ff9500' },
              { icon: '💼', title: '100% Placement Support', desc: 'Dedicated placement cell with 500+ hiring partners across India', color: '#00c851' },
              { icon: '🔬', title: 'Hands-on Projects', desc: 'Build real-world projects that go directly into your portfolio', color: '#00d2ff' },
              { icon: '📜', title: 'Certified Curriculum', desc: 'Courses aligned with global certifications — AWS, Google, Microsoft', color: '#6c47ff' },
              { icon: '🤝', title: 'Lifetime Community', desc: 'Join 50,000+ alumni network for networking, jobs, and support', color: '#ff6b6b' },
              { icon: '📱', title: 'Learn Anywhere', desc: 'HD video lectures accessible on mobile, tablet and desktop 24/7', color: '#ff3cac' },
            ].map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 18, padding: 24, transition: 'all 0.3s'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = f.color + '40' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}
              >
                <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 8, color: f.color }}>{f.title}</h4>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '100px 24px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <span style={{ color: '#00d2ff', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>Student Stories</span>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(28px,4vw,48px)', margin: '8px 0 48px', letterSpacing: '-1px' }}>
          Life-Changing <span style={{ color: '#00d2ff' }}>Experiences</span>
        </h2>

        <div style={{ position: 'relative', minHeight: 200 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              opacity: activeTest === i ? 1 : 0,
              transform: activeTest === i ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s ease', pointerEvents: activeTest === i ? 'auto' : 'none',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 24, padding: '36px 40px'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3, color: '#6c47ff' }}>"</div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 18, lineHeight: 1.8, marginBottom: 24, fontStyle: 'italic' }}>
                {t.text}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{t.avatar}</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                  <div style={{ color: '#6c47ff', fontSize: 13 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 220, display: 'flex', justifyContent: 'center', gap: 8 }}>
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setActiveTest(i)} style={{
              width: activeTest === i ? 24 : 8, height: 8, borderRadius: 100,
              background: activeTest === i ? '#6c47ff' : 'rgba(255,255,255,0.2)',
              border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0
            }} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(108,71,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,6vw,72px)', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-2px' }}>
            Your Tech Career<br />Starts <span style={{ background: 'linear-gradient(135deg,#6c47ff,#ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Today.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 18, marginBottom: 40 }}>
            Join 50,000+ students building their dream careers with CyberSquare.
          </p>
          <Link to="/register" style={{
            background: 'linear-gradient(135deg, #6c47ff, #ff6b6b)',
            color: '#fff', textDecoration: 'none', padding: '18px 48px',
            borderRadius: 18, fontWeight: 800, fontSize: 18, display: 'inline-block',
            boxShadow: '0 0 60px rgba(108,71,255,0.5)', transition: 'all 0.3s'
          }}>
            Enroll Now — It's Free →
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 16 }}>
            No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '48px 24px 32px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6c47ff, #ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16 }}>C</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>CyberSquare</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Kerala's Leading Tech Training Institute · Calicut, Kerala, India</p>
        <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12, marginTop: 8 }}>© 2024 CyberSquare. All rights reserved.</p>
      </footer>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes float1 { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(-30px) translateX(15px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(20px) translateX(-10px)} }
        @keyframes float3 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.05)} }
        @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: var(--bg-color); }
        ::-webkit-scrollbar-thumb { background: #6c47ff; border-radius: 10px; }
      `}</style>
    </div>
  )
}

export default Landing