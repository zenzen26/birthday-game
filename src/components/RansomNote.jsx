import { useState } from 'react'
import { useGameStore } from '../stores/gameStore'

if (typeof document !== 'undefined' && !document.querySelector('#note-style')) {
  const s = document.createElement('style')
  s.id = 'note-style'
  s.textContent = `@keyframes noteGlow{0%,100%{box-shadow:0 8px 40px rgba(0,0,0,0.6)}50%{box-shadow:0 8px 60px rgba(255,200,0,0.4),0 0 30px rgba(255,200,0,0.2)}}`
  document.head.appendChild(s)
}

export default function RansomNote() {
  const setGamePhase = useGameStore(s => s.setGamePhase)
  const [pos1, setPos1] = useState({x:0,y:0})
  const [pos2, setPos2] = useState({x:0,y:0})
  const run = (set) => set({ x:(Math.random()-.5)*300, y:(Math.random()-.5)*200 })

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(10,4,22,0.92)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,fontFamily:'Georgia,serif' }}>
      <div style={{ background:'#fffde8',border:'3px solid #8B6914',borderRadius:'8px',padding:'36px 44px',maxWidth:'520px',width:'90%',color:'#2a1800',position:'relative',transform:'rotate(-1.5deg)',animation:'noteGlow 2s ease-in-out infinite' }}>
        <div style={{ position:'absolute',top:'-14px',left:'50%',transform:'translateX(-50%)',width:'24px',height:'24px',background:'radial-gradient(circle at 40% 35%,#ff6666,#cc0000)',borderRadius:'50%' }} />
        <div style={{ fontSize:'22px',fontWeight:'bold',marginBottom:'16px',letterSpacing:'2px',textAlign:'center',color:'#5a0000' }}>⚠ RANSOM NOTE ⚠</div>
        <p style={{ marginBottom:'12px',fontSize:'15px' }}>I HAVE TAKEN YOUR GIRLFRIEND. To get her back you must bring me:</p>
        <ul style={{ listStyle:'none',padding:0,margin:'0 0 16px 0',fontSize:'15px',lineHeight:'2.1' }}>
          <li>🐟 A dried fish (very proud, never touched water)</li>
          <li>👙 A pair of underwear (do NOT ask whose)</li>
          <li>🍶 A suspicious white liquid in a bowl</li>
          <li>👆 A finger (detached, ideally)</li>
          <li>🍄 A mushroom (the special kind)</li>
        </ul>
        <p style={{ fontSize:'14px',fontStyle:'italic',color:'#555' }}>Pass through my gate. I live in the castle. You will know it. I have STRONG opinions about soup.</p>
        <p style={{ fontSize:'13px',fontStyle:'italic',color:'#666',marginTop:'14px',borderTop:'1px solid #ccc',paddingTop:'10px' }}>— The Paper Wizard 🧙‍♀️</p>
        <div style={{ display:'flex',gap:'12px',marginTop:'22px',justifyContent:'center',flexWrap:'wrap' }}>
          <button style={{ background:'#f5c800',border:'2px solid #c89000',borderRadius:'8px',padding:'12px 22px',fontSize:'16px',cursor:'pointer',fontFamily:'Georgia,serif',fontWeight:'bold',color:'#3a2000' }} onClick={() => setGamePhase('playing')}>
            💛 Save my girlfriend!
          </button>
          <button style={{ background:'#ddd',border:'2px solid #aaa',borderRadius:'8px',padding:'12px 22px',fontSize:'16px',fontFamily:'Georgia,serif',color:'#999',userSelect:'none',transform:`translate(${pos1.x}px,${pos1.y}px)`,transition:'transform 0.3s cubic-bezier(.36,.07,.19,.97)',cursor:'default' }}
            onMouseEnter={()=>run(setPos1)} onClick={()=>run(setPos1)}>😴 Go back to sleep</button>
          <button style={{ background:'#ddd',border:'2px solid #aaa',borderRadius:'8px',padding:'12px 22px',fontSize:'16px',fontFamily:'Georgia,serif',color:'#999',userSelect:'none',transform:`translate(${pos2.x}px,${pos2.y}px)`,transition:'transform 0.35s cubic-bezier(.36,.07,.19,.97)',cursor:'default' }}
            onMouseEnter={()=>run(setPos2)} onClick={()=>run(setPos2)}>🧙 Who even are you</button>
        </div>
      </div>
    </div>
  )
}