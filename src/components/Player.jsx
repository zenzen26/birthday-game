import React, { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import Ecctrl from 'ecctrl'
import { useGameStore } from '../stores/gameStore'

export default function Player() {
  const { scene }         = useGLTF('/assets/MC.glb')
  const gamePhase         = useGameStore(s => s.gamePhase)
  const { world }         = useRapier()

  // NEVER disable control — it ragdolls the character.
  // Movement is blocked in InteractionManager by swallowing key events instead.
  const disableControl = gamePhase === 'ending'

  // Pointer lock
  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const lock = () => { if (document.pointerLockElement !== canvas) canvas.requestPointerLock() }
    canvas.addEventListener('click', lock)
    return () => canvas.removeEventListener('click', lock)
  }, [])

  // Respawn — reads window.__respawnRequest
  useFrame(() => {
    const req = window.__respawnRequest
    if (!req) return
    window.__respawnRequest = null
    try {
      world.bodies.forEach(rb => {
        if (rb.isDynamic()) {
          rb.setTranslation({ x: req.x, y: req.y, z: req.z }, true)
          rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
          rb.setAngvel({ x: 0, y: 0, z: 0 }, true)
        }
      })
    } catch (_) {}
  })

  return (
    <Ecctrl
      position={[52.364, 14, -72.234]}
      camInitDis={-6} camMaxDis={-9} camMinDis={-3}
      camUpLimit={0.4} camLowLimit={-0.8}
      capsuleHalfHeight={0.5} capsuleRadius={0.35}
      floatHeight={0.8} maxVelLimit={5} sprintMult={1.8} jumpVel={8}
      disableControl={disableControl}
      name="player-root"
    >
      <primitive
        object={scene}
        scale={0.9}
        position={[0, -0.5, 0]}
        rotation={[Math.PI, 0, 0]}
        castShadow
      />
    </Ecctrl>
  )
}