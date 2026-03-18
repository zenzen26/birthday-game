import { useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'

const MOVEMENT_KEYS = new Set([
  'KeyW','KeyA','KeyS','KeyD',
  'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
  'Space','ShiftLeft','ShiftRight',
])

export default function InteractionManager() {
  const nearby          = useGameStore(s => s.nearbyInteractable)
  const dialogueOpen    = useGameStore(s => s.dialogueOpen)
  const advanceDialogue = useGameStore(s => s.advanceDialogue)
  const gamePhase       = useGameStore(s => s.gamePhase)

  useEffect(() => {
    function onKeyDown(e) {
      // Block movement keys during dialogue — keeps player upright without ragdoll
      if (dialogueOpen && MOVEMENT_KEYS.has(e.code)) {
        e.stopImmediatePropagation()
        e.preventDefault()
        return
      }

      if (e.code !== 'KeyE') return

      // Dialogue advance
      if (dialogueOpen) {
        advanceDialogue()
        return
      }

      // Dismiss nag note
      if (gamePhase === 'nagNote') {
        useGameStore.getState().setGamePhase('playing')
        return
      }

      // Trigger nearby interactable
      if (nearby?.onInteract) {
        nearby.onInteract()
      }
    }

    // Use capture phase so we intercept before Ecctrl's KeyboardControls
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [nearby, dialogueOpen, advanceDialogue, gamePhase])

  return null
}