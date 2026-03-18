import { useEffect, useRef, useState } from 'react'

// ── EDIT THIS ──────────────────────────────────────────────────────
const BIRTHDAY_MESSAGE = `— A letter for you —

Happy Birthday, pookie wookie.

I vibe coded this shit, claude is so pro wtf.

I lub lub lub you.

You get cuddles and kissie today and tomorrow and tomorrow tomorrow and and and-

idk what to say anymore I lub you. You are the cuted pookie wookie i can squish your pp hehe`

const SENDER_NAME = `From pookie`
// ──────────────────────────────────────────────────────────────────

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#0a0418',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
    fontFamily: 'Georgia, serif',
    overflow: 'hidden',
  },
  letter: {
    background: '#fffde8',
    border: '2px solid #d4a020',
    borderRadius: '6px',
    padding: '44px 52px',
    maxWidth: '520px',
    width: '90%',
    boxShadow: '0 12px 60px rgba(200,150,0,0.4), 0 0 0 8px rgba(255,220,80,0.08)',
    color: '#2a1800',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
    animation: 'letterUnfold 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
    transformOrigin: 'top center',
  },
  heart: {
    fontSize: '48px',
    marginBottom: '16px',
    display: 'block',
    animation: 'heartbeat 1.5s ease-in-out infinite',
  },
  title: {
    fontSize: '14px',
    letterSpacing: '3px',
    color: '#8B6914',
    marginBottom: '24px',
    textTransform: 'uppercase',
  },
  message: {
    fontSize: '16px',
    lineHeight: '1.85',
    color: '#3a2000',
    textAlign: 'left',
    whiteSpace: 'pre-line',
    borderTop: '1px solid #e0c060',
    borderBottom: '1px solid #e0c060',
    padding: '18px 0',
    margin: '0 0 18px 0',
  },
  sender: {
    fontSize: '15px',
    fontStyle: 'italic',
    color: '#6a4010',
    marginBottom: '20px',
  },
  wish: {
    fontSize: '20px',
    marginTop: '14px',
    color: '#c87010',
    letterSpacing: '1px',
  },
  confettiCanvas: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
  },
}

// Inject animations
if (typeof document !== 'undefined' && !document.querySelector('#letter-style')) {
  const s = document.createElement('style')
  s.id = 'letter-style'
  s.textContent = `
    @keyframes letterUnfold {
      from { opacity: 0; transform: scaleY(0.1) rotateX(-60deg); }
      to   { opacity: 1; transform: scaleY(1) rotateX(0deg); }
    }
    @keyframes heartbeat {
      0%,100% { transform: scale(1); }
      15% { transform: scale(1.15); }
      30% { transform: scale(1); }
      45% { transform: scale(1.08); }
      60% { transform: scale(1); }
    }
    @keyframes confettiFall {
      to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
    }
  `
  document.head.appendChild(s)
}

// Confetti particle
function Confetti({ x, color, size, duration, delay, shape }) {
  return (
    <div style={{
      position: 'fixed',
      left: `${x}%`,
      top: '-20px',
      width: shape === 'circle' ? `${size}px` : `${size * 0.6}px`,
      height: `${size}px`,
      background: color,
      borderRadius: shape === 'circle' ? '50%' : '2px',
      opacity: 0.9,
      animation: `confettiFall ${duration}s ${delay}s ease-in forwards`,
      zIndex: 1,
    }} />
  )
}

const CONFETTI_COLORS = ['#ffd700','#ff69b4','#00ccff','#ff6633','#aaff44','#cc44ff','#ffffff','#ffaa00']
const CONFETTI_COUNT  = 80

export default function BirthdayLetter() {
  const confetti = useRef(
    Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 8 + Math.random() * 10,
      duration: 3 + Math.random() * 3,
      delay: Math.random() * 2,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    }))
  )

  return (
    <div style={styles.overlay}>
      {/* Confetti */}
      {confetti.current.map(c => <Confetti key={c.id} {...c} />)}

      {/* The letter */}
      <div style={styles.letter}>
        <span style={styles.heart}>💛</span>
        <div style={styles.title}>— A letter for you —</div>

        <div style={styles.message}>{BIRTHDAY_MESSAGE}</div>

        <div style={styles.sender}>— {SENDER_NAME}</div>

        <div style={styles.wish}>🕯️  Make a wish.</div>
      </div>
    </div>
  )
}
