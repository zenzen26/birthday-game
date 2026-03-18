import NPC from '../world/NPC'
import { useGameStore } from '../stores/gameStore'

function FishMesh() {
  return (
    <group>
      {/* Body - flat ellipsoid fish */}
      <mesh castShadow>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshToonMaterial color="#4a9eff" />
      </mesh>
      <mesh scale={[1.4, 0.6, 0.5]} castShadow>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshToonMaterial color="#4a9eff" />
      </mesh>
      {/* Tail fin */}
      <mesh position={[-0.55, 0, 0]} castShadow>
        <coneGeometry args={[0.3, 0.4, 3]} rotation={[0, 0, Math.PI / 2]} />
        <meshToonMaterial color="#2a7edf" />
      </mesh>
      <mesh position={[-0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.3, 0.4, 3]} />
        <meshToonMaterial color="#2a7edf" />
      </mesh>
      {/* Eye */}
      <mesh position={[0.3, 0.1, 0.18]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshToonMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.35, 0.1, 0.2]}>
        <sphereGeometry args={[0.06, 5, 5]} />
        <meshToonMaterial color="#1a1a1a" />
      </mesh>
      {/* Scales hint */}
      <mesh position={[0, 0.05, 0.2]}>
        <sphereGeometry args={[0.38, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshToonMaterial color="#5ab0ff" transparent opacity={0.4} />
      </mesh>
      {/* Podium of stacked pebbles */}
      <mesh position={[0, -0.32, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.12, 7]} />
        <meshToonMaterial color="#888880" />
      </mesh>
      <mesh position={[0, -0.44, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.1, 7]} />
        <meshToonMaterial color="#999990" />
      </mesh>
      <mesh position={[0, -0.53, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.08, 7]} />
        <meshToonMaterial color="#aaaaaa" />
      </mesh>
      {/* Dry label badge */}
      <mesh position={[0.1, -0.05, 0.35]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.28, 0.18, 0.02]} />
        <meshToonMaterial color="#fffde0" />
      </mesh>
    </group>
  )
}

export default function Barry({ position }) {
  const collectItem  = useGameStore(s => s.collectItem)
  const hasItem      = useGameStore(s => s.hasItem)

  const lines = [
    "Ah. You've come to witness me. I have waited for this moment.",
    "I have never touched water. Not once. I am the driest fish in this paper world.",
    "I've prepared a speech. It's four sentences. Please listen to all of them slowly.",
    ".",
    "..",
    "...",
    "A fish is not defined by water. I am defined by my choices. I choose dryness. You may take me — this is my destiny.",
  ]

  return (
    <NPC
      position={position}
      id="barry-fish"
      dialogueLines={lines}
      onDialogueEnd={() => {
        if (!hasItem('fish')) collectItem('fish')
      }}
      radius={3}
    >
      <FishMesh />
    </NPC>
  )
}
