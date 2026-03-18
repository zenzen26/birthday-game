import { useGLTF } from '@react-three/drei'

const ASSETS = [
  '/assets/MC.glb',
  '/assets/hex_grass.gltf',
  '/assets/hex_water.gltf',
  '/assets/building_home_A_yellow.gltf',
  '/assets/building_home_B_blue.gltf',
  '/assets/building_castle_red.gltf',
  '/assets/tree_single_B.gltf',
  '/assets/trees_B_large.gltf',
  '/assets/rock_single_E.gltf',
  '/assets/mountain_A.gltf',
  '/assets/mountain_B.gltf',
  '/assets/cloud_big.gltf',
]

// Call this once at module level to kick off preloading
ASSETS.forEach(path => useGLTF.preload(path))

export default ASSETS
