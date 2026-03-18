import NPC from '../world/NPC'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../stores/gameStore'

function DeerMesh() {
  const glowRef = useRef()
  useFrame(({ clock }) => {
    if (glowRef.current) {
      glowRef.current.intensity = 0.8 + Math.sin(clock.elapsedTime * 2) * 0.3
    }
  })
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.45, 0.7, 0.3]} />
        <meshToonMaterial color="#c8a87a" />
      </mesh>
      {/* Neck */}
      <mesh position={[0.1, 1.25, 0]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.5, 6]} />
        <meshToonMaterial color="#c8a87a" />
      </mesh>
      {/* Head */}
      <mesh position={[0.28, 1.58, 0]} castShadow>
        <boxGeometry args={[0.38, 0.35, 0.3]} />
        <meshToonMaterial color="#c8a87a" />
      </mesh>
      {/* Snout */}
      <mesh position={[0.52, 1.5, 0]} castShadow>
        <boxGeometry args={[0.2, 0.15, 0.22]} />
        <meshToonMaterial color="#e8c9a0" />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.48, 1.62, 0.12]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshToonMaterial color="#1a0800" />
      </mesh>
      <mesh position={[0.48, 1.62, -0.12]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshToonMaterial color="#1a0800" />
      </mesh>
      {/* Antlers */}
      <group position={[0.12, 1.85, 0.1]}>
        <mesh rotation={[0, 0, 0.3]} castShadow>
          <cylinderGeometry args={[0.03, 0.04, 0.45, 4]} />
          <meshToonMaterial color="#6b3d0f" />
        </mesh>
        <mesh position={[0.1, 0.22, 0]} rotation={[0, 0, -0.5]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.3, 4]} />
          <meshToonMaterial color="#6b3d0f" />
        </mesh>
        <mesh position={[0.02, 0.25, 0.08]} rotation={[-0.4, 0, 0.1]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.28, 4]} />
          <meshToonMaterial color="#6b3d0f" />
        </mesh>
      </group>
      <group position={[0.12, 1.85, -0.1]}>
        <mesh rotation={[0, 0, -0.3]} castShadow>
          <cylinderGeometry args={[0.03, 0.04, 0.45, 4]} />
          <meshToonMaterial color="#6b3d0f" />
        </mesh>
        <mesh position={[0.1, 0.22, 0]} rotation={[0, 0, 0.5]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, 0.3, 4]} />
          <meshToonMaterial color="#6b3d0f" />
        </mesh>
      </group>
      {/* Legs */}
      {[[-0.15, 0, 0.1], [-0.15, 0, -0.1], [0.15, 0, 0.1], [0.15, 0, -0.1]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.55, 5]} />
          <meshToonMaterial color="#b89060" />
        </mesh>
      ))}
      {/* Moonbeam bottle on rock */}
      <group position={[0.9, 0.35, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.28, 0.3, 7]} />
          <meshToonMaterial color="#7a6040" />
        </mesh>
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.35, 6]} />
          <meshToonMaterial color="#d0e8ff" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 0.1, 6]} />
          <meshToonMaterial color="#5a4030" />
        </mesh>
        <pointLight ref={glowRef} color="#a0c8ff" intensity={0.8} distance={2} />
      </group>
    </group>
  )
}

export default function Diane({ position }) {
  const collectItem = useGameStore(s => s.collectItem)

  const lines = [
    "Oh. Hello. I'm fine. Everything is fine. I'm not even thinking about Gerald anymore.",
    "Gerald the rabbit, not Gerald the fox. Different Gerald. There are a lot of Geralds.",
    "Anyway. If you love something, let it go. If it doesn't come back, that's fine, I'm fine.",
    "I found this moonbeam during a difficult evening. Take it. I'm trying to let things go.",
  ]

  return (
    <NPC
      position={position}
      id="diane-deer"
      dialogueLines={lines}
      onDialogueEnd={() => collectItem('moonbeam')}
      radius={3.5}
    >
      <DeerMesh />
    </NPC>
  )
}
