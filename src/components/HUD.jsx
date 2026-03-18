import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import MiniMap from './MiniMap'

const ITEMS = [
  { key: 'driedfish', icon: '🐟', label: 'Dried Fish' },
  { key: 'underwear', icon: '👙', label: 'Underwear'  },
  { key: 'liquid',    icon: '🍶', label: 'Liquid'     },
  { key: 'finger',    icon: '👆', label: 'Finger'     },
  { key: 'mushroom',  icon: '🍄', label: 'Mushroom'   },
]

if (typeof document !== 'undefined' && !document.querySelector('#hud-style')) {
  const s = document.createElement('style')
  s.id = 'hud-style'
  s.textContent = `@keyframes pulse{0%,100%{opacity:1;transform:translateX(-50%) scale(1)}50%{opacity:.75;transform:translateX(-50%) scale(1.04)}}`
  document.head.appendChild(s)
}

const ITEM_NAMES = {
  driedfish: '🐟 Dried Fish',
  underwear: '👙 Underwear',
  liquid:    '🍶 Suspicious Liquid',
  finger:    '👆 Detached Finger',
  mushroom:  '🍄 Special Mushroom',
}

function NagNote({ inventory }) {
  const setPhase = useGameStore(s => s.setGamePhase)
  const missing  = Object.entries(ITEM_NAMES).filter(([k]) => !inventory.includes(k)).map(([,v]) => v)

  return (
    <div style={{
      position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
      background:'rgba(255,248,220,0.97)', border:'3px solid #c8a010',
      borderRadius:'12px', padding:'28px 36px', maxWidth:'480px', width:'90%',
      textAlign:'center', color:'#3a2000', fontSize:'15px', lineHeight:'1.7',
      boxShadow:'0 8px 32px rgba(0,0,0,0.5)', pointerEvents:'auto',
    }}>
      <div style={{ fontSize:'20px', marginBottom:'12px', fontWeight:'bold', color:'#8B2500' }}>
        💌 A Note From Your GF
      </div>
      <p style={{ marginBottom:'10px' }}>
        "The gate is sealed. You're still missing {missing.length} item{missing.length !== 1 ? 's' : ''}:"
      </p>
      <ul style={{ listStyle:'none', padding:0, margin:'0 0 12px', fontSize:'16px', lineHeight:'2' }}>
        {missing.map(name => <li key={name}>{name}</li>)}
      </ul>
      <p style={{ color:'#888', fontSize:'13px', fontStyle:'italic', marginBottom:'10px' }}>
        — Your GF 🧙‍♀️ (who is fine, really)
      </p>
      <p style={{ color:'#666', fontSize:'12px' }}>[E] to dismiss</p>
    </div>
  )
}

export default function HUD() {
  const inventory    = useGameStore(s => s.inventory)
  const nearby       = useGameStore(s => s.nearbyInteractable)
  const gamePhase    = useGameStore(s => s.gamePhase)
  const dialogueOpen = useGameStore(s => s.dialogueOpen)
  const setPhase     = useGameStore(s => s.setGamePhase)
  const showNag      = gamePhase === 'nagNote'

  const [showMap, setShowMap]     = useState(false)
  const [playerPos, setPlayerPos] = useState({ x: undefined, z: undefined })

  // M key toggles minimap
  useEffect(() => {
    const onKey = (e) => { if (e.code === 'KeyM') setShowMap(v => !v) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <div style={{ position:'fixed',inset:0,pointerEvents:'none',fontFamily:'Georgia,serif',userSelect:'none' }}>

        {/* Inventory bar */}
        <div style={{
          position:'absolute', top:'20px', left:'50%', transform:'translateX(-50%)',
          display:'flex', gap:'10px',
          background:'rgba(20,10,40,0.78)', border:'2px solid rgba(180,140,255,0.5)',
          borderRadius:'12px', padding:'10px 18px', backdropFilter:'blur(4px)',
        }}>
          {ITEMS.map(({ key, icon, label }) => (
            <div key={key} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
              opacity: inventory.includes(key) ? 1 : 0.3,
              filter: inventory.includes(key) ? 'none' : 'grayscale(1)',
              transform: inventory.includes(key) ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.4s ease',
            }}>
              <span style={{ fontSize:'26px', lineHeight:1 }}>{icon}</span>
              <span style={{ fontSize:'10px', color:'#cca8ff', letterSpacing:'0.5px' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* E prompt */}
        {nearby && !dialogueOpen && !showNag && (
          <div style={{
            position:'absolute', bottom:'80px', left:'50%', transform:'translateX(-50%)',
            background:'rgba(20,10,40,0.88)', border:'1px solid rgba(180,140,255,0.6)',
            borderRadius:'8px', padding:'8px 18px', color:'#e8d8ff', fontSize:'15px',
            backdropFilter:'blur(4px)', animation:'pulse 1.5s ease-in-out infinite',
          }}>
            {nearby.label || '[E] Interact'}
          </div>
        )}

        {/* Nag note — shows missing items */}
        {showNag && <NagNote inventory={inventory} />}

        {/* Controls */}
        <div style={{
          position:'absolute', bottom:'20px', right:'20px',
          color:'rgba(180,150,220,0.5)', fontSize:'12px', textAlign:'right', lineHeight:'1.8',
        }}>
          WASD Move &nbsp;|&nbsp; Mouse Pan &nbsp;|&nbsp; [E] Interact &nbsp;|&nbsp; Space Jump
        </div>
      </div>

      {/* Minimap — rendered outside the pointer-events:none div */}
      {showMap && <MiniMap playerX={playerPos.x} playerZ={playerPos.z} />}

      {/* Bridge: reads player pos from scene each frame, passes to minimap */}
      {showMap && <PlayerPosBridge onPos={(x,z) => setPlayerPos({x,z})} />}
    </>
  )
}

// Tiny component that lives outside Canvas but needs to read scene
// We use a shared ref approach via window for simplicity
function PlayerPosBridge({ onPos }) {
  useEffect(() => {
    // Poll window.__playerPos which World.jsx will update
    const id = setInterval(() => {
      const p = window.__playerPos
      if (p) onPos(p.x, p.z)
    }, 100)
    return () => clearInterval(id)
  }, [onPos])
  return null
}