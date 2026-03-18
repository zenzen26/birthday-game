import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'

const _target = new THREE.Vector3()
const _pos    = new THREE.Vector3()

function CatMesh() {
  return (
    <group scale={0.55}>
      {/* Body */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.55, 0.38, 0.35]} />
        <meshToonMaterial color="#555555" />
      </mesh>
      {/* Head */}
      <mesh position={[0.3, 0.55, 0]} castShadow>
        <boxGeometry args={[0.38, 0.35, 0.32]} />
        <meshToonMaterial color="#555555" />
      </mesh>
      {/* Ears */}
      <mesh position={[0.22, 0.78, 0.1]} castShadow>
        <coneGeometry args={[0.07, 0.14, 3]} />
        <meshToonMaterial color="#444444" />
      </mesh>
      <mesh position={[0.22, 0.78, -0.1]} castShadow>
        <coneGeometry args={[0.07, 0.14, 3]} />
        <meshToonMaterial color="#444444" />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.5, 0.6, 0.1]}>
        <sphereGeometry args={[0.055, 5, 5]} />
        <meshToonMaterial color="#88ff44" />
      </mesh>
      <mesh position={[0.5, 0.6, -0.1]}>
        <sphereGeometry args={[0.055, 5, 5]} />
        <meshToonMaterial color="#88ff44" />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.32, 0.45, 0]} rotation={[0, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.04, 0.07, 0.6, 5]} />
        <meshToonMaterial color="#555555" />
      </mesh>
      <mesh position={[-0.55, 0.72, 0]} castShadow>
        <sphereGeometry args={[0.1, 5, 5]} />
        <meshToonMaterial color="#555555" />
      </mesh>
    </group>
  )
}

export default function CatCompanion() {
  const catFollows = useGameStore(s => s.catFollows)
  const ref = useRef()
  const wobble = useRef(0)

  useFrame(({ scene, clock }, delta) => {
    if (!catFollows || !ref.current) return
    const player = scene.getObjectByName('player-root')
    if (!player) return

    player.getWorldPosition(_target)
    ref.current.getWorldPosition(_pos)

    // Follow at a slight offset
    _target.x += 1.2
    _target.z += 1.2
    _target.y = _pos.y  // keep on ground level

    const dist = _pos.distanceTo(_target)
    if (dist > 0.5) {
      const speed = Math.min(dist * 3, 7)
      const dir = _target.clone().sub(_pos).normalize()
      ref.current.position.addScaledVector(dir, speed * delta)

      // Face direction of travel
      ref.current.rotation.y = Math.atan2(dir.x, dir.z)
    }

    // Idle bob
    ref.current.position.y = Math.sin(clock.elapsedTime * 4) * 0.05
  })

  if (!catFollows) return null

  return (
    <group ref={ref} position={[1.2, 0, 8.2]}>
      <CatMesh />
    </group>
  )
}
