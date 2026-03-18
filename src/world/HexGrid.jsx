import React, { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'

// KayKit hex tiles: flat-top orientation
// Real tile width tip-to-tip ≈ 2 units, so size = 1.0
// We overlap tiles VERY slightly (scale 1.02) to eliminate triangular gaps
const HEX_SIZE  = 1.0
const TILE_SCALE = 1.03   // 3% overlap kills gap seams

function hexToWorld(q, r) {
  const x = HEX_SIZE * (3 / 2) * q
  const z = HEX_SIZE * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r)
  return [x, 0, z]
}

function hexCircle(radius) {
  const coords = []
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius)
    const r2 = Math.min(radius,  -q + radius)
    for (let r = r1; r <= r2; r++) coords.push([q, r])
  }
  return coords
}

// Each tile gets a flat CuboidCollider — reliable, no tunnelling
function HexTile({ gltfScene, x, z, yOffset }) {
  return (
    <RigidBody type="fixed" colliders={false} position={[x, yOffset, z]}>
      <CuboidCollider args={[1.05, 0.2, 1.05]} position={[0, 0.2, 0]} />
      <primitive object={gltfScene.clone()} scale={TILE_SCALE} />
    </RigidBody>
  )
}

export function HexGrid({ modelPath, radius = 8, yOffset = 0 }) {
  const { scene } = useGLTF(modelPath)
  const coords    = useMemo(() => hexCircle(radius), [radius])
  return (
    <group>
      {coords.map(([q, r]) => {
        const [x, , z] = hexToWorld(q, r)
        return <HexTile key={`${q}_${r}`} gltfScene={scene} x={x} z={z} yOffset={yOffset} />
      })}
    </group>
  )
}

export function MixedHexGrid({ radius, yOffset = 0, classifier, grassPath, waterPath }) {
  const grassGltf = useGLTF(grassPath)
  const waterGltf = useGLTF(waterPath)
  const coords    = useMemo(() => hexCircle(radius), [radius])
  return (
    <group>
      {coords.map(([q, r]) => {
        const [x, , z] = hexToWorld(q, r)
        const gltf = classifier(q, r) === 'water' ? waterGltf : grassGltf
        return <HexTile key={`${q}_${r}`} gltfScene={gltf.scene} x={x} z={z} yOffset={yOffset} />
      })}
    </group>
  )
}

export { hexToWorld, hexCircle }