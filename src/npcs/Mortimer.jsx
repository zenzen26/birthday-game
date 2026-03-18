import NPC from '../world/NPC'
import { useGameStore } from '../stores/gameStore'

function MushroomMesh() {
  return (
    <group>
      {/* Stem */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.6, 8]} />
        <meshToonMaterial color="#f5e6d0" />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <sphereGeometry args={[0.55, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshToonMaterial color="#8B2500" />
      </mesh>
      {/* Spots on cap */}
      {[[0.3, 0.85, 0.2], [-0.2, 0.9, 0.25], [0.1, 0.95, -0.3], [-0.35, 0.82, -0.1]].map(([x,y,z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[0.07, 5, 5]} />
          <meshToonMaterial color="#f5f5f0" />
        </mesh>
      ))}
      {/* Sleepy face - closed eyes */}
      <mesh position={[0.15, 0.45, 0.2]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.12, 0.03, 0.02]} />
        <meshToonMaterial color="#3a2000" />
      </mesh>
      <mesh position={[0.15, 0.45, -0.08]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.12, 0.03, 0.02]} />
        <meshToonMaterial color="#3a2000" />
      </mesh>
      {/* ZZZ particle above */}
      <mesh position={[0.4, 1.1, 0]}>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
        <meshToonMaterial color="#a0b8ff" transparent opacity={0.7} />
      </mesh>
      {/* Left shoe beside him */}
      <mesh position={[0.6, 0.05, 0.3]} rotation={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.3, 0.12, 0.18]} />
        <meshToonMaterial color="#3a2a1a" />
      </mesh>
    </group>
  )
}

export default function Mortimer({ position }) {
  const collectItem = useGameStore(s => s.collectItem)

  const lines = [
    "...eggs...",
    "...zzzz...",
  ]

  return (
    <NPC
      position={position}
      id="mortimer-mushroom"
      dialogueLines={lines}
      onDialogueEnd={() => collectItem('shoe')}
      radius={2.5}
    >
      <MushroomMesh />
    </NPC>
  )
}
