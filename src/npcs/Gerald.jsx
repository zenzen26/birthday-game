import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import NPC from '../world/NPC'
import { useGameStore } from '../stores/gameStore'

function FoxMesh() {
  const tailRef = useRef()
  useFrame(({ clock }) => {
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(clock.elapsedTime * 2) * 0.3
    }
  })
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.7, 0.5, 0.5]} />
        <meshToonMaterial color="#e8701a" />
      </mesh>
      {/* Head */}
      <mesh position={[0.35, 0.75, 0]} castShadow>
        <boxGeometry args={[0.5, 0.45, 0.45]} />
        <meshToonMaterial color="#e8701a" />
      </mesh>
      {/* Snout */}
      <mesh position={[0.63, 0.65, 0]} castShadow>
        <boxGeometry args={[0.2, 0.18, 0.3]} />
        <meshToonMaterial color="#f5c398" />
      </mesh>
      {/* Ears */}
      <mesh position={[0.28, 1.05, 0.12]} castShadow>
        <coneGeometry args={[0.1, 0.22, 4]} />
        <meshToonMaterial color="#e8701a" />
      </mesh>
      <mesh position={[0.28, 1.05, -0.12]} castShadow>
        <coneGeometry args={[0.1, 0.22, 4]} />
        <meshToonMaterial color="#e8701a" />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.62, 0.78, 0.13]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshToonMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.62, 0.78, -0.13]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshToonMaterial color="#1a1a1a" />
      </mesh>
      {/* Tail */}
      <group ref={tailRef} position={[-0.35, 0.45, 0]}>
        <mesh rotation={[0, 0, Math.PI / 4]} castShadow>
          <coneGeometry args={[0.22, 0.7, 6]} />
          <meshToonMaterial color="#f0f0f0" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]} position={[0, 0.1, 0]} castShadow>
          <coneGeometry args={[0.18, 0.5, 6]} />
          <meshToonMaterial color="#e8701a" />
        </mesh>
      </group>
      {/* Legs */}
      {[[-0.25, 0, 0.18], [-0.25, 0, -0.18], [0.25, 0, 0.18], [0.25, 0, -0.18]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, 0.1, z]} castShadow>
          <boxGeometry args={[0.14, 0.2, 0.14]} />
          <meshToonMaterial color="#c85c10" />
        </mesh>
      ))}
    </group>
  )
}

export default function Gerald({ position }) {
  const collectItem = useGameStore(s => s.collectItem)

  const lines = [
    "Ah. A traveler. You seek the Wizard's Tower, yes?",
    "Head slightly diagonal from North-ish, then turn when you feel something.",
    "Before I help further — foxes are better than dogs. Yes or no?",
    "...I'll take your silence as agreement. Here. Take this fish. It's never touched water. It's very proud of this.",
    "The forest is that way. Probably. I've never been. I just live here.",
  ]

  return (
    <NPC
      position={position}
      id="gerald-fox"
      dialogueLines={lines}
      onDialogueEnd={() => collectItem('fish')}
      radius={3}
    >
      <FoxMesh />
      {/* Sitting on a barrel */}
      <mesh position={[0, -0.25, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.5, 8]} />
        <meshToonMaterial color="#8B6914" />
      </mesh>
    </NPC>
  )
}
