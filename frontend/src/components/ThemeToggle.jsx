import { useState, useEffect } from 'react'

const ThemeToggle = () => {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    document.body.style.background = dark ? '#07070f' : '#f5f5f5'
    document.body.style.color = dark ? '#fff' : '#111'
  }, [dark])

  return (
    <button
      onClick={() => setDark(!dark)}
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10, padding: '6px 12px',
        cursor: 'pointer', fontSize: 16,
        color: '#fff', transition: 'all 0.2s'
      }}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}

export default ThemeToggle