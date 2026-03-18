import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../stores/gameStore'

const _p = new THREE.Vector3()
const _o = new THREE.Vector3()

export default function NPC({ position, radius = 3, id, dialogueLines, onDialogueEnd, children }) {
  const ref = useRef()
  const setNearby    = useGameStore(s => s.setNearbyInteractable)
  const nearby       = useGameStore(s => s.nearbyInteractable)
  const openDialogue = useGameStore(s => s.openDialogue)
  const isUsed       = useGameStore(s => s.isNPCUsed)
  const markUsed     = useGameStore(s => s.markNPCUsed)
  const dialogueOpen = useGameStore(s => s.dialogueOpen)

  useFrame(({ scene }) => {
    if (!ref.current || dialogueOpen) return
    const player = scene.getObjectByName('player-root')
    if (!player) return
    player.getWorldPosition(_p)
    ref.current.getWorldPosition(_o)
    const dist = _p.distanceTo(_o)

    if (dist < radius) {
      setNearby({
        id,
        label: isUsed(id) ? '💬 [E]' : '! [E]',
        onInteract: () => {
          const lines = typeof dialogueLines === 'function'
            ? dialogueLines()
            : dialogueLines
          openDialogue(lines, () => {
            markUsed(id)
            if (onDialogueEnd) onDialogueEnd()
          })
        }
      })
    } else if (nearby?.id === id) {
      setNearby(null)
    }
  })

  // Gentle idle bob
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = (position[1] ?? 0) + Math.sin(clock.elapsedTime * 1.5 + id.length) * 0.08
    }
  })

  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  )
}
