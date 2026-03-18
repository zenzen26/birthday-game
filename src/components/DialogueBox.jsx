import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../stores/gameStore'

if (typeof document !== 'undefined' && !document.querySelector('#dialogue-style')) {
  const s = document.createElement('style')
  s.id = 'dialogue-style'
  s.textContent = `
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes dialogueIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
  `
  document.head.appendChild(s)
}

const TYPEWRITER_SPEED = 25

// Speaker name colour map
const SPEAKER_COLORS = {
  'Gerald the Fox':    '#e8701a',
  'Barry the Fish':    '#4a9eff',
  'Mortimer':          '#8B2500',
  'Diane the Deer':    '#c8a87a',
  'Old Barnaby':       '#a07840',
  'Sister Maeve':      '#2255aa',
  'The Wizard':        '#cc44ff',
  'Old Woman':         '#7a5a8a',
  'Trader Vex':        '#44dd88',
  'Pip':               '#aa8830',
  'Guard':             '#ff6600',
  'Sentient Cake':     '#f5c0c0',
  'Special Mushroom':  '#aa55ff',
  'default':           '#cca8ff',
}

function getSpeakerColor(name) {
  if (!name) return SPEAKER_COLORS.default
  for (const [key, col] of Object.entries(SPEAKER_COLORS)) {
    if (name.includes(key) || key.includes(name)) return col
  }
  return SPEAKER_COLORS.default
}

export default function DialogueBox() {
  const dialogueOpen   = useGameStore(s => s.dialogueOpen)
  const dialogueLines  = useGameStore(s => s.dialogueLines)
  const dialogueLine   = useGameStore(s => s.dialogueLine)
  const dialogueSpeaker = useGameStore(s => s.dialogueSpeaker)

  const [displayed, setDisplayed] = useState('')
  const [isTyping,  setIsTyping]  = useState(false)
  const typeInterval = useRef(null)

  const currentLine = dialogueLines[dialogueLine] || ''

  useEffect(() => {
    if (!dialogueOpen) { setDisplayed(''); setIsTyping(false); return }
    setDisplayed('')
    setIsTyping(true)
    let i = 0
    clearInterval(typeInterval.current)
    typeInterval.current = setInterval(() => {
      i++
      setDisplayed(currentLine.slice(0, i))
      if (i >= currentLine.length) { clearInterval(typeInterval.current); setIsTyping(false) }
    }, TYPEWRITER_SPEED)
    return () => clearInterval(typeInterval.current)
  }, [dialogueLine, dialogueOpen, currentLine])

  // E skips typewriter
  useEffect(() => {
    function onKey(e) {
      if (e.code !== 'KeyE' || !dialogueOpen || !isTyping) return
      clearInterval(typeInterval.current)
      setDisplayed(currentLine)
      setIsTyping(false)
      e.stopImmediatePropagation()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [isTyping, currentLine, dialogueOpen])

  if (!dialogueOpen) return null

  const speakerColor = getSpeakerColor(dialogueSpeaker)
  const isLast = dialogueLine === dialogueLines.length - 1

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      padding: '0 40px 40px',
      display: 'flex', justifyContent: 'center',
      zIndex: 100, pointerEvents: 'none',
    }}>
      <div style={{
        background: 'rgba(10, 4, 26, 0.94)',
        border: `2px solid ${speakerColor}55`,
        borderRadius: '14px',
        padding: '0 0 18px 0',
        maxWidth: '740px', width: '100%',
        backdropFilter: 'blur(10px)',
        boxShadow: `0 -4px 30px ${speakerColor}22`,
        animation: 'dialogueIn 0.2s ease-out',
        pointerEvents: 'auto',
        overflow: 'hidden',
      }}>
        {/* Speaker name bar */}
        {dialogueSpeaker && (
          <div style={{
            background: `${speakerColor}22`,
            borderBottom: `1px solid ${speakerColor}44`,
            padding: '8px 24px',
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            color: speakerColor,
            textTransform: 'uppercase',
            fontFamily: 'Georgia, serif',
          }}>
            {dialogueSpeaker}
          </div>
        )}

        {/* Text */}
        <div style={{
          padding: '18px 28px 0',
          color: '#f0e8ff',
          fontSize: '17px',
          lineHeight: '1.65',
          fontFamily: 'Georgia, serif',
          minHeight: '56px',
        }}>
          {displayed}
          {isTyping && (
            <span style={{ animation: 'blink 0.6s step-end infinite', color: speakerColor }}>▌</span>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '10px 28px 0',
        }}>
          <span style={{ color: 'rgba(190,150,255,0.4)', fontSize: '12px', fontFamily: 'monospace' }}>
            {dialogueLine + 1} / {dialogueLines.length}
          </span>
          {!isTyping && (
            <span style={{
              color: speakerColor, fontSize: '13px',
              fontStyle: 'italic', fontFamily: 'Georgia, serif',
              animation: 'pulse 1.2s ease-in-out infinite',
            }}>
              {isLast ? '[E] Close' : '[E] Continue'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}