import { useEffect, useState, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'

function VideoModal({ onEnd }) {
  const videoRef = useRef(null)
  const [canSkip, setCanSkip] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setCanSkip(true), 3000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.addEventListener('ended', onEnd)
    return () => v.removeEventListener('ended', onEnd)
  }, [onEnd])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 500, fontFamily: 'Georgia, serif',
    }}>
      <div style={{
        background: '#111',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 8px 48px rgba(0,0,0,0.8)',
        border: '1px solid rgba(255,220,100,0.2)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '12px', maxWidth: '480px', width: '90vw',
      }}>
        <video
          ref={videoRef}
          src="/birthday.mp4"
          autoPlay
          playsInline
          style={{
            width: '100%',
            borderRadius: '10px',
          }}
          onError={onEnd}
        />
        {canSkip && (
          <button
            onClick={onEnd}
            style={{
              padding: '7px 22px',
              background: 'transparent',
              border: '1px solid rgba(255,220,100,0.35)',
              borderRadius: '6px',
              color: 'rgba(255,220,100,0.75)',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'Georgia, serif',
              letterSpacing: '1px',
            }}
          >
            continue →
          </button>
        )}
      </div>
    </div>
  )
}

export default function EndingCutscene() {
  const setGamePhase = useGameStore(s => s.setGamePhase)
  const [showVideo, setShowVideo] = useState(true)

  function handleVideoEnd() {
    setShowVideo(false)
    setGamePhase('letter')
  }

  if (!showVideo) return null
  return <VideoModal onEnd={handleVideoEnd} />
}