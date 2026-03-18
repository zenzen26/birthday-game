import React from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { MixedHexGrid } from '../world/HexGrid'
import InteractObject from '../world/InteractObject'
import Wizard from '../npcs/Wizard'
import { useGameStore } from '../stores/gameStore'

const ZONE3_OFFSET = [0, 0, -78]

function Prop({ path, position, rotation = [0, 0, 0], scale = 1, physics = true }) {
  const { scene } = useGLTF(path)
  const mesh = <primitive object={scene.clone()} position={position} rotation={rotation} scale={scale} />
  if (!physics) return mesh
  return <RigidBody type="fixed" colliders="trimesh">{mesh}</RigidBody>
}

function NoteObject({ position, id, text }) {
  const openDialogue = useGameStore(s => s.openDialogue)
  return (
    <InteractObject position={position} id={id} radius={2} onInteract={() => openDialogue([text])}>
      <mesh castShadow>
        <boxGeometry args={[0.25, 0.32, 0.02]} />
        <meshToonMaterial color="#fffde0" />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.02, 0.28, 0.01]} />
        <meshToonMaterial color="#cc2222" />
      </mesh>
    </InteractObject>
  )
}

function Tombstone({ position, rotation = [0, 0, 0], label }) {
  const openDialogue = useGameStore(s => s.openDialogue)
  const id = `tomb-${label.slice(0, 8)}`
  return (
    <InteractObject position={position} id={id} radius={2} onInteract={() => openDialogue([label])}>
      <group rotation={rotation}>
        {/* Stone slab */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.5, 0.9, 0.1]} />
          <meshToonMaterial color="#888898" />
        </mesh>
        {/* Arch top */}
        <mesh position={[0, 0.92, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.1, 8, 1, false, 0, Math.PI]} />
          <meshToonMaterial color="#888898" />
        </mesh>
        {/* Base */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <boxGeometry args={[0.7, 0.12, 0.2]} />
          <meshToonMaterial color="#777787" />
        </mesh>
      </group>
    </InteractObject>
  )
}

function SoupCauldron({ position }) {
  const openDialogue = useGameStore(s => s.openDialogue)
  return (
    <InteractObject position={position} id="soup-cauldron" radius={2.5}
      onInteract={() => openDialogue(["It smells incredible. You understand now. You understand everything."])}>
      <group>
        {/* Cauldron body */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.55, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
          <meshToonMaterial color="#222222" />
        </mesh>
        {/* Rim */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <torusGeometry args={[0.52, 0.06, 6, 14]} />
          <meshToonMaterial color="#333333" />
        </mesh>
        {/* Soup surface */}
        <mesh position={[0, 0.52, 0]}>
          <circleGeometry args={[0.48, 10]} />
          <meshToonMaterial color="#c87820" transparent opacity={0.9} />
        </mesh>
        {/* Bubble particles */}
        {[0.2, -0.15, 0.05, -0.25].map((x, i) => (
          <mesh key={i} position={[x, 0.62 + Math.sin(i * 1.3) * 0.08, (i - 1.5) * 0.15]}>
            <sphereGeometry args={[0.05, 5, 5]} />
            <meshToonMaterial color="#e09840" transparent opacity={0.6} />
          </mesh>
        ))}
        {/* Legs */}
        {[[0.38, 0, 0.22], [-0.38, 0, 0.22], [0, 0, -0.44]].map(([x, y, z], i) => (
          <mesh key={i} position={[x, 0.1, z]} castShadow>
            <cylinderGeometry args={[0.05, 0.04, 0.28, 4]} />
            <meshToonMaterial color="#1a1a1a" />
          </mesh>
        ))}
        <pointLight position={[0, 0.6, 0]} color="#ff8800" intensity={0.5} distance={4} />
      </group>
    </InteractObject>
  )
}

function DeadTree({ position, rotation = [0, 0, 0] }) {
  return (
    <RigidBody type="fixed" colliders="trimesh">
      <group position={position} rotation={rotation}>
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.18, 2.5, 5]} />
          <meshToonMaterial color="#3a2a1a" />
        </mesh>
        {/* Bare branches */}
        <mesh position={[0.3, 1.3, 0]} rotation={[0, 0, -0.6]} castShadow>
          <cylinderGeometry args={[0.04, 0.07, 0.8, 4]} />
          <meshToonMaterial color="#3a2a1a" />
        </mesh>
        <mesh position={[-0.25, 1.6, 0.1]} rotation={[0.2, 0, 0.5]} castShadow>
          <cylinderGeometry args={[0.04, 0.06, 0.7, 4]} />
          <meshToonMaterial color="#3a2a1a" />
        </mesh>
        <mesh position={[0.1, 1.9, -0.2]} rotation={[-0.3, 0, -0.3]} castShadow>
          <cylinderGeometry args={[0.03, 0.05, 0.6, 4]} />
          <meshToonMaterial color="#3a2a1a" />
        </mesh>
      </group>
    </RigidBody>
  )
}

// Ruined paper wall segment
function RuinWall({ position, rotation = [0, 0, 0], width = 3 }) {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={position} rotation={rotation} castShadow receiveShadow>
        <boxGeometry args={[width, 1.2, 0.3]} />
        <meshToonMaterial color="#9a9080" />
      </mesh>
    </RigidBody>
  )
}

export default function Zone3Tower() {
  return (
    <group position={ZONE3_OFFSET}>
      {/* Hex tiles: mostly grass, with a small moat of water around tower base */}
      <MixedHexGrid
        radius={13}
        yOffset={-0.5}
        classifier={(q, r) => {
          // Moat ring at distance 4–5 from center
          const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r))
          if (dist >= 4 && dist <= 5) return 'water'
          return 'grass'
        }}
        grassPath="/assets/hex_grass.gltf"
        waterPath="/assets/hex_water.gltf"
      />

      {/* Bridge over moat — two planks north side */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-0.5, 0, -9.5]} castShadow>
          <boxGeometry args={[0.8, 0.12, 3.5]} />
          <meshToonMaterial color="#8B6914" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0.5, 0, -9.5]} castShadow>
          <boxGeometry args={[0.8, 0.12, 3.5]} />
          <meshToonMaterial color="#8B6914" />
        </mesh>
      </RigidBody>

      {/* ---- THE CASTLE / TOWER ---- */}
      <Prop path="/assets/building_castle_red.gltf" position={[0, 0, -14]} rotation={[0, Math.PI, 0]} scale={2.0} />

      {/* ---- RUINED WALLS flanking approach ---- */}
      <RuinWall position={[-7, 0.6, -5]}  rotation={[0, 0.15, 0]} width={4} />
      <RuinWall position={[-8, 0.6, -9]}  rotation={[0, -0.1, 0]} width={3} />
      <RuinWall position={[7, 0.6, -5]}   rotation={[0, -0.15, 0]} width={4} />
      <RuinWall position={[8, 0.6, -9]}   rotation={[0, 0.1, 0]} width={3} />

      {/* Broken wall pieces */}
      <RuinWall position={[-5, 0.4, -12]} rotation={[0, 0.5, 0.15]} width={2} />
      <RuinWall position={[5, 0.4, -12]}  rotation={[0, -0.5, -0.1]} width={2} />

      {/* ---- DEAD GARDEN ---- */}
      <DeadTree position={[-4, 0, -3]}  rotation={[0, 0.5, 0]} />
      <DeadTree position={[4, 0, -3]}   rotation={[0, 2.1, 0]} />
      <DeadTree position={[-6, 0, -7]}  rotation={[0, 1.0, 0]} />
      <DeadTree position={[6, 0, -7]}   rotation={[0, 3.2, 0]} />
      <DeadTree position={[-3, 0, -11]} rotation={[0, 1.7, 0]} />
      <DeadTree position={[3, 0, -11]}  rotation={[0, 0.3, 0]} />

      {/* Dried paper flowers (just small colored meshes) */}
      {[[-2, 0, -2], [2, 0, -4], [-3, 0, -6], [3, 0, -5], [-1, 0, -8], [1, 0, -7]].map(([x, y, z], i) => (
        <group key={i} position={[x, 0.3, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.6, 4]} />
            <meshToonMaterial color="#556644" />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <dodecahedronGeometry args={[0.12, 0]} />
            <meshToonMaterial color={i % 2 === 0 ? "#8a5a5a" : "#7a6a4a"} />
          </mesh>
        </group>
      ))}

      {/* ---- GRAVEYARD (east side) ---- */}
      <Tombstone
        position={[8, 0, -4]}
        rotation={[0, -0.2, 0]}
        label="Here lies Chair. It became soup. It did not choose this."
      />
      <Tombstone
        position={[9.5, 0, -6]}
        rotation={[0, 0.3, 0]}
        label="Gerald IV. He was the best Gerald."
      />
      <Tombstone
        position={[8, 0, -8]}
        rotation={[0, -0.1, 0]}
        label="The wizard's patience. Gone too soon."
      />
      {/* Small fence around graveyard */}
      {[
        [[6.5, 0.3, -3], [0, 0, 0], 4],
        [[6.5, 0.3, -9], [0, 0, 0], 4],
        [[5, 0.3, -6],   [0, Math.PI/2, 0], 6],
        [[11.5, 0.3, -6],[0, Math.PI/2, 0], 6],
      ].map(([pos, rot, w], i) => (
        <mesh key={i} position={pos} rotation={rot} castShadow>
          <boxGeometry args={[w, 0.6, 0.06]} />
          <meshToonMaterial color="#5a3a10" />
        </mesh>
      ))}

      {/* ---- SOUP CAULDRON outside front door ---- */}
      <SoupCauldron position={[0, 0.5, -11.5]} />

      {/* Sticky notes on tower wall */}
      <InteractObject position={[-1.5, 1.5, -12.5]} id="sticky-note" radius={2.5}
        onInteract={() => useGameStore.getState().openDialogue(["DO NOT FEED THE CAT. (The cat has been fed.)"])}>
        <mesh rotation={[0, 0.2, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.02]} />
          <meshToonMaterial color="#ffff88" />
        </mesh>
      </InteractObject>

      {/* ---- NOTES ---- */}
      {/* Note 4 — broken wall halfway */}
      <NoteObject position={[-7.5, 1.3, -6]} id="note4"
        text="I have been here for what feels like SEVERAL BUSINESS DAYS. The wizard keeps asking if you're coming and honestly I don't know what to tell her anymore. I turned another chair into soup. On purpose this time. I'm not even sorry. HURRY UP." />

      {/* Note 5 — tower door */}
      <NoteObject position={[0.8, 1.5, -12.3]} id="note5"
        text="I SWEAR TO GOD IF YOU STOPPED TO READ EVERY SINGLE SIGN IN THIS PAPER WORLD I WILL— okay hi I missed you. but also WHAT TOOK YOU SO LONG. come inside the soup is still warm." />

      {/* ---- WIZARD at tower door ---- */}
      <Wizard position={[0, 0.5, -12]} />

      {/* ---- MOUNTAINS framing the tower ---- */}
      <Prop path="/assets/mountain_B.gltf" position={[-14, 0, -10]} rotation={[0, 0.4, 0]} scale={2.4} />
      <Prop path="/assets/mountain_A.gltf" position={[14, 0, -12]}  rotation={[0, 2.8, 0]} scale={2.2} />
      <Prop path="/assets/mountain_B.gltf" position={[0, 0, -22]}   rotation={[0, 1.2, 0]} scale={3.0} />

      {/* Clouds — purple tinted for eerie feel */}
      <Prop path="/assets/cloud_big.gltf" position={[-8, 10, -12]} rotation={[0, 0.7, 0]} scale={2.0} physics={false} />
      <Prop path="/assets/cloud_big.gltf" position={[9, 12, -8]}   rotation={[0, 2.1, 0]} scale={0.9} physics={false} />
      <Prop path="/assets/cloud_big.gltf" position={[0, 14, -16]}  rotation={[0, 0.0, 0]} scale={2.2} physics={false} />

      {/* Purple area light for tower mood */}
      <pointLight position={[0, 6, -14]} color="#8833ff" intensity={1.5} distance={20} />
    </group>
  )
}

export { ZONE3_OFFSET }