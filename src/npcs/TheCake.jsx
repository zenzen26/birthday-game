import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useFrame as useF } from '@react-three/fiber'
import * as THREE from 'three'
import InteractObject from '../world/InteractObject'
import { useGameStore } from '../stores/gameStore'

function CakeMesh() {
  const flameRef = useRef()
  useFrame(({ clock }) => {
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(clock.elapsedTime * 8) * 0.15
      flameRef.current.scale.x = 1 + Math.sin(clock.elapsedTime * 6 + 1) * 0.1
    }
  })
  return (
    <group>
      {/* Bottom layer */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.3, 10]} />
        <meshToonMaterial color="#f5c0c0" />
      </mesh>
      {/* Middle layer */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.25, 10]} />
        <meshToonMaterial color="#fff0f8" />
      </mesh>
      {/* Top layer */}
      <mesh position={[0, 0.64, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.22, 10]} />
        <meshToonMaterial color="#f5c0c0" />
      </mesh>
      {/* Frosting drips */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI / 3) * 0.44,
          0.33,
          Math.sin(i * Math.PI / 3) * 0.44
        ]} castShadow>
          <sphereGeometry args={[0.07, 5, 5]} />
          <meshToonMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* Candle */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.22, 6]} />
        <meshToonMaterial color="#ffe0f0" />
      </mesh>
      {/* Flame */}
      <mesh ref={flameRef} position={[0, 1.02, 0]}>
        <coneGeometry args={[0.06, 0.18, 6]} />
        <meshToonMaterial color="#ffcc00" emissive="#ff8800" emissiveIntensity={1} />
      </mesh>
      <pointLight position={[0, 1.1, 0]} color="#ffaa00" intensity={0.6} distance={3} />
      {/* Note pinned to it */}
      <mesh position={[0.5, 0.5, 0]} rotation={[0, -0.3, 0.1]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.02]} />
        <meshToonMaterial color="#fff9e0" />
      </mesh>
    </group>
  )
}

export default function TheCake({ position }) {
  const setGamePhase = useGameStore(s => s.setGamePhase)
  const isUsed       = useGameStore(s => s.isNPCUsed)

  if (isUsed('the-cake')) return null // cake is gone after interaction

  return (
    <InteractObject
      position={position}
      id="the-cake"
      radius={3}
      onInteract={() => setGamePhase('cakeScene')}
    >
      <CakeMesh />
    </InteractObject>
  )
}
