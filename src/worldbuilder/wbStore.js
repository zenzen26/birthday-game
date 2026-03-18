import { create } from 'zustand'

let _nextId = 1
const uid = () => `obj_${_nextId++}`

export const OBJECT_TYPES = {
  PROP:      'prop',
  NPC:       'npc',
  NOTE:      'note',
  TREASURE:  'treasure',
  ZONE_GATE: 'zone_gate',
}

export const NPC_COLORS = {
  quest:    '#ffcc00',
  villager: '#44aaff',
  enemy:    '#ff4444',
  merchant: '#44dd88',
  neutral:  '#cc88ff',
}

// ── All available GLTF assets ──────────────────────────────────────
export const PROP_ASSETS = [
  // Buildings
  { label: 'Home Yellow',        path: '/assets/building_home_A_yellow.gltf',   group: 'Buildings' },
  { label: 'Home Blue',          path: '/assets/building_home_B_blue.gltf',     group: 'Buildings' },
  { label: 'Castle Red',         path: '/assets/building_castle_red.gltf',      group: 'Buildings' },
  { label: 'Tower Blue',         path: '/assets/building_tower_B_blue.gltf',    group: 'Buildings' },
  { label: 'Watermill Blue',     path: '/assets/building_watermill_blue.gltf',  group: 'Buildings' },
  { label: 'Barracks Yellow',    path: '/assets/building_barracks_yellow.gltf', group: 'Buildings' },
  { label: 'Destroyed Building', path: '/assets/building_destroyed.gltf',       group: 'Buildings' },
  // Walls & Fences
  { label: 'Wall Straight',      path: '/assets/wall_straight.gltf',            group: 'Walls' },
  { label: 'Wall Straight Gate', path: '/assets/wall_straight_gate.gltf',       group: 'Walls' },
  { label: 'Wall Corner A Gate', path: '/assets/wall_corner_A_gate.gltf',       group: 'Walls' },
  { label: 'Wall Corner A In',   path: '/assets/wall_corner_A_inside.gltf',     group: 'Walls' },
  { label: 'Wall Corner A Out',  path: '/assets/wall_corner_A_outside.gltf',    group: 'Walls' },
  { label: 'Wall Corner B In',   path: '/assets/wall_corner_B_inside.gltf',     group: 'Walls' },
  { label: 'Wall Corner B Out',  path: '/assets/wall_corner_B_outside.gltf',    group: 'Walls' },
  { label: 'Fence Stone',        path: '/assets/fence_stone_straight.gltf',     group: 'Walls' },
  // Nature
  { label: 'Tree Single',        path: '/assets/tree_single_B.gltf',            group: 'Nature' },
  { label: 'Tree Large',         path: '/assets/trees_B_large.gltf',            group: 'Nature' },
  { label: 'Rock',               path: '/assets/rock_single_E.gltf',            group: 'Nature' },
  { label: 'Mountain A',         path: '/assets/mountain_A.gltf',               group: 'Nature' },
  { label: 'Mountain B',         path: '/assets/mountain_B.gltf',               group: 'Nature' },
  { label: 'Cloud',              path: '/assets/cloud_big.gltf',                group: 'Nature' },
]

export const ASSET_GROUPS = ['Buildings', 'Walls', 'Nature']

// ── Hex tile math ──────────────────────────────────────────────────
const HEX_SIZE = 1.0
export function hexToWorld(q, r) {
  const x = HEX_SIZE * (3 / 2) * q
  const z = HEX_SIZE * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r)
  return [x, z]
}
export function worldToHex(x, z) {
  const q = (2 / 3) * x / HEX_SIZE
  const r = ((-1 / 3) * x + (Math.sqrt(3) / 3) * z) / HEX_SIZE
  return axialRound(q, r)
}
function axialRound(q, r) {
  const s = -q - r
  let rq = Math.round(q), rr = Math.round(r), rs = Math.round(s)
  const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s)
  if (dq > dr && dq > ds) rq = -rr - rs
  else if (dr > ds) rr = -rq - rs
  return [rq, rr]
}

// ── Store ──────────────────────────────────────────────────────────
export const useWBStore = create((set, get) => ({
  // ── Objects (props, NPCs, notes, etc.) ──
  objects: [],
  selectedId: null,
  setSelected: (id) => set({ selectedId: id }),

  // ── Tiles: Map of "q,r" → tile type ('grass'|'water'|'empty') ──
  tiles: {},
  activeTileType: 'grass',   // what painting with tile tool places
  setActiveTileType: (t) => set({ activeTileType: t }),

  setTile: (q, r, type) => set((s) => {
    const key = `${q},${r}`
    const tiles = { ...s.tiles }
    if (type === 'erase') {
      delete tiles[key]
    } else {
      tiles[key] = type
    }
    return { tiles }
  }),

  fillHexCircle: (centerQ, centerR, radius, type) => {
    const tiles = { ...get().tiles }
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius)
      const r2 = Math.min(radius, -q + radius)
      for (let r = r1; r <= r2; r++) {
        const key = `${centerQ + q},${centerR + r}`
        if (type === 'erase') delete tiles[key]
        else tiles[key] = type
      }
    }
    set({ tiles })
  },

  clearTiles: () => set({ tiles: {} }),

  // ── Active tool ──
  // 'select' | 'place' | 'tile_paint' | 'tile_erase'
  tool: 'select',
  setTool: (t) => set({ tool: t }),

  // Active tab in sidebar: 'objects' | 'tiles'
  sidebarTab: 'objects',
  setSidebarTab: (t) => set({ sidebarTab: t }),

  // ── Pending place settings ──
  pendingType:       'prop',
  pendingAsset:      PROP_ASSETS[0].path,
  pendingAssetGroup: 'Buildings',
  pendingNpcColor:   'quest',
  pendingNpcId:      '',
  pendingNoteId:     '',
  pendingTreasureId: '',
  pendingScale:      1.0,
  pendingRotY:       0,

  setPendingType:       (v) => set({ pendingType: v }),
  setPendingAsset:      (v) => set({ pendingAsset: v }),
  setPendingAssetGroup: (v) => set({ pendingAssetGroup: v }),
  setPendingNpcColor:   (v) => set({ pendingNpcColor: v }),
  setPendingNpcId:      (v) => set({ pendingNpcId: v }),
  setPendingNoteId:     (v) => set({ pendingNoteId: v }),
  setPendingTreasureId: (v) => set({ pendingTreasureId: v }),
  setPendingScale:      (v) => set({ pendingScale: parseFloat(v) }),
  setPendingRotY:       (v) => set({ pendingRotY: parseFloat(v) }),

  placeObject: (x, z) => {
    const s = get()
    const id = uid()
    const base = { id, x: +x.toFixed(3), y: 0, z: +z.toFixed(3), rotY: +s.pendingRotY.toFixed(3), scale: s.pendingScale }
    let obj
    if      (s.pendingType === 'prop')      obj = { ...base, type: 'prop',      asset:       s.pendingAsset }
    else if (s.pendingType === 'npc')       obj = { ...base, type: 'npc',       npcId:       s.pendingNpcId || id, color: s.pendingNpcColor }
    else if (s.pendingType === 'note')      obj = { ...base, type: 'note',      noteId:      s.pendingNoteId || id }
    else if (s.pendingType === 'treasure')  obj = { ...base, type: 'treasure',  treasureId:  s.pendingTreasureId || id }
    else                                    obj = { ...base, type: 'zone_gate', label: 'Zone Gate', radius: 4 }
    set((st) => ({ objects: [...st.objects, obj], selectedId: id }))
  },

  updateObject: (id, patch) =>
    set((s) => ({ objects: s.objects.map(o => o.id === id ? { ...o, ...patch } : o) })),

  deleteObject: (id) =>
    set((s) => ({
      objects: s.objects.filter(o => o.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  clearObjects: () => set({ objects: [], selectedId: null }),

  // ── Import / Export ──
  importJSON: (json) => {
    try {
      const data = JSON.parse(json)
      const objs  = Array.isArray(data) ? data : (data.objects ?? [])
      const tiles = Array.isArray(data) ? {} : (data.tiles ?? {})
      _nextId = objs.length + 100
      set({ objects: objs, tiles, selectedId: null })
    } catch (e) {
      alert('Invalid JSON: ' + e.message)
    }
  },

  exportJSON: () => {
    const { objects, tiles } = get()
    return JSON.stringify({ objects, tiles }, null, 2)
  },
}))