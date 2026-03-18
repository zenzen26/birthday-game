import React, { Suspense, Component } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls, Stars } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useGameStore } from './stores/gameStore'
import World from './components/World'
import HUD from './components/HUD'
import RansomNote from './components/RansomNote'
import DialogueBox from './components/DialogueBox'
import CakeScene from './components/CakeScene'
import EndingCutscene from './scenes/EndingCutscene'
import BirthdayLetter from './scenes/BirthdayLetter'

const keyboardMap = [
  { name: 'forward',   keys: ['ArrowUp',    'KeyW'] },
  { name: 'backward',  keys: ['ArrowDown',  'KeyS'] },
  { name: 'leftward',  keys: ['ArrowLeft',  'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump',      keys: ['Space'] },
  { name: 'run',       keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'interact',  keys: ['KeyE'] },
]

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) return (
      <div style={{ position:'fixed',inset:0,background:'#0a0418',color:'#f0e8ff',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'Georgia,serif',padding:'40px',textAlign:'center',gap:'16px' }}>
        <div style={{ fontSize:'48px' }}>🧙‍♀️</div>
        <h2 style={{ color:'#cc88ff' }}>Something went wrong</h2>
        <pre style={{ background:'rgba(255,255,255,0.05)',padding:'16px',borderRadius:'8px',fontSize:'12px',color:'#ff8888',maxWidth:'600px',overflowX:'auto' }}>{this.state.error?.message}</pre>
        <button onClick={() => window.location.reload()} style={{ padding:'10px 24px',background:'#5a1a8a',border:'2px solid #aa55ff',borderRadius:'8px',color:'#fff',cursor:'pointer',fontSize:'15px',fontFamily:'Georgia,serif' }}>Retry</button>
      </div>
    )
    return this.props.children
  }
}

function LoadingScreen() {
  return (
    <div style={{ position:'fixed',inset:0,background:'#0a0418',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'Georgia,serif',gap:'20px' }}>
      <div style={{ fontSize:'52px',animation:'spin 2s linear infinite' }}>🧙‍♀️</div>
      <p style={{ color:'#cca8ff',fontSize:'18px',letterSpacing:'2px' }}>Loading the paper world...</p>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function GameUI() {
  const gamePhase = useGameStore(s => s.gamePhase)
  return (
    <>
      {gamePhase === 'ransomNote' && <RansomNote />}
      {['playing','nagNote','cakeScene'].includes(gamePhase) && <HUD />}
      <DialogueBox />
      <CakeScene />
      {gamePhase === 'ending' && <EndingCutscene />}
      {gamePhase === 'letter'  && <BirthdayLetter />}
    </>
  )
}

function Scene() {
  const gamePhase = useGameStore(s => s.gamePhase)
  const showWorld = ['playing','nagNote','cakeScene','ending'].includes(gamePhase)
  return (
    <>
      {/* Soft ambient — fills shadows so they're not pitch black */}
      <ambientLight intensity={0.45} color="#ffd344ff" />
      {/* Main sun — lower intensity, softer shadows via radius */}
      <directionalLight
        position={[40, 60, 30]} intensity={0.7}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={300}
        shadow-camera-left={-120} shadow-camera-right={120}
        shadow-camera-top={120} shadow-camera-bottom={-120}
        shadow-radius={3}
        shadow-blurSamples={16}
        color="#ffe8c0"
      />
      {/* Soft fill from opposite side */}
      <directionalLight position={[-20, 30, -20]} intensity={0.25} color="#aab8ff" />
      <pointLight position={[0,15,0]} intensity={0.2} color="#9b59ff" />
      <Stars radius={150} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      <Physics timeStep="vary" gravity={[0,-20,0]}>
        <KeyboardControls map={keyboardMap}>
          {showWorld && <World />}
        </KeyboardControls>
      </Physics>
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <div style={{ width:'100vw',height:'100vh',position:'relative' }}>
        <Canvas shadows camera={{ fov:60, near:0.1, far:1000 }} style={{ position:'absolute',inset:0 }}>
          <Suspense fallback={null}><Scene /></Suspense>
        </Canvas>
        <Suspense fallback={<LoadingScreen />}><GameUI /></Suspense>
      </div>
    </ErrorBoundary>
  )
}