import { useState } from 'react'
import { useGameStore } from '../stores/gameStore'

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10, 4, 22, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 150,
    fontFamily: 'Georgia, serif',
  },
  box: {
    background: '#fff8f0',
    border: '3px solid #e8a040',
    borderRadius: '14px',
    padding: '32px 40px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    color: '#2a1800',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  speech: {
    fontSize: '16px',
    lineHeight: '1.7',
    color: '#4a2800',
    marginBottom: '18px',
    minHeight: '60px',
    fontStyle: 'italic',
  },
  buttons: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'center',
    marginTop: '16px',
  },
  btnEat: {
    background: '#cc3300',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 22px',
    fontSize: '16px',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    transition: 'transform 0.1s',
  },
  btnSave: {
    background: '#44aa44',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 22px',
    fontSize: '16px',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    transition: 'transform 0.1s',
  },
}

export default function CakeScene() {
  const gamePhase    = useGameStore(s => s.gamePhase)
  const setGamePhase = useGameStore(s => s.setGamePhase)
  const collectItem  = useGameStore(s => s.collectItem)
  const setCatFollows = useGameStore(s => s.setCatFollows)
  const markNPCUsed  = useGameStore(s => s.markNPCUsed)

  const [stage, setStage] = useState('initial')
  // stages: 'initial' | 'cakeSpeech' | 'afterSpeech' | 'done'

  if (gamePhase !== 'cakeScene') return null

  function handleDontEat() {
    // Cat appears anyway, clock is given
    collectItem('clock')
    setCatFollows(true)
    markNPCUsed('the-cake')
    setStage('done')
    setTimeout(() => {
      setGamePhase('playing')
      setStage('initial')
    }, 2500)
  }

  function handleEat() {
    if (stage === 'initial') {
      setStage('cakeSpeech')
    } else if (stage === 'afterSpeech') {
      // STILL EAT — clock collected, cake gone
      collectItem('clock')
      setCatFollows(false)
      markNPCUsed('the-cake')
      setStage('done')
      setTimeout(() => {
        setGamePhase('playing')
        setStage('initial')
      }, 2200)
    }
  }

  function handleOkayFine() {
    // Cat eats cake, clock drops, cat follows
    collectItem('clock')
    setCatFollows(true)
    markNPCUsed('the-cake')
    setStage('catAte')
    setTimeout(() => {
      setGamePhase('playing')
      setStage('initial')
    }, 2800)
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <div style={styles.title}>🎂</div>

        {stage === 'initial' && (
          <>
            <p style={{ ...styles.speech, fontStyle: 'normal' }}>
              A note is pinned to the cake:<br />
              <em>"IF YOU ARE READING THIS OUTSIDE then the raccoon stole it. I TOLD YOU RACCOON. I TOLD YOU. — anyway hi babe, pick up the cake 🎂"</em>
            </p>
            <div style={styles.buttons}>
              <button style={styles.btnEat} onClick={handleEat}>👅 Eat the cake</button>
              <button style={styles.btnSave} onClick={handleDontEat}>🙅 Don't eat the cake</button>
            </div>
          </>
        )}

        {stage === 'cakeSpeech' && (
          <>
            <p style={styles.speech}>
              "WAIT. WAIT WAIT WAIT."<br />
              "I have FEELINGS. I have DREAMS. I dream of rolling hills and also of frosting, which is perhaps on-brand but still."<br />
              "I have been carried in a raccoon's arms today. I have SURVIVED. Does that mean NOTHING??"<br />
              "Okay FINE. I have a backwards clock. Raccoon's pocket. Take it. TAKE IT. Just please—"
            </p>
            <div style={styles.buttons}>
              <button style={styles.btnEat} onClick={() => { setStage('afterSpeech'); handleEat() }}>😈 Still eat it</button>
              <button style={styles.btnSave} onClick={() => { setStage('afterSpeech'); handleOkayFine() }}>🙏 Okay fine, I won't</button>
            </div>
          </>
        )}

        {stage === 'afterSpeech' && (
          <p style={styles.speech}>Processing your choice...</p>
        )}

        {stage === 'done' && (
          <p style={styles.speech}>
            <strong>⏰ Backwards Clock collected!</strong><br />
            {useGameStore.getState().catFollows
              ? "The cat has decided you're family now."
              : "...worth it. Probably."}
          </p>
        )}

        {stage === 'catAte' && (
          <p style={styles.speech}>
            A cat walks in from offscreen and eats the cake in one bite.<br />
            "...oh no." The clock drops. You pick it up.<br />
            <strong>⏰ Backwards Clock collected!</strong>
            <br />The cat is following you now.
          </p>
        )}
      </div>
    </div>
  )
}
