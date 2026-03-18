import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'

const _p = new THREE.Vector3()

// The nag gate sits at z = -28 (between forest and connecting path to tower)
// When player walks into it, check inventory. If incomplete, show nag note popup.

export default function NagGate() {
  const triggered   = useRef(false)
  const hasAllItems = useGameStore(s => s.hasAllItems)
  const nagCooldown = useGameStore(s => s.nagCooldown)
  const setNag      = useGameStore(s => s.setNagCooldown)
  const setPhase    = useGameStore(s => s.setGamePhase)
  const phase       = useGameStore(s => s.gamePhase)

  // Gate position — north edge of forest zone
  const GATE_Z = -52
  const GATE_RADIUS = 4

  useFrame(({ scene }) => {
    if (nagCooldown) return
    const player = scene.getObjectByName('player-root')
    if (!player) return
    player.getWorldPosition(_p)

    const dx = _p.x
    const dz = _p.z - GATE_Z
    const dist = Math.sqrt(dx * dx + dz * dz)

    if (dist < GATE_RADIUS) {
      if (!hasAllItems()) {
        setPhase('nagNote')
        setNag(true)
        setTimeout(() => setNag(false), 10000)
      }
    }
  })

  return null
}
