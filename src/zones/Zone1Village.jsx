import React from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { MixedHexGrid } from '../world/HexGrid'
import NPC from '../world/NPC'
import InteractObject from '../world/InteractObject'
import Gerald from '../npcs/Gerald'
import Mortimer from '../npcs/Mortimer'
import { useGameStore } from '../stores/gameStore'

function Prop({ path, position, rotation = [0, 0, 0], scale = 1, physics = true }) {
  const { scene } = useGLTF(path)
  const mesh = <primitive object={scene.clone()} position={position} rotation={rotation} scale={scale} />
  if (!physics) return mesh
  return <RigidBody type="fixed" colliders="trimesh">{mesh}</RigidBody>
}

function Building({ path, position, rotation = [0, 0, 0], scale = 1 }) {
  const { scene } = useGLTF(path)
  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={scene.clone()} position={position} rotation={rotation} scale={scale} />
    </RigidBody>
  )
}

function LanternPost({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 2.4, 5]} />
        <meshToonMaterial color="#5a3a10" />
      </mesh>
      <mesh position={[0, 2.6, 0]} castShadow>
        <boxGeometry args={[0.38, 0.42, 0.38]} />
        <meshToonMaterial color="#ffe080" transparent opacity={0.85} />
      </mesh>
      <pointLight position={[0, 2.6, 0]} color="#ffcc44" intensity={0.9} distance={7} />
    </group>
  )
}

function NoteObject({ position, id, text }) {
  const openDialogue = useGameStore(s => s.openDialogue)
  return (
    <InteractObject position={position} id={id} radius={2} onInteract={() => openDialogue([text])}>
      <mesh castShadow>
        <boxGeometry args={[0.28, 0.36, 0.03]} />
        <meshToonMaterial color="#fffde0" />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.03, 0.32, 0.01]} />
        <meshToonMaterial color="#cc2222" />
      </mesh>
    </InteractObject>
  )
}

function Well({ position }) {
  const openDialogue = useGameStore(s => s.openDialogue)
  return (
    <InteractObject position={position} id="village-well" radius={2.5}
      onInteract={() => openDialogue(["You peer inside. It's full of tiny paper fish. They look at you."])}>
      <group>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.8, 10, 1, true]} />
          <meshToonMaterial color="#888878" side={2} />
        </mesh>
        <mesh position={[-0.6, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.4, 5]} />
          <meshToonMaterial color="#6b3d0f" />
        </mesh>
        <mesh position={[0.6, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.4, 5]} />
          <meshToonMaterial color="#6b3d0f" />
        </mesh>
        <mesh position={[0, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.3, 5]} />
          <meshToonMaterial color="#6b3d0f" />
        </mesh>
      </group>
    </InteractObject>
  )
}

function NoticeBoard({ position }) {
  const openDialogue = useGameStore(s => s.openDialogue)
  return (
    <InteractObject position={position} id="notice-board" radius={2.5}
      onInteract={() => openDialogue(["MISSING: one backwards clock. If found, do not return it. — The Raccoon"])}>
      <group>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[1.2, 0.9, 0.08]} />
          <meshToonMaterial color="#a07040" />
        </mesh>
        <mesh position={[-0.42, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 1.7, 5]} />
          <meshToonMaterial color="#6b3d0f" />
        </mesh>
        <mesh position={[0.42, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 1.7, 5]} />
          <meshToonMaterial color="#6b3d0f" />
        </mesh>
      </group>
    </InteractObject>
  )
}

// ── Random villager NPC meshes ──────────────────────────────────────

function VillagerA() { // Round person with hat
  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.32, 7, 7]} />
        <meshToonMaterial color="#e8c090" />
      </mesh>
      <mesh position={[0, 0.88, 0]} castShadow>
        <sphereGeometry args={[0.22, 7, 7]} />
        <meshToonMaterial color="#e8c090" />
      </mesh>
      <mesh position={[0, 1.08, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.06, 8]} />
        <meshToonMaterial color="#5a3010" />
      </mesh>
      <mesh position={[0, 1.28, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.38, 8]} />
        <meshToonMaterial color="#5a3010" />
      </mesh>
      <mesh position={[0.1, 0.9, 0.18]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshToonMaterial color="#222" />
      </mesh>
      <mesh position={[-0.1, 0.9, 0.18]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshToonMaterial color="#222" />
      </mesh>
    </group>
  )
}

function VillagerB() { // Tall thin person with scarf
  return (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 1.1, 7]} />
        <meshToonMaterial color="#4a8a4a" />
      </mesh>
      <mesh position={[0, 1.28, 0]} castShadow>
        <sphereGeometry args={[0.24, 7, 7]} />
        <meshToonMaterial color="#f0d0a0" />
      </mesh>
      <mesh position={[0, 1.1, 0.18]} castShadow>
        <torusGeometry args={[0.18, 0.06, 5, 10, Math.PI]} />
        <meshToonMaterial color="#cc4444" />
      </mesh>
      <mesh position={[0.1, 1.3, 0.2]}>
        <sphereGeometry args={[0.045, 4, 4]} />
        <meshToonMaterial color="#222" />
      </mesh>
      <mesh position={[-0.1, 1.3, 0.2]}>
        <sphereGeometry args={[0.045, 4, 4]} />
        <meshToonMaterial color="#222" />
      </mesh>
    </group>
  )
}

function VillagerC() { // Child-sized round person
  return (
    <group scale={0.72}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.3, 7, 7]} />
        <meshToonMaterial color="#c08060" />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <sphereGeometry args={[0.22, 7, 7]} />
        <meshToonMaterial color="#c08060" />
      </mesh>
      <mesh position={[0.09, 0.76, 0.18]}>
        <sphereGeometry args={[0.045, 4, 4]} />
        <meshToonMaterial color="#222" />
      </mesh>
      <mesh position={[-0.09, 0.76, 0.18]}>
        <sphereGeometry args={[0.045, 4, 4]} />
        <meshToonMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0.98, 0]} castShadow>
        <sphereGeometry args={[0.18, 5, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshToonMaterial color="#ff8844" />
      </mesh>
    </group>
  )
}

function VillagerD() { // Hooded figure with cloak
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow>
        <coneGeometry args={[0.38, 1.1, 8]} />
        <meshToonMaterial color="#334466" />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.22, 7, 7]} />
        <meshToonMaterial color="#ddc090" />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.26, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshToonMaterial color="#223355" />
      </mesh>
      <mesh position={[0.08, 1.18, 0.2]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshToonMaterial color="#ff9900" />
      </mesh>
      <mesh position={[-0.08, 1.18, 0.2]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshToonMaterial color="#ff9900" />
      </mesh>
    </group>
  )
}

function VillagerE() { // Baker with apron
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.3, 0.9, 7]} />
        <meshToonMaterial color="#ffe0c0" />
      </mesh>
      <mesh position={[0, 0.5, 0.22]} castShadow>
        <boxGeometry args={[0.38, 0.8, 0.06]} />
        <meshToonMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1.12, 0]} castShadow>
        <sphereGeometry args={[0.24, 7, 7]} />
        <meshToonMaterial color="#f0c890" />
      </mesh>
      <mesh position={[0, 1.38, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 8]} />
        <meshToonMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.1, 1.14, 0.22]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshToonMaterial color="#222" />
      </mesh>
      <mesh position={[-0.1, 1.14, 0.22]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshToonMaterial color="#222" />
      </mesh>
    </group>
  )
}

// Generic random NPC wrapper
function RandomVillager({ position, id, mesh: MeshComp, lines, rotation = [0, 0, 0] }) {
  return (
    <NPC position={position} id={id} dialogueLines={lines} radius={2.8}>
      <group rotation={rotation}>
        <MeshComp />
      </group>
    </NPC>
  )
}

export default function Zone1Village() {
  return (
    <group>
      {/* ── HEX FLOOR ── */}
      <MixedHexGrid
        radius={12}
        yOffset={-0.5}
        classifier={() => 'grass'}
        grassPath="/assets/hex_grass.gltf"
        waterPath="/assets/hex_water.gltf"
      />

      {/* ── BUILDINGS — scaled up to 1.8 ── */}
      {/* Player house south */}
      <Building path="/assets/building_home_A_yellow.gltf" position={[0, 0, 8]}   rotation={[0, Math.PI, 0]} scale={1.8} />

      {/* West ring */}
      <Building path="/assets/building_home_B_blue.gltf"   position={[-8, 0, 3]}  rotation={[0, 0.5, 0]}    scale={1.8} />
      <Building path="/assets/building_home_A_yellow.gltf" position={[-10, 0, -3]} rotation={[0, 0.8, 0]}   scale={1.8} />
      <Building path="/assets/building_home_B_blue.gltf"   position={[-7, 0, -8]}  rotation={[0, 1.2, 0]}   scale={1.8} />

      {/* East ring */}
      <Building path="/assets/building_home_A_yellow.gltf" position={[8, 0, 3]}   rotation={[0, -0.5, 0]}   scale={1.8} />
      <Building path="/assets/building_home_B_blue.gltf"   position={[10, 0, -3]}  rotation={[0, -0.8, 0]}  scale={1.8} />
      <Building path="/assets/building_home_A_yellow.gltf" position={[7, 0, -8]}   rotation={[0, -1.2, 0]}  scale={1.8} />

      {/* North flanking */}
      <Building path="/assets/building_home_B_blue.gltf"   position={[-5, 0, -12]} rotation={[0, 0.3, 0]}   scale={1.8} />
      <Building path="/assets/building_home_A_yellow.gltf" position={[5, 0, -12]}  rotation={[0, -0.3, 0]}  scale={1.8} />

      {/* ── TREES — scaled up to 2.2 ── */}
      {[...Array(14)].map((_, i) => {
        const angle = (i / 14) * Math.PI * 2
        const r = 13 + Math.sin(i * 2.3) * 1.5
        return (
          <Prop key={`tree1-${i}`} path="/assets/tree_single_B.gltf"
            position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
            rotation={[0, angle + 1, 0]} scale={2.2 + Math.sin(i) * 0.3} />
        )
      })}
      <Prop path="/assets/tree_single_B.gltf" position={[-4, 0, 5]}  rotation={[0, 0.7, 0]} scale={2.0} />
      <Prop path="/assets/tree_single_B.gltf" position={[5, 0, 6]}   rotation={[0, 2.1, 0]} scale={2.4} />
      <Prop path="/assets/tree_single_B.gltf" position={[-6, 0, -5]} rotation={[0, 1.3, 0]} scale={2.1} />
      <Prop path="/assets/tree_single_B.gltf" position={[6, 0, -6]}  rotation={[0, 0.4, 0]} scale={2.3} />

      {/* ── ROCKS ── */}
      <Prop path="/assets/rock_single_E.gltf" position={[-9, 0, 6]}   rotation={[0, 1.0, 0]} scale={1.6} />
      <Prop path="/assets/rock_single_E.gltf" position={[9, 0, 5]}    rotation={[0, 2.2, 0]} scale={1.8} />
      <Prop path="/assets/rock_single_E.gltf" position={[-3, 0, -10]} rotation={[0, 0.5, 0]} scale={1.4} />
      <Prop path="/assets/rock_single_E.gltf" position={[3, 0, -11]}  rotation={[0, 1.7, 0]} scale={1.5} />

      {/* ── CLOUDS ── */}
      <Prop path="/assets/cloud_big.gltf" position={[-8, 9, -5]}  scale={1.8} physics={false} />
      <Prop path="/assets/cloud_big.gltf" position={[10, 11, 2]}  scale={1.5} physics={false} />
      <Prop path="/assets/cloud_big.gltf" position={[0, 10, -8]}  scale={1.6} physics={false} />

      {/* ── LANTERNS ── */}
      <LanternPost position={[-2.5, 0.5, -1]} />
      <LanternPost position={[2.5,  0.5, -1]} />
      <LanternPost position={[-2.5, 0.5,  3]} />
      <LanternPost position={[2.5,  0.5,  3]} />
      <LanternPost position={[0,    0.5, -5]} />
      <LanternPost position={[-5,   0.5,  0]} />
      <LanternPost position={[5,    0.5,  0]} />

      {/* ── WELL & NOTICEBOARD ── */}
      <Well position={[0, 0.5, 2]} />
      <NoticeBoard position={[-3, 0.5, -4]} />

      {/* ── QUEST NPCS ── */}
      {/* Gerald — central square, on barrel near well */}
      <Gerald position={[2, 0.5, 1]} />

      {/* Mortimer — tucked east behind houses, hard to find */}
      <Mortimer position={[11, 0.5, -5]} />

      {/* ── NOTES ── */}
      <NoteObject position={[2, 1.0, -2]} id="note1"
        text="Update: kidnapping going well. The wizard has 4 cats. I have named them all Gerald. Don't rush or anything." />
      <NoteObject position={[9, 1.0, -1]} id="note2"
        text="The wizard taught me a spell. I accidentally turned a chair into soup. The soup was good. I am keeping the spell. Are you coming or." />

      {/* ── RANDOM VILLAGERS ── */}

      {/* Baker — standing outside yellow house east */}
      <RandomVillager
        position={[9.5, 0.5, 4.5]}
        id="villager-baker"
        mesh={VillagerE}
        rotation={[0, -2.2, 0]}
        lines={[
          "Oh! A visitor. Would you like some bread? I dropped it. Don't worry about that.",
          "I've been baking since before the sun rose. Or I think that was yesterday.",
          "The smell of soup has been coming from the north for three days. I'm not going to investigate.",
        ]}
      />

      {/* Hooded figure — leaning on blue house west, suspicious */}
      <RandomVillager
        position={[-9.5, 0.5, 4]}
        id="villager-hood"
        mesh={VillagerD}
        rotation={[0, 1.2, 0]}
        lines={[
          "...",
          "I saw a raccoon run past here carrying a clock. Backwards. Both the raccoon and the clock.",
          "I am not going to explain that further.",
        ]}
      />

      {/* Child — running around near well in central square */}
      <RandomVillager
        position={[-1.5, 0.5, 3.5]}
        id="villager-child"
        mesh={VillagerC}
        rotation={[0, 0.6, 0]}
        lines={[
          "HAVE YOU SEEN MY FROG. It was HERE and now it is NOT here.",
          "Gerald the fox said he hadn't seen it. But he looked guilty.",
          "All the Geralds look guilty. There are SO many Geralds.",
        ]}
      />

      {/* Tall villager — near notice board */}
      <RandomVillager
        position={[-4, 0.5, -5.5]}
        id="villager-tall"
        mesh={VillagerB}
        rotation={[0, 0.9, 0]}
        lines={[
          "I put that notice up about the clock. The raccoon took my clock last Tuesday.",
          "It was running backwards even before it was stolen. I don't know if that's relevant.",
          "Honestly I didn't even need the clock. I just want justice.",
        ]}
      />

      {/* Round villager — outside north blue house */}
      <RandomVillager
        position={[-6.2, 0.5, -13]}
        id="villager-round"
        mesh={VillagerA}
        rotation={[0, 1.8, 0]}
        lines={[
          "You're heading into the forest? At THIS hour?",
          "Well. There's a deer in the west clearing who is FINE. She told me to tell everyone that.",
          "She is clearly not fine. But I respect her commitment to the bit.",
        ]}
      />

      {/* Baker's friend — near south yellow house */}
      <RandomVillager
        position={[2.5, 0.5, 9.5]}
        id="villager-neighbour"
        mesh={VillagerB}
        rotation={[0, 3.5, 0]}
        lines={[
          "Quiet night, isn't it.",
          "Well. Except for the wizard. And the kidnapping.",
          "Otherwise very quiet.",
        ]}
      />

      {/* Chicken */}
      <InteractObject position={[4, 0.5, 4]} id="chicken" radius={2}
        onInteract={() => useGameStore.getState().openDialogue(["It has somewhere to be. It does not tell you where."])}>
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.28, 6, 6]} />
            <meshToonMaterial color="#f5e090" />
          </mesh>
          <mesh position={[0.22, 0.18, 0]} castShadow>
            <sphereGeometry args={[0.16, 5, 5]} />
            <meshToonMaterial color="#f5e090" />
          </mesh>
          <mesh position={[0.36, 0.2, 0]}>
            <coneGeometry args={[0.07, 0.16, 4]} />
            <meshToonMaterial color="#ff8800" />
          </mesh>
        </group>
      </InteractObject>
    </group>
  )
}