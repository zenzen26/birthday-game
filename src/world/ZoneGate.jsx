import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'

const _p = new THREE.Vector3()

export default function ZoneGate({ position, radius = 4, onEnter, label = '→' }) {
  const ref = useRef()
  const triggered = useRef(false)

  useFrame(({ scene }) => {
    if (triggered.current) return
    const player = scene.getObjectByName('player-root')
    if (!player) return
    player.getWorldPosition(_p)
    const dx = _p.x - position[0]
    const dz = _p.z - position[2]
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist < radius) {
      triggered.current = true
      onEnter()
      // Allow re-trigger after 3s
      setTimeout(() => { triggered.current = false }, 3000)
    }
  })

  return (
    <group ref={ref} position={position}>
      {/* Visual marker - wooden sign-style */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[1.2, 0.6, 0.1]} />
        <meshStandardMaterial color="#8B6914" />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.8, 6]} />
        <meshStandardMaterial color="#6b4c11" />
      </mesh>
    </group>
  )
}
