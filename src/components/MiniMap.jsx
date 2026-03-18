import { useEffect, useRef, useState, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useGameStore } from '../stores/gameStore'
import * as THREE from 'three'
import WORLD_JSON from './worldData.json'

// Only the two unique world-pickup treasures
const TREASURE_POSITIONS = [
  { id: 'obj_114', x: 8.782,  z: -36.05  }, // mushroom
  { id: 'obj_115', x: 36.713, z: -65.012 }, // finger
]

const ITEM_KEYS = {
  obj_114: 'mushroom',
  obj_115: 'finger',
  obj_116: 'finger',
  obj_117: 'mushroom',
  obj_118: 'mushroom',
}
// Only show unique items
const UNIQUE_ITEM_KEYS = { obj_114: 'mushroom', obj_115: 'finger' }
const ITEM_ICONS = {
  driedfish: '🐟', underwear: '👙', liquid: '🍶', finger: '👆', mushroom: '🍄'
}
// NPCs that give items directly (not world pickups) — show on map as ★
const NPC_ITEM_POSITIONS = [
  { x: 52.4, z: -64.2, key: 'driedfish', icon: '🐟' }, // Barry
  { x: 57.1, z: -27.6, key: 'liquid',    icon: '🍶' }, // Sister Maeve (obj_98 is old woman)
  { x: 60.0, z: -51.2, key: 'underwear', icon: '👙' }, // Old Woman
]

// World bounds from tiles
const TILE_ENTRIES = Object.keys(WORLD_JSON.tiles).map(k => {
  const [q,r] = k.split(',').map(Number)
  const x = 1.0 * (3/2) * q
  const z = 1.0 * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r)
  return [x, z]
})
const WX_MIN = Math.min(...TILE_ENTRIES.map(([x]) => x)) - 2
const WX_MAX = Math.max(...TILE_ENTRIES.map(([x]) => x)) + 2
const WZ_MIN = Math.min(...TILE_ENTRIES.map(([,z]) => z)) - 2
const WZ_MAX = Math.max(...TILE_ENTRIES.map(([,z]) => z)) + 2

// Convert world xz to canvas uv [0..1]
function worldToUV(wx, wz) {
  return [
    (wx - WX_MIN) / (WX_MAX - WX_MIN),
    (wz - WZ_MIN) / (WZ_MAX - WZ_MIN),
  ]
}

// Read player position from scene — bridge component inside Canvas
const _pos = new THREE.Vector3()
export function MiniMapBridge({ onPos }) {
  useFrame(({ scene }) => {
    const p = scene.getObjectByName('player-root')
    if (p) { p.getWorldPosition(_pos); onPos(_pos.x, _pos.z) }
  })
  return null
}

// The actual minimap UI (outside Canvas)
export default function MiniMap({ playerX, playerZ }) {
  const inventory = useGameStore(s => s.inventory)
  const canvasRef = useRef()
  const MAP_SIZE  = 220

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE)

    // Background
    ctx.fillStyle = 'rgba(10,6,26,0.92)'
    ctx.beginPath()
    ctx.roundRect(0, 0, MAP_SIZE, MAP_SIZE, 12)
    ctx.fill()

    // Draw tiles
    const grassColor = '#3a7a28'
    const waterColor = '#2255aa'
    Object.entries(WORLD_JSON.tiles).forEach(([key, type]) => {
      const [q,r] = key.split(',').map(Number)
      const wx = 1.0 * (3/2) * q
      const wz = 1.0 * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r)
      const [u, v] = worldToUV(wx, wz)
      const cx = u * MAP_SIZE
      const cy = v * MAP_SIZE
      ctx.fillStyle = type === 'water' ? waterColor : grassColor
      ctx.beginPath()
      // Tiny hex dot
      for (let i = 0; i < 6; i++) {
        const a = Math.PI/180*(60*i-30)
        const r2 = 2.2
        if (i === 0) ctx.moveTo(cx + r2*Math.cos(a), cy + r2*Math.sin(a))
        else         ctx.lineTo(cx + r2*Math.cos(a), cy + r2*Math.sin(a))
      }
      ctx.closePath()
      ctx.fill()
    })

    // Treasures — only uncollected ones, shown as blinking dots
    TREASURE_POSITIONS.forEach(({ id, x, z }) => {
      const key = ITEM_KEYS[id]
      if (inventory.includes(key)) return // already collected
      const [u, v] = worldToUV(x, z)
      const cx = u * MAP_SIZE
      const cy = v * MAP_SIZE
      ctx.fillStyle = '#ffdd22'
      ctx.shadowColor = '#ffaa00'
      ctx.shadowBlur = 6
      ctx.beginPath()
      ctx.arc(cx, cy, 3.5, 0, Math.PI*2)
      ctx.fill()
      ctx.shadowBlur = 0
    })

    // Player dot
    if (playerX !== undefined && playerZ !== undefined) {
      const [u, v] = worldToUV(playerX, playerZ)
      const cx = u * MAP_SIZE
      const cy = v * MAP_SIZE
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = '#aaddff'
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(cx, cy, 4, 0, Math.PI*2)
      ctx.fill()
      ctx.shadowBlur = 0
      // Player direction triangle (simple)
      ctx.fillStyle = '#88ccff'
      ctx.beginPath()
      ctx.arc(cx, cy, 6, 0, Math.PI*2)
      ctx.strokeStyle = '#aaddff'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // Border
    ctx.strokeStyle = 'rgba(150,100,255,0.6)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(1, 1, MAP_SIZE-2, MAP_SIZE-2, 11)
    ctx.stroke()

  }, [inventory, playerX, playerZ])

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: 120,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.7), 0 0 0 1px rgba(150,100,255,0.4)',
    }}>
      <canvas ref={canvasRef} width={MAP_SIZE} height={MAP_SIZE} style={{ display:'block' }} />
      {/* Legend — all 5 items */}
      <div style={{
        background: 'rgba(10,6,26,0.92)',
        borderTop: '1px solid rgba(150,100,255,0.3)',
        padding: '5px 10px',
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        maxWidth: `${MAP_SIZE}px`,
      }}>
        {['driedfish','underwear','liquid','finger','mushroom'].map(key => (
          <span key={key} style={{
            fontSize: '14px',
            opacity: inventory.includes(key) ? 0.3 : 1,
            filter: inventory.includes(key) ? 'grayscale(1)' : 'none',
            transition: 'all 0.4s',
          }}>
            {ITEM_ICONS[key]}
          </span>
        ))}
        <span style={{ fontSize: '10px', color: 'rgba(180,140,255,0.4)', marginLeft: 'auto', alignSelf: 'center' }}>
          🟡 = find
        </span>
      </div>
    </div>
  )
}