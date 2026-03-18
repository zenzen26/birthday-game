import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import WBScene from './WBScene'
import WBSidebar from './WBSidebar'
import WBToolbar from './WBToolbar'

// Inject global styles for WB
const styleEl = document.createElement('style')
styleEl.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080414; overflow: hidden; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0f0a20; }
  ::-webkit-scrollbar-thumb { background: #3a1a6a; border-radius: 3px; }
  input[type=range] { height: 4px; }
  select option { background: #0f0a20; color: #d0c0f0; }
`
document.head.appendChild(styleEl)

export default function WorldBuilder() {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'monospace' }}>
      {/* Top toolbar */}
      <WBToolbar />

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left sidebar */}
        <WBSidebar />

        {/* 3D canvas */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Canvas
            shadows
            camera={{ position: [0, 18, 22], fov: 55, near: 0.1, far: 600 }}
            style={{ background: '#100820' }}
            onCreated={({ gl }) => {
              gl.setClearColor('#100820')
            }}
          >
            <Suspense fallback={null}>
              <WBScene />
            </Suspense>
          </Canvas>

          {/* Corner hint */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            color: 'rgba(100,80,160,0.6)',
            fontSize: '11px',
            fontFamily: 'monospace',
            lineHeight: '1.7',
            pointerEvents: 'none',
          }}>
            🟡 quest NPC &nbsp; 🔵 villager &nbsp; 🔴 enemy &nbsp; 🟢 merchant &nbsp; 🟣 neutral<br />
            📝 note &nbsp; 💎 treasure &nbsp; 🚪 zone gate &nbsp; 🏠 prop
          </div>
        </div>
      </div>
    </div>
  )
}
