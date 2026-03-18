import React from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

// A narrow 3-hex-wide strip of grass tiles connecting two zones
// Runs from z=startZ to z=endZ in steps

function PathTile({ path, position }) {
  const { scene } = useGLTF(path)
  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={scene.clone()} position={position} />
    </RigidBody>
  )
}

export default function ConnectingPaths() {
  const grassPath = "/assets/hex_grass.gltf"

  // Hex tile spacing: width ~1.732, height ~2.0 flat-top
  // We'll place 3 columns (x = -1.732, 0, 1.732) for each row
  const cols = [-1.732, 0, 1.732]

  // Path 1: Village (z~-12) to Forest (z~-24)  → z from -13 to -25
  const path1Rows = []
  for (let z = -13; z >= -25; z -= 2.0) {
    cols.forEach(x => path1Rows.push([x, -0.5, z]))
  }

  // Path 2: Forest (z~-52) to Tower (z~-64)  → z from -53 to -65
  const path2Rows = []
  for (let z = -53; z >= -65; z -= 2.0) {
    cols.forEach(x => path2Rows.push([x, -0.5, z]))
  }

  return (
    <group>
      {path1Rows.map(([x, y, z], i) => (
        <PathTile key={`p1-${i}`} path={grassPath} position={[x, y, z]} />
      ))}
      {path2Rows.map(([x, y, z], i) => (
        <PathTile key={`p2-${i}`} path={grassPath} position={[x, y, z]} />
      ))}
    </group>
  )
}
