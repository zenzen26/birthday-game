import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'

const _playerPos = new THREE.Vector3()
const _objPos    = new THREE.Vector3()

export default function InteractObject({ position, radius = 2.5, id, onInteract, children }) {
  const ref = useRef()
  const setNearby = useGameStore(s => s.setNearbyInteractable)
  const nearby    = useGameStore(s => s.nearbyInteractable)
  const dialogueOpen = useGameStore(s => s.dialogueOpen)

  // Register/unregister proximity each frame
  useFrame(({ scene }) => {
    if (!ref.current) return
    // Find player rigidbody or ecctrl group by name
    const player = scene.getObjectByName('player-root')
    if (!player) return
    player.getWorldPosition(_playerPos)
    ref.current.getWorldPosition(_objPos)
    const dist = _playerPos.distanceTo(_objPos)
    if (dist < radius) {
      setNearby({ id, onInteract })
    } else if (nearby?.id === id) {
      setNearby(null)
    }
  })

  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  )
}
