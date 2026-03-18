import { create } from 'zustand'

export const useGameStore = create((set, get) => ({
  gamePhase: 'ransomNote',
  setGamePhase: (phase) => set({ gamePhase: phase }),

  // 5 new treasures
  inventory: [],
  hasItem: (item) => get().inventory.includes(item),
  collectItem: (item) => {
    if (!get().inventory.includes(item)) {
      set((s) => ({ inventory: [...s.inventory, item] }))
    }
  },
  hasAllItems: () => {
    const inv = get().inventory
    return ['driedfish','underwear','liquid','finger','mushroom'].every(i => inv.includes(i))
  },

  // Dialogue
  dialogueOpen: false,
  dialogueLines: [],
  dialogueLine: 0,
  dialogueCallback: null,
  dialogueSpeaker: '',
  openDialogue: (lines, callback = null, speaker = '') => set({
    dialogueOpen: true, dialogueLines: lines, dialogueLine: 0, dialogueCallback: callback, dialogueSpeaker: speaker
  }),
  advanceDialogue: () => {
    const { dialogueLine, dialogueLines, dialogueCallback } = get()
    if (dialogueLine < dialogueLines.length - 1) {
      set({ dialogueLine: dialogueLine + 1 })
    } else {
      set({ dialogueOpen: false, dialogueLines: [], dialogueLine: 0 })
      if (dialogueCallback) dialogueCallback()
    }
  },

  usedNPCs: new Set(),
  markNPCUsed: (id) => set((s) => ({ usedNPCs: new Set([...s.usedNPCs, id]) })),
  isNPCUsed: (id) => get().usedNPCs.has(id),

  nearbyInteractable: null,
  setNearbyInteractable: (obj) => set({ nearbyInteractable: obj }),

  gateWarned: false,
  setGateWarned: (v) => set({ gateWarned: v }),

  catFollows: false,
  setCatFollows: (v) => set({ catFollows: v }),

  cakeScene: 'idle', // 'idle' | 'active' | 'done'
  setCakeScene: (v) => set({ cakeScene: v }),

  nagCooldown: false,
  setNagCooldown: (v) => set({ nagCooldown: v }),
}))