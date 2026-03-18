import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import NPC from '../world/NPC'
import { useGameStore } from '../stores/gameStore'

function WizardMesh() {
  const staffRef = useRef()
  useFrame(({ clock }) => {
    if (staffRef.current) {
      staffRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.06
    }
  })
  return (
    <group>
      {/* Robe */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <coneGeometry args={[0.55, 1.5, 8]} />
        <meshToonMaterial color="#5a1a8a" />
      </mesh>
      {/* Body upper */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 0.5, 8]} />
        <meshToonMaterial color="#5a1a8a" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.78, 0]} castShadow>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshToonMaterial color="#f0d0a0" />
      </mesh>
      {/* Hat brim */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.06, 10]} />
        <meshToonMaterial color="#3a0a6a" />
      </mesh>
      {/* Hat cone */}
      <mesh position={[0, 2.45, 0]} castShadow>
        <coneGeometry args={[0.3, 0.9, 8]} />
        <meshToonMaterial color="#3a0a6a" />
      </mesh>
      {/* Star on hat */}
      <mesh position={[0.05, 2.7, 0.22]}>
        <octahedronGeometry args={[0.08]} />
        <meshToonMaterial color="#ffd700" emissive="#aa8800" emissiveIntensity={0.5} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.14, 1.82, 0.2]}>
        <sphereGeometry args={[0.05, 5, 5]} />
        <meshToonMaterial color="#220044" />
      </mesh>
      <mesh position={[-0.14, 1.82, 0.2]}>
        <sphereGeometry args={[0.05, 5, 5]} />
        <meshToonMaterial color="#220044" />
      </mesh>
      {/* Arms */}
      <mesh position={[0.42, 1.25, 0]} rotation={[0, 0, -0.5]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.55, 5]} />
        <meshToonMaterial color="#5a1a8a" />
      </mesh>
      <mesh position={[-0.42, 1.25, 0]} rotation={[0, 0, 0.5]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.55, 5]} />
        <meshToonMaterial color="#5a1a8a" />
      </mesh>
      {/* Staff */}
      <group ref={staffRef} position={[0.65, 1.0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.8, 5]} />
          <meshToonMaterial color="#6b3d0f" />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <octahedronGeometry args={[0.14]} />
          <meshToonMaterial color="#cc44ff" emissive="#8800cc" emissiveIntensity={0.8} />
        </mesh>
        <pointLight position={[0, 0.95, 0]} color="#cc44ff" intensity={0.7} distance={3} />
      </group>
    </group>
  )
}

export default function Wizard({ position }) {
  const hasAllItems  = useGameStore(s => s.hasAllItems)
  const inventory    = useGameStore(s => s.inventory)
  const setGamePhase = useGameStore(s => s.setGamePhase)

  const ITEM_NAMES = { fish: '🐟 Fish', shoe: '👟 Shoe', moonbeam: '🌙 Moonbeam', clock: '⏰ Clock' }
  const missing = ['fish','shoe','moonbeam','clock'].filter(i => !inventory.includes(i))

  const lines = hasAllItems()
    ? ["You have all four items... FINALLY. Let the ending begin."]
    : [
        `*slams hatch* You dare approach without all four items? I can SEE you're missing: ${missing.map(i => ITEM_NAMES[i]).join(', ')}. COME BACK WHEN YOU'RE READY.`
      ]

  return (
    <NPC
      position={position}
      id="wizard-door"
      dialogueLines={() => {
        const miss = ['fish','shoe','moonbeam','clock'].filter(i => !inventory.includes(i))
        if (miss.length === 0) {
          return ["You have all four items... FINALLY. Let the ending begin."]
        }
        return [`*slams hatch* You dare approach without all four items? I can SEE you're missing: ${miss.map(i => ITEM_NAMES[i]).join(', ')}. COME BACK WHEN YOU'RE READY.`]
      }}
      onDialogueEnd={() => {
        if (hasAllItems()) setGamePhase('ending')
      }}
      radius={4}
    >
      <WizardMesh />
    </NPC>
  )
}
