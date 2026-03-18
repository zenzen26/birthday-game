import React, { Suspense, useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import Player from './Player'
import CatCompanion from './CatCompanion'
import InteractionManager from './InteractionManager'
import { useGameStore } from '../stores/gameStore'
import { hexToWorld } from '../world/HexGrid'
import WORLD_JSON from './worldData.json'

// ── NPC proximity system ──────────────────────────────────────────
const _pp = new THREE.Vector3()
const _np = new THREE.Vector3()

function NPCBase({ position, id, radius = 3, dialogueLines, onDialogueEnd, npcName = '', children }) {
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
    player.getWorldPosition(_pp)
    ref.current.getWorldPosition(_np)
    const dist = _pp.distanceTo(_np)
    if (dist < radius) {
      setNearby({
        id,
        label: isUsed(id) ? '💬 [E]' : '! [E]',
        onInteract: () => {
          const lines = typeof dialogueLines === 'function' ? dialogueLines() : dialogueLines
          openDialogue(lines, () => { if (id !== 'wizard') markUsed(id); if (onDialogueEnd) onDialogueEnd() }, npcName || '')
        }
      })
    } else if (nearby?.id === id) {
      setNearby(null)
    }
  })

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = (position[1] ?? 0) + Math.sin(clock.elapsedTime * 1.5 + id.length) * 0.07
    }
  })

  return <group ref={ref} position={position}>{children}</group>
}

// ════════════════════════════════════════════════════════════════
// NPC CHARACTER MODELS
// ════════════════════════════════════════════════════════════════

// Shared helpers
function Body({ color, w=0.32, h=0.7, y=0.55 }) {
  return (
    <mesh position={[0,y,0]} castShadow>
      <boxGeometry args={[w, h, w*0.8]} />
      <meshToonMaterial color={color} />
    </mesh>
  )
}
function Head({ color, y=1.05, r=0.22 }) {
  return (
    <mesh position={[0,y,0]} castShadow>
      <boxGeometry args={[r*2, r*2, r*1.8]} />
      <meshToonMaterial color={color} />
    </mesh>
  )
}
function Eyes({ y=1.07, z=0.18 }) {
  return (
    <>
      <mesh position={[0.08,y,z]}><sphereGeometry args={[0.04,5,5]}/><meshToonMaterial color="#111"/></mesh>
      <mesh position={[-0.08,y,z]}><sphereGeometry args={[0.04,5,5]}/><meshToonMaterial color="#111"/></mesh>
    </>
  )
}
function Legs({ color, y=0.12 }) {
  return (
    <>
      <mesh position={[0.1,y,0]} castShadow><boxGeometry args={[0.12,0.28,0.12]}/><meshToonMaterial color={color}/></mesh>
      <mesh position={[-0.1,y,0]} castShadow><boxGeometry args={[0.12,0.28,0.12]}/><meshToonMaterial color={color}/></mesh>
    </>
  )
}
function Arms({ color, y=0.62 }) {
  return (
    <>
      <mesh position={[0.26,y,0]} rotation={[0,0,0.3]} castShadow><boxGeometry args={[0.1,0.38,0.1]}/><meshToonMaterial color={color}/></mesh>
      <mesh position={[-0.26,y,0]} rotation={[0,0,-0.3]} castShadow><boxGeometry args={[0.1,0.38,0.1]}/><meshToonMaterial color={color}/></mesh>
    </>
  )
}

// ── Gerald the Fox ─────────────────────────────────────────────
// Orange boxy fox, sits on a barrel, tail curls behind him
function GeraldFoxModel() {
  const tailRef = useRef()
  useFrame(({clock}) => { if(tailRef.current) tailRef.current.rotation.z = Math.sin(clock.elapsedTime*2)*0.25 })
  return (
    <group>
      {/* Barrel seat */}
      <mesh position={[0,-0.18,0]} castShadow><cylinderGeometry args={[0.32,0.32,0.36,8]}/><meshToonMaterial color="#8B6914"/></mesh>
      {/* Body */}
      <Body color="#e8701a" w={0.36} h={0.55} y={0.48}/>
      {/* Chest patch */}
      <mesh position={[0,0.48,0.15]} castShadow><boxGeometry args={[0.2,0.3,0.04]}/><meshToonMaterial color="#f5c398"/></mesh>
      <Head color="#e8701a" y={0.98} r={0.21}/>
      {/* Snout */}
      <mesh position={[0,0.92,0.2]} castShadow><boxGeometry args={[0.16,0.12,0.14]}/><meshToonMaterial color="#f5c398"/></mesh>
      {/* Ears */}
      <mesh position={[0.13,1.22,0]} castShadow><coneGeometry args={[0.08,0.2,4]}/><meshToonMaterial color="#e8701a"/></mesh>
      <mesh position={[-0.13,1.22,0]} castShadow><coneGeometry args={[0.08,0.2,4]}/><meshToonMaterial color="#e8701a"/></mesh>
      <Eyes y={0.98} z={0.19}/>
      <Arms color="#e8701a" y={0.56}/>
      <Legs color="#c85c10"/>
      {/* Tail */}
      <group ref={tailRef} position={[-0.18,0.4,-0.22]}>
        <mesh rotation={[0.6,0,0.4]} castShadow><coneGeometry args={[0.16,0.55,6]}/><meshToonMaterial color="#e8701a"/></mesh>
        <mesh position={[-0.05,0.28,-0.1]} rotation={[0.4,0,0.2]}><sphereGeometry args={[0.14,5,5]}/><meshToonMaterial color="#f0f0f0"/></mesh>
      </group>
      {/* ! marker */}
      <mesh position={[0,1.65,0]}><cylinderGeometry args={[0.04,0.04,0.2,5]}/><meshToonMaterial color="#ffffff"/></mesh>
      <mesh position={[0,1.92,0]}><sphereGeometry args={[0.06,5,5]}/><meshToonMaterial color="#ffffff"/></mesh>
    </group>
  )
}

// ── Barry the Fish ─────────────────────────────────────────────
// Flat dry fish standing upright on a podium, very composed
function BarryFishModel() {
  // Barry is now a stickman gentleman
  const caneRef = useRef()
  useFrame(({clock}) => {
    if (caneRef.current) caneRef.current.rotation.z = Math.sin(clock.elapsedTime * 1.2) * 0.04
  })
  return (
    <group>
      {/* Legs — thin sticks */}
      <mesh position={[0.1, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.55, 4]} />
        <meshToonMaterial color="#222222" />
      </mesh>
      <mesh position={[-0.1, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.55, 4]} />
        <meshToonMaterial color="#222222" />
      </mesh>
      {/* Shoes */}
      <mesh position={[0.1, -0.02, 0.06]} castShadow>
        <boxGeometry args={[0.1, 0.06, 0.18]} />
        <meshToonMaterial color="#111111" />
      </mesh>
      <mesh position={[-0.1, -0.02, 0.06]} castShadow>
        <boxGeometry args={[0.1, 0.06, 0.18]} />
        <meshToonMaterial color="#111111" />
      </mesh>
      {/* Body — thin rectangle */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[0.12, 0.42, 0.08]} />
        <meshToonMaterial color="#1a1a2a" />
      </mesh>
      {/* Waistcoat */}
      <mesh position={[0, 0.72, 0.04]} castShadow>
        <boxGeometry args={[0.09, 0.36, 0.02]} />
        <meshToonMaterial color="#c8a830" />
      </mesh>
      {/* Arms — outstretched stick arms */}
      <mesh position={[0.3, 0.85, 0]} rotation={[0, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.44, 4]} />
        <meshToonMaterial color="#1a1a2a" />
      </mesh>
      <mesh position={[-0.22, 0.9, 0]} rotation={[0, 0, 0.5]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.36, 4]} />
        <meshToonMaterial color="#1a1a2a" />
      </mesh>
      {/* Head — simple circle */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshToonMaterial color="#f5d5a0" />
      </mesh>
      {/* Monocle */}
      <mesh position={[0.1, 1.18, 0.17]}>
        <torusGeometry args={[0.065, 0.015, 5, 12]} />
        <meshToonMaterial color="#c8a830" />
      </mesh>
      <mesh position={[0.1, 1.18, 0.185]}>
        <circleGeometry args={[0.055, 12]} />
        <meshToonMaterial color="#aaddff" transparent opacity={0.35} />
      </mesh>
      {/* Monocle string */}
      <mesh position={[0.14, 1.1, 0.14]} rotation={[0.4, 0, 0.3]}>
        <cylinderGeometry args={[0.006, 0.006, 0.14, 3]} />
        <meshToonMaterial color="#c8a830" />
      </mesh>
      {/* Moustache */}
      <mesh position={[0.06, 1.09, 0.17]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.1, 0.03, 0.02]} />
        <meshToonMaterial color="#333322" />
      </mesh>
      <mesh position={[-0.06, 1.09, 0.17]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.1, 0.03, 0.02]} />
        <meshToonMaterial color="#333322" />
      </mesh>
      {/* Top hat */}
      <mesh position={[0, 1.36, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.06, 10]} />
        <meshToonMaterial color="#111111" />
      </mesh>
      <mesh position={[0, 1.58, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.14, 0.44, 10]} />
        <meshToonMaterial color="#111111" />
      </mesh>
      {/* Hat band */}
      <mesh position={[0, 1.38, 0]} castShadow>
        <cylinderGeometry args={[0.145, 0.145, 0.06, 10]} />
        <meshToonMaterial color="#c8a830" />
      </mesh>
      {/* Gentleman cane */}
      <group ref={caneRef} position={[0.36, 0.55, 0.05]}>
        <mesh rotation={[0.05, 0, -0.1]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.9, 5]} />
          <meshToonMaterial color="#6b3d0f" />
        </mesh>
        {/* Cane handle */}
        <mesh position={[0, 0.48, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
          <torusGeometry args={[0.07, 0.025, 5, 10, Math.PI]} />
          <meshToonMaterial color="#c8a830" />
        </mesh>
      </group>
      {/* ! */}
      <mesh position={[0, 1.92, 0]}><cylinderGeometry args={[0.04,0.04,0.18,5]}/><meshToonMaterial color="#ffffff"/></mesh>
      <mesh position={[0, 2.15, 0]}><sphereGeometry args={[0.06,5,5]}/><meshToonMaterial color="#ffffff"/></mesh>
    </group>
  )
}

// ── Mortimer the Mushroom ──────────────────────────────────────
// Sleepy mushroom slumped against nothing, one shoe beside him
function MortimerMushroomModel() {
  return (
    <group>
      {/* Stem — tilted sleepily */}
      <mesh position={[0,0.3,0]} rotation={[0,0,0.18]} castShadow><cylinderGeometry args={[0.2,0.26,0.58,8]}/><meshToonMaterial color="#f5e6d0"/></mesh>
      {/* Cap */}
      <mesh position={[0.05,0.72,0]} castShadow><sphereGeometry args={[0.48,8,8,0,Math.PI*2,0,Math.PI/2]}/><meshToonMaterial color="#8B2500"/></mesh>
      {/* Spots */}
      {[[0.25,0.82,0.18],[-0.18,0.88,0.22],[0.08,0.9,-0.28]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x,y,z]}><sphereGeometry args={[0.065,5,5]}/><meshToonMaterial color="#f5f5f0"/></mesh>
      ))}
      {/* Sleepy closed eyes */}
      <mesh position={[0.15,0.42,0.18]} rotation={[0,-0.2,0]}><boxGeometry args={[0.1,0.025,0.02]}/><meshToonMaterial color="#3a2000"/></mesh>
      <mesh position={[-0.02,0.42,0.2]}><boxGeometry args={[0.08,0.025,0.02]}/><meshToonMaterial color="#3a2000"/></mesh>
      {/* Shoe beside him */}
      <mesh position={[0.55,0.06,0.25]} rotation={[0,0.5,0]} castShadow><boxGeometry args={[0.28,0.1,0.16]}/><meshToonMaterial color="#3a2a1a"/></mesh>
      {/* ZZZ */}
      <mesh position={[0.38,1.1,0]}><boxGeometry args={[0.1,0.1,0.02]}/><meshToonMaterial color="#a0b8ff" transparent opacity={0.7}/></mesh>
    </group>
  )
}

// ── Diane the Deer ─────────────────────────────────────────────
// Tall elegant deer, staring wistfully, bottle of moonbeam at feet
function DianeDeerModel() {
  // Diane is now a trash can
  return (
    <group>
      {/* Can body */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.32, 1.1, 12]} />
        <meshToonMaterial color="#778899" />
      </mesh>
      {/* Lid — slightly ajar */}
      <mesh position={[0.08, 1.15, 0.05]} rotation={[0, 0, 0.2]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.08, 12]} />
        <meshToonMaterial color="#556677" />
      </mesh>
      {/* Lid handle */}
      <mesh position={[0.08, 1.24, 0.05]} rotation={[0, 0, 0.2]} castShadow>
        <torusGeometry args={[0.1, 0.03, 5, 10, Math.PI]} />
        <meshToonMaterial color="#445566" />
      </mesh>
      {/* Dent on side */}
      <mesh position={[0.36, 0.5, 0.1]} rotation={[0, 0.3, 0.15]}>
        <sphereGeometry args={[0.1, 5, 5]} />
        <meshToonMaterial color="#667788" />
      </mesh>
      {/* Horizontal ridges */}
      {[0.2, 0.55, 0.9].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <torusGeometry args={[0.36 - i*0.015, 0.025, 5, 14]} />
          <meshToonMaterial color="#667788" />
        </mesh>
      ))}
      {/* Eyes peeking out from inside */}
      <mesh position={[0.12, 1.08, 0.34]}><sphereGeometry args={[0.055, 5, 5]}/><meshToonMaterial color="#ffffff"/></mesh>
      <mesh position={[0.12, 1.08, 0.34]}><sphereGeometry args={[0.03, 5, 5]}/><meshToonMaterial color="#111"/></mesh>
      <mesh position={[-0.12, 1.08, 0.34]}><sphereGeometry args={[0.055, 5, 5]}/><meshToonMaterial color="#ffffff"/></mesh>
      <mesh position={[-0.12, 1.08, 0.34]}><sphereGeometry args={[0.03, 5, 5]}/><meshToonMaterial color="#111"/></mesh>
      {/* ! */}
      <mesh position={[0, 1.45, 0]}><cylinderGeometry args={[0.04,0.04,0.18,5]}/><meshToonMaterial color="#ffffff"/></mesh>
      <mesh position={[0, 1.68, 0]}><sphereGeometry args={[0.06,5,5]}/><meshToonMaterial color="#ffffff"/></mesh>
    </group>
  )
}

// ── Old Barnaby — Stickman ──────────────────────────────────────
function OldBarnabyModel() {
  const armRef = useRef()
  useFrame(({ clock }) => {
    // One arm waves slowly
    if (armRef.current) armRef.current.rotation.z = Math.sin(clock.elapsedTime * 1.2) * 0.4 + 0.3
  })
  const LINE = '#222222'
  return (
    <group>
      {/* Head — circle */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshToonMaterial color="#f0d090" />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.08, 1.66, 0.2]}><sphereGeometry args={[0.04,5,5]}/><meshToonMaterial color="#111"/></mesh>
      <mesh position={[-0.08,1.66, 0.2]}><sphereGeometry args={[0.04,5,5]}/><meshToonMaterial color="#111"/></mesh>
      {/* Neck */}
      <mesh position={[0, 1.33, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.18, 5]} />
        <meshToonMaterial color={LINE} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 5]} />
        <meshToonMaterial color={LINE} />
      </mesh>
      {/* Left arm — static */}
      <mesh position={[-0.28, 1.1, 0]} rotation={[0, 0, 0.5]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.48, 5]} />
        <meshToonMaterial color={LINE} />
      </mesh>
      {/* Right arm — waves */}
      <group ref={armRef} position={[0.28, 1.18, 0]}>
        <mesh position={[0.14, -0.1, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.48, 5]} />
          <meshToonMaterial color={LINE} />
        </mesh>
      </group>
      {/* Left leg */}
      <mesh position={[-0.12, 0.58, 0]} rotation={[0, 0, 0.1]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.5, 5]} />
        <meshToonMaterial color={LINE} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.12, 0.58, 0]} rotation={[0, 0, -0.1]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.5, 5]} />
        <meshToonMaterial color={LINE} />
      </mesh>
      {/* Feet */}
      <mesh position={[-0.15, 0.32, 0.08]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.08, 0.04, 0.18]} />
        <meshToonMaterial color={LINE} />
      </mesh>
      <mesh position={[0.15, 0.32, 0.08]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.08, 0.04, 0.18]} />
        <meshToonMaterial color={LINE} />
      </mesh>
      {/* ! */}
      <mesh position={[0, 2.06, 0]}><cylinderGeometry args={[0.04,0.04,0.18,5]}/><meshToonMaterial color="#ffffff"/></mesh>
      <mesh position={[0, 2.3, 0]}><sphereGeometry args={[0.06,5,5]}/><meshToonMaterial color="#ffffff"/></mesh>
    </group>
  )
}

// ── Sister Maeve ───────────────────────────────────────────────
// Tall thin woman in a blue robe, carries a lantern
function SisterMaeveModel() {
  const lanternRef = useRef()
  useFrame(({clock}) => { if(lanternRef.current) lanternRef.current.position.y = 0.78 + Math.sin(clock.elapsedTime*1.8)*0.04 })
  return (
    <group>
      {/* Robe — long cone */}
      <mesh position={[0,0.7,0]} castShadow><coneGeometry args={[0.36,1.42,8]}/><meshToonMaterial color="#2255aa"/></mesh>
      {/* Upper body */}
      <mesh position={[0,1.28,0]} castShadow><cylinderGeometry args={[0.22,0.3,0.44,8]}/><meshToonMaterial color="#2255aa"/></mesh>
      {/* Collar */}
      <mesh position={[0,1.5,0]} castShadow><cylinderGeometry args={[0.18,0.22,0.12,8]}/><meshToonMaterial color="#ddeeff"/></mesh>
      <Head color="#f5d5b0" y={1.75} r={0.2}/>
      <Eyes y={1.76} z={0.19}/>
      {/* Veil */}
      <mesh position={[0,1.97,0]} castShadow><sphereGeometry args={[0.24,7,5,0,Math.PI*2,0,Math.PI*0.6]}/><meshToonMaterial color="#1a4488"/></mesh>
      <Arms color="#2255aa" y={1.24}/>
      {/* Lantern */}
      <group ref={lanternRef} position={[0.32,0.78,0.08]}>
        <mesh castShadow><boxGeometry args={[0.14,0.18,0.14]}/><meshToonMaterial color="#ffe080" transparent opacity={0.8}/></mesh>
        <pointLight color="#ffcc44" intensity={0.8} distance={4}/>
      </group>
      {/* ! */}
      <mesh position={[0,2.18,0]}><cylinderGeometry args={[0.04,0.04,0.18,5]}/><meshToonMaterial color="#ffffff"/></mesh>
      <mesh position={[0,2.42,0]}><sphereGeometry args={[0.06,5,5]}/><meshToonMaterial color="#ffffff"/></mesh>
    </group>
  )
}

// ── Gate Guard (enemy) ─────────────────────────────────────────
// Armoured guard with helmet and spear, grumpy orange eyes
function GateGuardModel({ variant = 0 }) {
  const colors = ['#445566','#334455','#556677']
  const c = colors[variant % colors.length]
  return (
    <group>
      <Legs color="#334"/>
      {/* Armour body */}
      <mesh position={[0,0.58,0]} castShadow><boxGeometry args={[0.4,0.72,0.28]}/><meshToonMaterial color={c}/></mesh>
      {/* Chest plate */}
      <mesh position={[0,0.6,0.14]} castShadow><boxGeometry args={[0.34,0.58,0.05]}/><meshToonMaterial color="#8899aa"/></mesh>
      <Arms color={c} y={0.62}/>
      {/* Neck */}
      <mesh position={[0,1.06,0]} castShadow><cylinderGeometry args={[0.12,0.16,0.18,6]}/><meshToonMaterial color="#8899aa"/></mesh>
      {/* Helmet */}
      <mesh position={[0,1.24,0]} castShadow><sphereGeometry args={[0.24,7,7,0,Math.PI*2,0,Math.PI*0.65]}/><meshToonMaterial color="#8899aa"/></mesh>
      <mesh position={[0,1.12,0]} castShadow><cylinderGeometry args={[0.26,0.26,0.07,8]}/><meshToonMaterial color="#8899aa"/></mesh>
      {/* Visor slit — glowing orange eyes */}
      <mesh position={[0.07,1.22,0.22]}><boxGeometry args={[0.06,0.04,0.02]}/><meshToonMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={0.9}/></mesh>
      <mesh position={[-0.07,1.22,0.22]}><boxGeometry args={[0.06,0.04,0.02]}/><meshToonMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={0.9}/></mesh>
      {/* Spear */}
      <mesh position={[0.32,0.8,0]} rotation={[0.1,0,-0.05]} castShadow><cylinderGeometry args={[0.03,0.03,1.8,5]}/><meshToonMaterial color="#8B6914"/></mesh>
      <mesh position={[0.35,1.72,0]}><coneGeometry args={[0.06,0.26,4]}/><meshToonMaterial color="#aabbcc"/></mesh>
    </group>
  )
}

// ── Merchant ───────────────────────────────────────────────────
// Two distinct merchants: Trader Vex (cloaked) and Pip (short, cheerful)
function TraderVexModel() {
  return (
    <group>
      <Legs color="#3a2a1a"/>
      {/* Dark cloak body */}
      <mesh position={[0,0.65,0]} castShadow><coneGeometry args={[0.42,1.3,8]}/><meshToonMaterial color="#1a1a2a"/></mesh>
      <mesh position={[0,1.2,0]} castShadow><cylinderGeometry args={[0.26,0.36,0.5,8]}/><meshToonMaterial color="#1a1a2a"/></mesh>
      <Head color="#d0b090" y={1.68} r={0.2}/>
      <Eyes y={1.69} z={0.19}/>
      {/* Hood */}
      <mesh position={[0,1.88,0]} castShadow><sphereGeometry args={[0.26,7,5,0,Math.PI*2,0,Math.PI*0.6]}/><meshToonMaterial color="#111122"/></mesh>
      {/* Gold chain */}
      <mesh position={[0,1.38,0.18]} rotation={[0.6,0,0]}><torusGeometry args={[0.14,0.02,5,12,Math.PI]}/><meshToonMaterial color="#c89030"/></mesh>
      {/* Coin bag */}
      <mesh position={[-0.28,0.7,0.1]} castShadow><sphereGeometry args={[0.14,6,6]}/><meshToonMaterial color="#c89030"/></mesh>
      {/* ! */}
      <mesh position={[0,2.08,0]}><cylinderGeometry args={[0.04,0.04,0.18,5]}/><meshToonMaterial color="#c89030"/></mesh>
      <mesh position={[0,2.32,0]}><sphereGeometry args={[0.06,5,5]}/><meshToonMaterial color="#c89030"/></mesh>
    </group>
  )
}

function PipMerchantModel() {
  return (
    <group scale={0.78}>
      <Legs color="#4a6a2a"/>
      <Body color="#5a8a3a" w={0.42} h={0.62} y={0.52}/>
      {/* Apron */}
      <mesh position={[0,0.5,0.18]} castShadow><boxGeometry args={[0.36,0.5,0.04]}/><meshToonMaterial color="#eeeecc"/></mesh>
      <Arms color="#5a8a3a" y={0.56}/>
      <Head color="#f0c880" y={1.0} r={0.24}/>
      <Eyes y={1.01} z={0.22}/>
      {/* Big round hat */}
      <mesh position={[0,1.22,0]} castShadow><cylinderGeometry args={[0.3,0.3,0.06,10]}/><meshToonMaterial color="#aa8830"/></mesh>
      <mesh position={[0,1.4,0]} castShadow><cylinderGeometry args={[0.2,0.24,0.36,8]}/><meshToonMaterial color="#aa8830"/></mesh>
      {/* Tray with goods */}
      <mesh position={[0,0.9,0.28]} castShadow><boxGeometry args={[0.36,0.06,0.22]}/><meshToonMaterial color="#8B6914"/></mesh>
      {[[0.08,0.97,0.28],[-0.08,0.97,0.28],[0,0.97,0.22]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x,y,z]}><sphereGeometry args={[0.06,5,5]}/><meshToonMaterial color={['#ff4444','#44ff88','#ffcc00'][i]}/></mesh>
      ))}
      {/* ! */}
      <mesh position={[0,1.72,0]}><cylinderGeometry args={[0.04,0.04,0.18,5]}/><meshToonMaterial color="#c89030"/></mesh>
      <mesh position={[0,1.96,0]}><sphereGeometry args={[0.06,5,5]}/><meshToonMaterial color="#c89030"/></mesh>
    </group>
  )
}

// ── Villager models (5 reused across all villagers) ────────────
function VillagerFarmerModel() {
  return (
    <group>
      <Legs color="#4a3820"/>
      <Body color="#8a6a3a" w={0.34} h={0.65} y={0.55}/>
      <Arms color="#8a6a3a"/>
      <Head color="#e8c090" y={1.05} r={0.2}/>
      <Eyes y={1.06} z={0.19}/>
      {/* Straw hat */}
      <mesh position={[0,1.26,0]} castShadow><cylinderGeometry args={[0.34,0.36,0.05,10]}/><meshToonMaterial color="#e8c030"/></mesh>
      <mesh position={[0,1.38,0]} castShadow><cylinderGeometry args={[0.15,0.18,0.24,8]}/><meshToonMaterial color="#e8c030"/></mesh>
      {/* Pitchfork */}
      <mesh position={[0.3,0.72,0]} rotation={[0.05,0,-0.08]} castShadow><cylinderGeometry args={[0.025,0.025,1.2,5]}/><meshToonMaterial color="#8B6914"/></mesh>
    </group>
  )
}

function VillagerChildModel() {
  return (
    <group scale={0.65}>
      <Legs color="#aa6633"/>
      <Body color="#dd8844" w={0.38} h={0.55} y={0.48}/>
      <Arms color="#dd8844" y={0.5}/>
      <Head color="#f5c890" y={0.95} r={0.24}/>
      <Eyes y={0.96} z={0.22}/>
      {/* Round cap */}
      <mesh position={[0,1.2,0]} castShadow><sphereGeometry args={[0.26,7,5,0,Math.PI*2,0,Math.PI*0.58]}/><meshToonMaterial color="#ff5533"/></mesh>
    </group>
  )
}

function VillagerCloakModel() {
  return (
    <group>
      <Legs color="#2a2a3a"/>
      <mesh position={[0,0.65,0]} castShadow><coneGeometry args={[0.38,1.28,8]}/><meshToonMaterial color="#3a3a5a"/></mesh>
      <mesh position={[0,1.18,0]} castShadow><cylinderGeometry args={[0.24,0.34,0.44,8]}/><meshToonMaterial color="#3a3a5a"/></mesh>
      <Head color="#ddc090" y={1.62} r={0.2}/>
      <Eyes y={1.63} z={0.19}/>
      <mesh position={[0,1.82,0]} castShadow><sphereGeometry args={[0.24,7,5,0,Math.PI*2,0,Math.PI*0.55]}/><meshToonMaterial color="#222238"/></mesh>
    </group>
  )
}

function VillagerOldWomanModel() {
  return (
    <group>
      <Legs color="#5a4a6a"/>
      <Body color="#7a5a8a" w={0.36} h={0.62} y={0.54}/>
      <Arms color="#7a5a8a"/>
      <Head color="#f0d0b0" y={1.02} r={0.2}/>
      <Eyes y={1.03} z={0.19}/>
      {/* Bun */}
      <mesh position={[0,1.24,0]}><sphereGeometry args={[0.16,6,6]}/><meshToonMaterial color="#cccccc"/></mesh>
      {/* Shawl */}
      <mesh position={[0,1.12,0]}><sphereGeometry args={[0.28,7,5,0,Math.PI*2,0,Math.PI*0.5]}/><meshToonMaterial color="#998899" transparent opacity={0.85}/></mesh>
      {/* Cane */}
      <mesh position={[-0.3,0.52,0.1]} rotation={[0.15,0,0.1]} castShadow><cylinderGeometry args={[0.03,0.03,0.96,5]}/><meshToonMaterial color="#8B6914"/></mesh>
    </group>
  )
}

function VillagerScoutModel() {
  return (
    <group>
      <Legs color="#4a6a3a"/>
      <Body color="#5a8a4a" w={0.33} h={0.65} y={0.55}/>
      <Arms color="#5a8a4a"/>
      <Head color="#e8c080" y={1.05} r={0.19}/>
      <Eyes y={1.06} z={0.18}/>
      {/* Hood up */}
      <mesh position={[0,1.24,0]} castShadow><sphereGeometry args={[0.24,7,5,0,Math.PI*2,0,Math.PI*0.58]}/><meshToonMaterial color="#3a5a2a"/></mesh>
      {/* Quiver */}
      <mesh position={[-0.24,0.82,-0.12]} rotation={[0.3,0,0]} castShadow><cylinderGeometry args={[0.07,0.07,0.36,5]}/><meshToonMaterial color="#8B4513"/></mesh>
    </group>
  )
}

// ── The Wizard ─────────────────────────────────────────────────
function WizardNPC() {
  const staffRef = useRef()
  useFrame(({ clock }) => {
    if (staffRef.current) staffRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.06
  })
  return (
    <group>
      <Legs color="#3a1060"/>
      {/* Robe */}
      <mesh position={[0,0.75,0]} castShadow><coneGeometry args={[0.52,1.5,8]}/><meshToonMaterial color="#5a1a8a"/></mesh>
      <mesh position={[0,1.3,0]} castShadow><cylinderGeometry args={[0.28,0.38,0.5,8]}/><meshToonMaterial color="#5a1a8a"/></mesh>
      <Head color="#f0d0a0" y={1.75} r={0.24}/>
      <Eyes y={1.76} z={0.22}/>
      {/* Wizard hat brim */}
      <mesh position={[0,1.96,0]} castShadow><cylinderGeometry args={[0.46,0.46,0.06,10]}/><meshToonMaterial color="#3a0a6a"/></mesh>
      <mesh position={[0,2.38,0]} castShadow><coneGeometry args={[0.28,0.85,8]}/><meshToonMaterial color="#3a0a6a"/></mesh>
      {/* Star */}
      <mesh position={[0.05,2.62,0.2]}><octahedronGeometry args={[0.08]}/><meshToonMaterial color="#ffd700" emissive="#aa8800" emissiveIntensity={0.5}/></mesh>
      {/* Star earring */}
      <mesh position={[0.26,1.7,0.1]}><octahedronGeometry args={[0.05]}/><meshToonMaterial color="#cc44ff" emissive="#8800cc" emissiveIntensity={0.6}/></mesh>
      <Arms color="#5a1a8a"/>
      {/* Staff */}
      <group ref={staffRef} position={[0.6, 1.0, 0]}>
        <mesh castShadow><cylinderGeometry args={[0.04,0.04,1.7,5]}/><meshToonMaterial color="#6b3d0f"/></mesh>
        <mesh position={[0,0.9,0]}><octahedronGeometry args={[0.13]}/><meshToonMaterial color="#cc44ff" emissive="#8800cc" emissiveIntensity={0.8}/></mesh>
        <pointLight position={[0,0.9,0]} color="#cc44ff" intensity={0.7} distance={3}/>
      </group>
    </group>
  )
}

// ── Note object ───────────────────────────────────────────────────
function Sparkle({ y = 1.4, color = '#ffffaa' }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.children.forEach((c, i) => {
      const a = (t * 1.8 + i * (Math.PI * 2 / 6))
      c.position.set(Math.cos(a) * 0.28, y + Math.sin(t * 2 + i) * 0.1, Math.sin(a) * 0.28)
      c.material.opacity = 0.5 + Math.sin(t * 3 + i) * 0.45
    })
  })
  return (
    <group ref={ref}>
      {[...Array(6)].map((_, i) => (
        <mesh key={i}>
          <octahedronGeometry args={[0.055]} />
          <meshToonMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function NoteObject({ position, id, text, rotY = 0 }) {
  const openDialogue = useGameStore(s => s.openDialogue)
  const nearby       = useGameStore(s => s.nearbyInteractable)
  const setNearby    = useGameStore(s => s.setNearbyInteractable)
  const isUsed       = useGameStore(s => s.isNPCUsed)
  const ref = useRef()

  useFrame(({ scene }) => {
    if (!ref.current) return
    const player = scene.getObjectByName('player-root')
    if (!player) return
    player.getWorldPosition(_pp)
    ref.current.getWorldPosition(_np)
    const dist = _pp.distanceTo(_np)
    if (dist < 2.5) {
      setNearby({ id, label: '📝 [E] Read', onInteract: () => openDialogue([text]) })
    } else if (nearby?.id === id) {
      setNearby(null)
    }
  })

  const [px, , pz] = position  // hexToWorld returns [x,0,z], destructure safely

  return (
    <group ref={ref} position={[px, 0.12, pz]}>
      {/* Paper lying flat on the floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <planeGeometry args={[0.6, 0.75]} />
        <meshStandardMaterial color="#fffde0" roughness={0.9} side={2} />
      </mesh>
      {/* Red line on paper */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <planeGeometry args={[0.04, 0.68]} />
        <meshStandardMaterial color="#cc2222" side={2} />
      </mesh>
      {/* Sparkle above it */}
      {!isUsed(id) && <Sparkle y={0.5} color="#ffe080" />}
    </group>
  )
}

// ════════════════════════════════════════════════════════════════
// TREASURE MODELS — each item has a unique 3D model
// ════════════════════════════════════════════════════════════════

function DriedFishModel() {
  return (
    <group>
      {/* Flat desiccated fish body */}
      <mesh scale={[1.3, 0.35, 0.55]} castShadow>
        <sphereGeometry args={[0.28, 8, 6]} />
        <meshToonMaterial color="#c8a060" />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.38, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <coneGeometry args={[0.14, 0.22, 3]} />
        <meshToonMaterial color="#b08040" />
      </mesh>
      {/* Eye socket — dried, sunken */}
      <mesh position={[0.22, 0.06, 0.14]}>
        <sphereGeometry args={[0.055, 5, 5]} />
        <meshToonMaterial color="#5a3a10" />
      </mesh>
      {/* Wrinkle lines */}
      {[-0.1, 0.05, 0.18].map((x,i) => (
        <mesh key={i} position={[x, 0.11, 0]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.04, 0.02, 0.28]} />
          <meshToonMaterial color="#a07838" />
        </mesh>
      ))}
      {/* "VERY DRY" scroll label underneath */}
      <mesh position={[0, -0.13, 0]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[0.42, 0.14]} />
        <meshToonMaterial color="#fffde0" side={2} />
      </mesh>
    </group>
  )
}

function UnderwearModel() {
  return (
    <group>
      {/* Main fabric — flat squarish */}
      <mesh castShadow>
        <boxGeometry args={[0.55, 0.04, 0.42]} />
        <meshToonMaterial color="#ffeecc" />
      </mesh>
      {/* Waistband */}
      <mesh position={[0, 0.04, -0.16]} castShadow>
        <boxGeometry args={[0.55, 0.1, 0.06]} />
        <meshToonMaterial color="#ff8888" />
      </mesh>
      {/* Leg holes — cut-out effect with darker patches */}
      <mesh position={[-0.14, 0, 0.12]}>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 8]} />
        <meshToonMaterial color="#ddccaa" />
      </mesh>
      <mesh position={[0.14, 0, 0.12]}>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 8]} />
        <meshToonMaterial color="#ddccaa" />
      </mesh>
      {/* Small bow decoration on waistband */}
      <mesh position={[0, 0.06, -0.18]}>
        <octahedronGeometry args={[0.04, 0]} />
        <meshToonMaterial color="#ff6666" />
      </mesh>
    </group>
  )
}

function SuspiciousLiquidModel() {
  const wobbleRef = useRef()
  useFrame(({ clock }) => {
    if (wobbleRef.current) {
      wobbleRef.current.scale.y = 1 + Math.sin(clock.elapsedTime * 2.5) * 0.04
    }
  })
  return (
    <group>
      {/* Bowl */}
      <mesh castShadow>
        <sphereGeometry args={[0.3, 10, 8, 0, Math.PI*2, 0, Math.PI*0.6]} />
        <meshToonMaterial color="#d4b896" />
      </mesh>
      {/* Bowl rim */}
      <mesh position={[0, 0.06, 0]}>
        <torusGeometry args={[0.3, 0.04, 5, 14]} />
        <meshToonMaterial color="#c4a886" />
      </mesh>
      {/* Liquid surface — suspicious white */}
      <mesh ref={wobbleRef} position={[0, 0.05, 0]}>
        <circleGeometry args={[0.26, 14]} />
        <meshToonMaterial color="#f8f8f0" side={2} />
      </mesh>
      {/* Ripple ring */}
      <mesh position={[0, 0.06, 0]} rotation={[Math.PI/2, 0, 0]}>
        <ringGeometry args={[0.1, 0.14, 12]} />
        <meshToonMaterial color="#e8e8e0" transparent opacity={0.6} />
      </mesh>
      {/* Steam wisps */}
      {[-0.08, 0.06, -0.02].map((x, i) => (
        <mesh key={i} position={[x, 0.22 + i*0.1, 0]} rotation={[0, 0, Math.sin(i)*0.3]}>
          <cylinderGeometry args={[0.015, 0.025, 0.12, 4]} />
          <meshToonMaterial color="#ffffff" transparent opacity={0.4} />
        </mesh>
      ))}
      {/* ??? label on side of bowl */}
      <mesh position={[0.25, -0.08, 0.12]} rotation={[0, -0.5, 0]}>
        <planeGeometry args={[0.22, 0.1]} />
        <meshToonMaterial color="#fffde0" side={2} />
      </mesh>
    </group>
  )
}

function FingerModel() {
  return (
    <group rotation={[0, 0, 0.3]}>
      {/* Palm stub base */}
      <mesh position={[0, -0.08, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.16, 7]} />
        <meshToonMaterial color="#f0c8a0" />
      </mesh>
      {/* Finger segments — 3 */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.072, 0.08, 0.18, 7]} />
        <meshToonMaterial color="#f0c8a0" />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.072, 0.16, 7]} />
        <meshToonMaterial color="#efc090" />
      </mesh>
      <mesh position={[0, 0.44, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.065, 0.14, 7]} />
        <meshToonMaterial color="#efc090" />
      </mesh>
      {/* Fingernail */}
      <mesh position={[0, 0.52, 0.04]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.08, 0.06, 0.03]} />
        <meshToonMaterial color="#ffeecc" />
      </mesh>
      {/* Knuckle bumps */}
      {[0.1, 0.28].map((y, i) => (
        <mesh key={i} position={[0, y, 0.06]}>
          <sphereGeometry args={[0.042, 5, 5]} />
          <meshToonMaterial color="#e8b888" />
        </mesh>
      ))}
      {/* Detached bottom — slightly gory paper-style dark ring */}
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 7]} />
        <meshToonMaterial color="#8a3a2a" />
      </mesh>
    </group>
  )
}

function MushroomModel() {
  return (
    <group>
      {/* Stem — slightly glowing */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.38, 8]} />
        <meshToonMaterial color="#f0e8d0" />
      </mesh>
      {/* Cap — large, bulbous, SPECIAL purple */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <sphereGeometry args={[0.38, 9, 8, 0, Math.PI*2, 0, Math.PI*0.58]} />
        <meshToonMaterial color="#7a22cc" />
      </mesh>
      {/* Glowing spots */}
      {[[0.22,0.62,0.18],[-0.15,0.68,0.22],[0.06,0.72,-0.26],[-0.28,0.56,0.08]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x,y,z]}>
          <sphereGeometry args={[0.06,5,5]} />
          <meshToonMaterial color="#ddaaff" emissive="#aa55ff" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {/* Under-cap glow ring */}
      <mesh position={[0, 0.36, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[0.12, 0.36, 12]} />
        <meshToonMaterial color="#cc88ff" transparent opacity={0.35} />
      </mesh>
      <pointLight position={[0, 0.5, 0]} color="#aa44ff" intensity={0.5} distance={2.5} />
    </group>
  )
}

// ── SENTIENT CAKE ─────────────────────────────────────────────────
function SentientCake({ position }) {
  const openDialogue  = useGameStore(s => s.openDialogue)
  const nearby        = useGameStore(s => s.nearbyInteractable)
  const setNearby     = useGameStore(s => s.setNearbyInteractable)
  const setCatFollows = useGameStore(s => s.setCatFollows)
  const isUsed        = useGameStore(s => s.isNPCUsed)
  const markUsed      = useGameStore(s => s.markNPCUsed)
  const [eaten, setEaten]       = React.useState(false)
  const [catAte, setCatAte]     = React.useState(false)
  const [awake, setAwake]       = React.useState(false)
  const flameRef = useRef()
  const ref      = useRef()

  useFrame(({ scene, clock }) => {
    if (eaten || catAte) { if (ref.current) ref.current.visible = false; return }
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(clock.elapsedTime * 8) * 0.15
    }
    const player = scene.getObjectByName('player-root')
    if (!player || !ref.current) return
    player.getWorldPosition(_pp)
    ref.current.getWorldPosition(_np)
    const dist = _pp.distanceTo(_np)
    if (dist < 3) {
      setNearby({ id: 'sentient-cake', label: '🎂 [E] Approach cake', onInteract: () => {
        if (!awake) {
          setAwake(true)
          openDialogue([
            "...",
            "WAIT. WAIT WAIT WAIT.",
            "I have FEELINGS. I have DREAMS. I dream of rolling hills and also of frosting.",
            "I have been carried in a raccoon's arms today. I have SURVIVED.",
            "I know things. The wizard wants five things. Strange things. I know where one is.",
            "The mushroom. North of the water. Under the purple light. You'll know it.",
            "Just please— do not eat me.",
          ], () => {
            // After speech: cat appears
            setCatFollows(true)
          })
        } else {
          openDialogue([
            "I don't care if it is your birthday, I am not getting eaten!",
            "Please go.",
          ])
        }
      }})
    } else if (nearby?.id === 'sentient-cake') {
      setNearby(null)
    }
  })

  if (eaten || catAte) return null

  return (
    <group ref={ref} position={position}>
      {/* Bottom layer */}
      <mesh position={[0,0.15,0]} castShadow><cylinderGeometry args={[0.52,0.52,0.3,12]}/><meshToonMaterial color="#f5c0c0"/></mesh>
      {/* Middle */}
      <mesh position={[0,0.42,0]} castShadow><cylinderGeometry args={[0.42,0.42,0.25,12]}/><meshToonMaterial color="#fff0f8"/></mesh>
      {/* Top */}
      <mesh position={[0,0.62,0]} castShadow><cylinderGeometry args={[0.3,0.3,0.2,12]}/><meshToonMaterial color="#f5c0c0"/></mesh>
      {/* Frosting drips */}
      {[0,1,2,3,4].map(i=>(
        <mesh key={i} position={[Math.cos(i*Math.PI*2/5)*0.4, 0.33, Math.sin(i*Math.PI*2/5)*0.4]}>
          <sphereGeometry args={[0.065,5,5]}/><meshToonMaterial color="#ffffff"/>
        </mesh>
      ))}
      {/* Candle */}
      <mesh position={[0,0.82,0]} castShadow><cylinderGeometry args={[0.04,0.04,0.22,6]}/><meshToonMaterial color="#ffe0f0"/></mesh>
      {/* Flame */}
      <mesh ref={flameRef} position={[0,0.98,0]}>
        <coneGeometry args={[0.055,0.16,6]}/><meshToonMaterial color="#ffcc00" emissive="#ff8800" emissiveIntensity={1}/>
      </mesh>
      <pointLight position={[0,1.1,0]} color="#ffaa00" intensity={0.5} distance={3}/>
      {/* Eyes if awake */}
      {awake && <>
        <mesh position={[0.12,0.66,0.28]}><sphereGeometry args={[0.05,5,5]}/><meshToonMaterial color="#331100"/></mesh>
        <mesh position={[-0.12,0.66,0.28]}><sphereGeometry args={[0.05,5,5]}/><meshToonMaterial color="#331100"/></mesh>
      </>}
      <Sparkle y={1.3} color="#ffaacc" />
    </group>
  )
}

// ── Treasure object ───────────────────────────────────────────────
function TreasureObject({ position, id, itemKey, icon, label }) {
  const collectItem  = useGameStore(s => s.collectItem)
  const isUsed       = useGameStore(s => s.isNPCUsed)
  const markUsed     = useGameStore(s => s.markNPCUsed)
  const openDialogue = useGameStore(s => s.openDialogue)
  const nearby       = useGameStore(s => s.nearbyInteractable)
  const setNearby    = useGameStore(s => s.setNearbyInteractable)
  // Proximity anchor — fixed, never animates position
  const anchorRef    = useRef()
  // Visual child — animates independently
  const visualRef    = useRef()
  const collected    = isUsed(id)

  useFrame(({ scene, clock }) => {
    if (collected) return
    // Proximity check uses the stable anchor
    const player = scene.getObjectByName('player-root')
    if (!player || !anchorRef.current) return
    player.getWorldPosition(_pp)
    anchorRef.current.getWorldPosition(_np)
    const dist = _pp.distanceTo(_np)
    if (dist < 2.8) {
      setNearby({ id, label: `${icon} [E] Take ${label}`, onInteract: () => {
        collectItem(itemKey)
        markUsed(id)
        setNearby(null)
        openDialogue([`You picked up: ${icon} ${label}!`])
      }})
    } else if (nearby?.id === id) {
      setNearby(null)
    }
    // Animate visual child only — never touch anchorRef.position
    if (visualRef.current) {
      visualRef.current.rotation.y = clock.elapsedTime * 1.4
      visualRef.current.position.y = 0.55 + Math.sin(clock.elapsedTime * 2.2) * 0.12
    }
  })

  if (collected) return null

  return (
    // Anchor stays put — physics and proximity use this
    <group ref={anchorRef} position={[position[0], 0.1, position[2]]}>
      {/* Visual floats independently — model per item type */}
      <group ref={visualRef} position={[0, 0.55, 0]}>
        {itemKey === 'driedfish'  && <DriedFishModel />}
        {itemKey === 'underwear'  && <UnderwearModel />}
        {itemKey === 'liquid'     && <SuspiciousLiquidModel />}
        {itemKey === 'finger'     && <FingerModel />}
        {itemKey === 'mushroom'   && <MushroomModel />}
      </group>
      {/* Sparkle orbit */}
      <Sparkle y={0.55} color="#ffdd44" />
      {/* Ground glow ring */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.3, 0.48, 20]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

// ── Gate + wall system ───────────────────────────────────────────
// Gate is at (14.891, -19.098)  Castle side = negative Z, lower X
// "inside" the walls = roughly x < 28 AND z < -12
// Player spawn (outside) = (52.364, -72.234)
// Respawn near gate guards (outside) = (19, 0, -16)

const GATE_POS       = new THREE.Vector3(14.891, 0, -19.098)
const RESPAWN_OUTSIDE = new THREE.Vector3(19, 2, -14)  // just outside gate, near guards
const INSIDE_X_MAX   = 27   // west of this = inside walls
const INSIDE_Z_MAX   = -10  // north of this = inside walls

function isInsideWalls(x, z) {
  return x < INSIDE_X_MAX && z < INSIDE_Z_MAX
}

function GateAndWallSystem() {
  // Wall jumping is allowed — wizard handles the respawn if you don't have items
  return null
}

// ── Prop (GLTF asset) ─────────────────────────────────────────────
function Prop({ path, position, rotY = 0, scale = 1 }) {
  const { scene } = useGLTF(path)
  // Disable shadow casting on all meshes in this prop
  const obj = scene.clone()
  obj.traverse(child => { if (child.isMesh) { child.castShadow = false; child.receiveShadow = true } })
  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={obj} position={position} rotation={[0, rotY, 0]} scale={scale} />
    </RigidBody>
  )
}

// ── Hex tile ground ───────────────────────────────────────────────
const _allTiles = Object.entries(WORLD_JSON.tiles)
const _allPos   = _allTiles.map(([k]) => { const [q,r] = k.split(',').map(Number); return hexToWorld(q,r) })
const _waterPos = _allTiles.filter(([,t])=>t==='water').map(([k]) => { const [q,r] = k.split(',').map(Number); return hexToWorld(q,r) })

// Build InstancedMesh lazily the first time TileGround mounts.
// We use a module-level cache so it survives StrictMode double-invoke.
let _grassMesh = null
let _waterMesh = null
// cache version — increment to force rebuild after fixes
const _CACHE_VERSION = 2

function buildTileMeshes() {
  if (_grassMesh) return // already built
  const dummy = new THREE.Object3D()

  const grassGeo = new THREE.CylinderGeometry(1.03, 1.03, 0.15, 6, 1)
  const grassMat = new THREE.MeshLambertMaterial({ color: 0x5a9e3a })
  _grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, _allPos.length)
  _grassMesh.frustumCulled = false
  _grassMesh.receiveShadow = true
  _allPos.forEach(([x, _y, z], i) => {
    dummy.position.set(x, 0, z)
    dummy.rotation.set(0, 0, 0)
    dummy.scale.set(1, 1, 1)
    dummy.updateMatrix()
    _grassMesh.setMatrixAt(i, dummy.matrix)
  })
  _grassMesh.instanceMatrix.needsUpdate = true

  if (_waterPos.length > 0) {
    const waterGeo = new THREE.CylinderGeometry(1.03, 1.03, 0.11, 6, 1)
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x3a6ecc })
    _waterMesh = new THREE.InstancedMesh(waterGeo, waterMat, _waterPos.length)
    _waterMesh.frustumCulled = false
    _waterMesh.receiveShadow = true
    _waterPos.forEach(([x, _wy, z], i) => {
      dummy.position.set(x, 0.05, z)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      _waterMesh.setMatrixAt(i, dummy.matrix)
    })
    _waterMesh.instanceMatrix.needsUpdate = true
  }
}

function TileGround() {
  // Build meshes synchronously on first render — safe inside Canvas
  buildTileMeshes()

  return (
    <>
      {/* Physics floor — one slab covering the tile area */}
      <RigidBody type="fixed" colliders={false} position={[24, -0.09, -34]}>
        <CuboidCollider args={[52, 0.09, 62]} />
      </RigidBody>

      {/* Grass tiles via primitive — R3F just adopts the existing Three.js object */}
      <primitive object={_grassMesh} />
      {_waterMesh && <primitive object={_waterMesh} />}
    </>
  )
}


// ── All props from JSON ───────────────────────────────────────────
function WorldProps() {
  const props = WORLD_JSON.objects.filter(o => o.type === 'prop')
  return (
    <Suspense fallback={null}>
      {props.map(obj => (
        <Prop key={obj.id} path={obj.asset} position={[obj.x, obj.y ?? 0, obj.z]} rotY={obj.rotY ?? 0} scale={obj.scale ?? 1} />
      ))}
    </Suspense>
  )
}

// ── NPC definitions ───────────────────────────────────────────────
// 6 quest NPCs — each gives a clue about one treasure or the wizard
const QUEST_NPCS = {
  obj_108: {
    name: 'Old Barnaby',
    lines: () => {
      const inv = useGameStore.getState().inventory
      const has = (k) => inv.includes(k)
      const missing = ['driedfish','underwear','liquid','finger','mushroom'].filter(k => !has(k))
      if (missing.length === 0) return [
        "You have everything. All five.",
        "I've been standing here for days preparing hints.",
        "Not a single one was needed.",
        "Go on then. Go see the wizard.",
      ]
      const lines = ["You're looking for the wizard? I used to work for her."]
      if (!has('finger') && !has('mushroom')) {
        lines.push("Two things I know about: a finger near the old ruins, north side. Don't ask whose.")
        lines.push("And a mushroom near the forest edge. Special one. Glows. You'll smell it first.")
      } else if (!has('finger')) {
        lines.push("I was going to mention the mushroom — but you have it. Good. Smells weird.")
        lines.push("Still need the finger. Old ruins, north side. Just sitting there being a finger about it.")
      } else if (!has('mushroom')) {
        lines.push("I was going to tell you about the finger near the ruins — but you already have it. On your person.")
        lines.push("The mushroom. Near the forest edge. You'll smell it before you see it. Purple cap.")
      } else {
        lines.push("You have the finger AND the mushroom. So that's my whole thing gone.")
        lines.push("I've been practising that speech for days.")
      }
      if (!has('driedfish')) lines.push("There's also a very dry fish near the barracks. Barry. He has a speech prepared.")
      if (!has('liquid')) lines.push("Sister Maeve has something suspicious in a bowl. She won't explain it. Just take it.")
      if (!has('underwear')) lines.push("The old man near the east tower has something. He's embarrassed. Just talk to him.")
      return lines
    },
  },
  obj_109: {
    name: 'Sister Maeve',
    lines: () => {
      const inv = useGameStore.getState().inventory
      if (inv.includes('liquid')) return [
        "Do you want another bowl?",
        "I can make another one if you'd like?",
        "*blushes*",
        "No? Fine.",
      ]
      return [
        "Oh. A visitor. I was just... preparing something.",
        "This bowl. I made it with my husband fresh this morning.",
        "...",
        "why is it white?",
        "...",
        "*blushes*",
      ]
    },
    itemKey: 'liquid',
  },
  obj_110: {
    name: 'Gerald the Fox',
    lines: () => {
      const inv = useGameStore.getState().inventory
      const has = (k) => inv.includes(k)
      const missing = ['driedfish','underwear','liquid','finger','mushroom'].filter(k => !has(k))
      if (missing.length === 0) return [
        "You have everything. You didn't even need my help.",
        "...Foxes are still better than dogs.",
        "You don't have to agree.",
      ]
      const lines = [
        "Ah. A traveler. You seek the Wizard's Castle, yes?",
        "The gate is that way. Gate guards are unpleasant. Ignore them until you have all five items.",
        "Before I help further — foxes are better than dogs. Yes or no?",
        "...Silence. Noted.",
      ]
      if (!has('driedfish') && !has('underwear')) {
        lines.push("There's a very dry fish near the barracks. Barry. He will give you a speech before he agrees to go.")
        lines.push("Also the old man near the east tower has something the wizard wants. He's mortified. Just ask.")
      } else if (!has('driedfish')) {
        lines.push("I was going to mention the old man's situation — but you sorted that already. I won't ask how.")
        lines.push("The fish. Barry. Near the barracks. He has been waiting for someone to take him. His whole life.")
      } else if (!has('underwear')) {
        lines.push("I was going to tell you about the dry fish — but you already have it. He smells like pride.")
        lines.push("The old man near the east tower. He has something. He is very embarrassed about it. His words.")
      } else {
        lines.push("You already have the fish AND the old man's item. Without my help. Somehow.")
      }
      if (!has('liquid')) lines.push("Sister Maeve has a bowl of something white. She made it this morning. She won't explain it.")
      if (!has('finger')) lines.push("There's a detached finger near the old ruins. North side. Don't ask whose.")
      if (!has('mushroom')) lines.push("A purple mushroom glows near the forest water. You'll smell it first.")
      return lines
    },
  },
  obj_111: {
    name: 'Special Mushroom',
    lines: () => {
      const inv = useGameStore.getState().inventory
      if (inv.includes('mushroom')) return [
        "Glad you have the correct shroom!",
        "Otherwise you will be the 107th person that tried to murder me.",
      ]
      return [
        "WOAH WOAH NOT ME",
        "The one you want is behind the tree near me",
        "Jesus I know I am special too but NOT THAT special",
        "Go on, off you go!",
      ]
    },
  },
  obj_112: {
    name: 'Diane the Deer',
    lines: () => {
      const inv = useGameStore.getState().inventory
      const has = (k) => inv.includes(k)
      const missing = ['driedfish','underwear','liquid','finger','mushroom'].filter(k => !has(k))
      if (missing.length === 0) return [
        "You have everything. All five.",
        "I had a whole speech prepared for each one.",
        "Gerald would have liked the speeches. But I'm not thinking about Gerald.",
        "I'm fine.",
        "Go see the wizard.",
      ]
      const lines = ["Oh. Hello. I'm fine. I'm not thinking about Gerald at all."]
      if (!has('finger') && !has('mushroom')) {
        lines.push("There is a finger near the ruins. I saw it. I did not touch it.")
        lines.push("Also I found a mushroom near the water once. Put it back. It felt wrong. You should take it though.")
      } else if (!has('finger')) {
        lines.push("Oh — I was going to tell you about the finger near the ruins.")
        lines.push("But you already have the mushroom. You just picked it up without my help.")
        lines.push("That's fine. The finger is near the old ruins. North side. I have not looked at it since Tuesday.")
      } else if (!has('mushroom')) {
        lines.push("I put that mushroom back once, you know. And you just... took the finger without asking.")
        lines.push("That's fine. The mushroom is near the water. Glows purple. Very pretty, actually.")
        lines.push("I'm fine.")
      } else {
        lines.push("I was going to tell you about the finger AND the mushroom.")
        lines.push("But you have both. You didn't need my speech. It was quite moving.")
        lines.push("Gerald would have liked it. But I'm not thinking about Gerald.")
      }
      if (!has('driedfish')) lines.push("There's a very dry fish near the barracks. Barry. He has been preparing for this moment.")
      if (!has('liquid')) lines.push("Sister Maeve has something in a bowl. White. Suspicious. I'm not asking questions either.")
      if (!has('underwear')) lines.push("The old man near the east tower has something the wizard wants. He's not happy about it.")
      lines.push("I'm fine.")
      return lines
    },
  },
  obj_113: {
    name: 'Barry the Fish',
    lines: () => {
      const inv = useGameStore.getState().inventory
      if (inv.includes('driedfish')) return [
        "Do you like fish stuff or what?",
      ]
      return [
        "Ah. You've come to witness me. I have waited for this moment.",
        "I have never touched water. Not once. I am the driest fish in this paper world.",
        "I've prepared a speech. It is four sentences. Please listen to all of them slowly.",
        ".",
        "..",
        "...",
        "A fish is not defined by water. I am defined by my choices. I choose dryness. You may take a piece of me — this is my destiny.",
      ]
    },
    itemKey: 'driedfish',
  },
}

// 5 enemy NPCs — gate guards, rude and unhelpful
// Guard dialogue is dynamic — shows missing items
function getGuardLines(id) {
  const inv     = useGameStore.getState().inventory
  const ITEMS   = { driedfish: '🐟 Dried Fish', underwear: '👙 Underwear', liquid: '🍶 Suspicious Liquid', finger: '👆 Detached Finger', mushroom: '🍄 Special Mushroom' }
  const missing = Object.entries(ITEMS).filter(([k]) => !inv.includes(k)).map(([,v]) => v)

  const baseLines = {
    obj_101: [
      "STOP. Gate is closed.",
      missing.length > 0
        ? `You're missing: ${missing.join(', ')}.`
        : "...Wait. You actually have everything. Fine. The gate is open. Go.",
      "Don't make me repeat myself.",
    ],
    obj_102: [
      missing.length > 0
        ? `I can tell by looking at you. You're missing ${missing.length} item${missing.length>1?'s':''}.`
        : "You have everything. I'm genuinely surprised. Go through.",
      missing.length > 0 ? `Still need: ${missing.join(', ')}.` : "Don't thank me.",
    ],
    obj_103: [
      "Gate's locked. Wizard's orders.",
      missing.length > 0
        ? `Five items required. You have ${5 - missing.length} of them.`
        : "Actually you have all five. The gate is open. I can't believe this day.",
      "Move along.",
    ],
    obj_104: ["...", "...", "I'm not going to help you.", "That wasn't a question."],
    obj_105: [
      "I saw something near the old ruins.",
      "A finger. Just sitting there. I did not approach it.",
      missing.length > 0 ? `You still need: ${missing.join(', ')}.` : "Not that it matters. You clearly have everything already.",
      "Leave me alone.",
    ],
  }
  return baseLines[id] || ["...", "Move along."]
}

const ENEMY_IDS = ['obj_101', 'obj_102', 'obj_103', 'obj_104', 'obj_105']

// 2 merchants — sell hints (just dialogue, no actual shop)
const MERCHANT_LINES = {
  obj_106: [
    "Ah, a customer! Or someone who looks like they need guidance.",
    "Five items. Dried fish. Underwear. Suspicious white liquid. A detached finger. A mushroom.",
    "Don't look at me like that. I'm just the messenger.",
    "I tried to sell this information for coins but nobody has coins here. It's a paper world. Very inconvenient.",
  ],
  obj_107: [
    "I have heard things. Important things. For a price.",
    "Actually I'll just tell you for free. The wizard wants a mushroom. A special one.",
    "Purple cap. Glows a bit. You'll find it near the water on the west side.",
    "Also there is a detached finger somewhere near the ruins. Don't ask me how I know.",
  ],
}

// 5 villagers — pure flavour
const VILLAGER_LINES = {
  obj_96: [
    "Quiet evening, isn't it.",
    "Well. Except for the wizard. And the kidnapping situation.",
    "Otherwise very quiet.",
  ],
  obj_97: [
    "There is a sentient cake wandering around here somewhere.",
    "It spoke to me once. It seemed distressed.",
    "I don't understand this world anymore.",
  ],
  obj_99: [
    "Oh! You startled me. I live over there.",
    "Are you heading to the wizard's castle? Everyone seems to be lately.",
    "The gate is that way. Past the wall. You'll need things to get through it.",
    "Safe travels.",
  ],
  obj_100: [
    "The barracks have been empty for years.",
    "No one knows who used to live there. The wizard, maybe?",
    "She does tend to leave things lying around. Items and such.",
    "I saw a very suspicious finger near the ruins the other day. Did not investigate.",
  ],
}

// Old woman is now quest NPC — gives underwear
const OLD_MAN_LINES = () => {
  const inv = useGameStore.getState().inventory
  if (inv.includes('underwear')) return [
    "See who's the weird one?",
    "You are the one that asked me for underwear.",
  ]
  return [
    "...",
    "Do not look at me like that.",
    "CAN'T A MAN WEAR A BIKINI!?",
    "Here. Take it. Never speak of this again.",
  ]
}


// Map each NPC id to its model component
const QUEST_MODELS = {
  obj_108: OldBarnabyModel,
  obj_109: SisterMaeveModel,
  obj_110: GeraldFoxModel,
  obj_111: MortimerMushroomModel,
  obj_112: DianeDeerModel,
  obj_113: BarryFishModel,
}
const ENEMY_MODELS = {
  obj_101: (p) => <GateGuardModel variant={0}/>,
  obj_102: (p) => <GateGuardModel variant={1}/>,
  obj_103: (p) => <GateGuardModel variant={2}/>,
  obj_104: (p) => <GateGuardModel variant={0}/>,
  obj_105: (p) => <GateGuardModel variant={1}/>,
}
const MERCHANT_MODELS = {
  obj_106: TraderVexModel,
  obj_107: PipMerchantModel,
}
const VILLAGER_MODELS = {
  obj_96:  VillagerFarmerModel,
  obj_97:  VillagerCloakModel,
  obj_98:  VillagerOldWomanModel,
  obj_99:  VillagerScoutModel,
  obj_100: VillagerChildModel,
}

// Position overrides — only NPC positions are swapped, not treasures
const POSITION_OVERRIDES = {
  obj_113: 'obj_96',  // Barry stands at farmer's old spot
  obj_96:  'obj_113', // Farmer stands at Barry's old spot
}

// Manual NPC positions — override JSON entirely (avoids overlapping with treasures)
const MANUAL_POSITIONS = {
  obj_111: { x: 11.5, y: 0, z: -36.0 }, // Special Mushroom NPC — 3 units east of the treasure
}

function getAllNPCPos(id) {
  if (MANUAL_POSITIONS[id]) return MANUAL_POSITIONS[id]
  const lookupId = POSITION_OVERRIDES[id] || id
  return WORLD_JSON.objects.find(o => o.id === lookupId)
}

function AllNPCs() {
  const collectItem  = useGameStore(s => s.collectItem)
  const markUsed     = useGameStore(s => s.markNPCUsed)

  return (
    <>
      {/* Quest NPCs — each has a unique named model + sparkle */}
      {Object.entries(QUEST_NPCS).map(([id, data]) => {
        const obj = getAllNPCPos(id)
        if (!obj) return null
        const ModelComp = QUEST_MODELS[id] || OldBarnabyModel
        return (
          <NPCBase key={id} id={id} position={[obj.x, 0, obj.z]}
            dialogueLines={data.lines}
            npcName={data.name}
            onDialogueEnd={data.itemKey ? () => collectItem(data.itemKey) : undefined}
            radius={3}>
            <ModelComp />
            <Sparkle y={2.3} color="#ffffaa" />
          </NPCBase>
        )
      })}

      {/* Wizard — stands at castle door */}
      <NPCBase id="wizard" position={[1.703, 0, 0.089]} npcName="The Wizard"
        dialogueLines={() => {
          const inv = useGameStore.getState().inventory
          const all = ['driedfish','underwear','liquid','finger','mushroom']
          const missing = all.filter(i => !inv.includes(i))
          if (missing.length === 0) return [
            "Oh. FINALLY. Do you know how long I've been waiting? I made soup THREE times.",
            "*picks up fish* ...this smells like pride.",
            "*holds the underwear and stares* ...",
            "*stares longer* ...I'm going to pretend I don't know whose these are.",
            "*sniffs the bowl* ...suspicious. Exactly as requested. Well done.",
            "*examines finger* ...good. Fresh. Relatively.",
            "*holds mushroom up to light* Oh. Oh this is a GOOD one.",
            "...Debt paid. You may collect your guest.",
          ]
          const names = { driedfish:'🐟 Dried Fish', underwear:'👙 Underwear', liquid:'🍶 Liquid', finger:'👆 Finger', mushroom:'🍄 Mushroom' }
          return [
            `You shouldn't be in here.`,
            `You're missing: ${missing.map(i=>names[i]).join(', ')}.`,
            `Come back through the gate when you have everything. NOW GO.`,
          ]
        }}
        onDialogueEnd={() => {
          const st = useGameStore.getState()
          if (st.hasAllItems()) {
            st.setGamePhase('ending')
          } else {
            // Small delay so dialogue box closes before teleport
            setTimeout(() => {
              window.__respawnRequest = { x: 19, y: 2, z: -14 }
            }, 300)
          }
        }}
        radius={4}>
        <WizardNPC />
      </NPCBase>

      {/* Gate Guards — dynamic dialogue shows missing items */}
      {ENEMY_IDS.map((id, i) => {
        const obj = getAllNPCPos(id)
        if (!obj) return null
        return (
          <NPCBase key={id} id={id} position={[obj.x, 0, obj.z]}
            dialogueLines={() => getGuardLines(id)}
            npcName="Gate Guard"
            radius={3}>
            <GateGuardModel variant={i} />
          </NPCBase>
        )
      })}

      {/* Merchants — Trader Vex (dark cloak) and Pip (cheerful stall keeper) */}
      {Object.entries(MERCHANT_LINES).map(([id, lines]) => {
        const obj = getAllNPCPos(id)
        if (!obj) return null
        const ModelComp = MERCHANT_MODELS[id] || TraderVexModel
        return (
          <NPCBase key={id} id={id} position={[obj.x, 0, obj.z]} dialogueLines={lines}
            npcName={id === 'obj_106' ? 'Trader Vex' : 'Pip'} radius={3}>
            <ModelComp />
          </NPCBase>
        )
      })}

      {/* Villagers — farmer, cloaked wanderer, scout, child */}
      {Object.entries(VILLAGER_LINES).map(([id, lines]) => {
        const obj = getAllNPCPos(id)
        if (!obj) return null
        const ModelComp = VILLAGER_MODELS[id] || VillagerFarmerModel
        return (
          <NPCBase key={id} id={id} position={[obj.x, 0, obj.z]} dialogueLines={lines}
            npcName="Villager" radius={3}>
            <ModelComp />
          </NPCBase>
        )
      })}

      {/* Old Woman — quest NPC, gives underwear */}
      {(() => {
        const obj = WORLD_JSON.objects.find(o => o.id === 'obj_98')
        if (!obj) return null
        return (
          <NPCBase id="obj_98" position={[obj.x, 0, obj.z]}
            npcName="Old Man"
            dialogueLines={OLD_MAN_LINES}
            onDialogueEnd={() => collectItem('underwear')}
            radius={3}>
            <VillagerFarmerModel />
            <Sparkle y={2.0} color="#ffccff" />
          </NPCBase>
        )
      })()}

      {/* Sentient Cake — interactable world object */}
      <SentientCake position={[22, 0, -42]} />
    </>
  )
}

// ── Treasures ─────────────────────────────────────────────────────
const TREASURE_DEFS = [
  { id: 'obj_114', itemKey: 'mushroom', icon: '🍄', label: 'Special Mushroom'  }, // (8.8,-36) — forest area
  { id: 'obj_115', itemKey: 'finger',   icon: '👆', label: 'Detached Finger'   }, // (36.7,-65) — near ruins
  { id: 'obj_116', itemKey: 'finger',   icon: '👆', label: 'Detached Finger'   }, // backup pos (38.5,-34) — only one spawns
  { id: 'obj_117', itemKey: 'mushroom', icon: '🍄', label: 'Special Mushroom'  }, // backup pos — only one spawns
  { id: 'obj_118', itemKey: 'mushroom', icon: '🍄', label: 'Special Mushroom'  }, // backup pos
]
// Deduplicate — only first uncollected of each itemKey spawns
const UNIQUE_TREASURE_DEFS = (() => {
  const seen = new Set()
  return TREASURE_DEFS.filter(t => {
    if (seen.has(t.itemKey)) return false
    seen.add(t.itemKey)
    return true
  })
})()

function AllTreasures() {
  return (
    <>
      {UNIQUE_TREASURE_DEFS.map(t => {
        const obj = WORLD_JSON.objects.find(o => o.id === t.id)
        if (!obj) return null
        return (
          <TreasureObject key={t.id} id={t.id}
            position={[obj.x, 0, obj.z]}
            itemKey={t.itemKey} icon={t.icon} label={t.label} />
        )
      })}
    </>
  )
}

// ── Notes ─────────────────────────────────────────────────────────
const NOTE_TEXTS = {
  obj_119: "Update: kidnapping going great. The wizard has named all four of her cats Gerald. I have also named a chair Gerald. The wizard said that was disrespectful. She turned the chair into soup. HURRY UP.",
  obj_120: "I have a wizard robe now. It has REAL pockets. I am keeping it. This is non-negotiable. Come get me anyway though. — Your GF 🧙‍♀️",
  obj_121: "The gate guards are grumpy but harmless. They mostly just stand there. One of them told me a finger was spotted near the ruins. Very helpful for someone who was supposed to be threatening.",
  obj_122: "Five items: a dried fish, the old woman's underwear, suspicious white liquid from Sister Maeve, a detached finger near the ruins, and a special mushroom near the west water. That is all.",
  obj_123: "I'm not spying on you but I know exactly where you are and you are taking SO long. The soup is incredible by the way. Worth it. But also PLEASE hurry.",
  obj_124: "I spotted the finger from my window. It is near the ruins, north side. Just sitting there on the ground. Completely unbothered. I did not approach it.",
  obj_125: "P.S. The fish is near the barracks. It introduced itself to me once. Very formal. Very dry. Literally.",
}

function AllNotes() {
  return (
    <>
      {Object.entries(NOTE_TEXTS).map(([id, text]) => {
        const obj = WORLD_JSON.objects.find(o => o.id === id)
        if (!obj) return null
        return <NoteObject key={id} id={id} position={[obj.x, 0, obj.z]} text={text} />
      })}
    </>
  )
}

// ── Fireflies ─────────────────────────────────────────────────────
function Firefly({ pos, phase }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime + phase
    ref.current.position.set(pos[0]+Math.sin(t*0.7)*2, pos[1]+Math.sin(t*0.5)*0.6, pos[2]+Math.cos(t*0.6)*2)
    ref.current.material.opacity = 0.4 + Math.sin(t*3)*0.35
  })
  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[0.06,4,4]} />
      <meshToonMaterial color="#88ffaa" transparent opacity={0.6} emissive="#44ff88" emissiveIntensity={1} />
    </mesh>
  )
}

// ── Procedural clouds ────────────────────────────────────────────
function CloudPuff({ position, speed = 0.3, scale = 1 }) {
  const ref = useRef()
  const startX = position[0]
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.x = startX + Math.sin(clock.elapsedTime * speed) * 8
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed * 0.7) * 0.5
    }
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      {[
        [0,0,0,2.2], [-1.4,-0.3,0,1.6], [1.4,-0.2,0,1.5],
        [-0.7,0.5,0.3,1.3], [0.8,0.4,-0.2,1.4], [0,-0.4,0.5,1.2]
      ].map(([x,y,z,r],i) => (
        <mesh key={i} position={[x,y,z]} castShadow>
          <sphereGeometry args={[r,7,5]} />
          <meshToonMaterial color="#e8e4ff" transparent opacity={0.82} />
        </mesh>
      ))}
    </group>
  )
}

function Clouds() {
  const clouds = useMemo(() => [
    { pos: [10,  18, -10],  speed: 0.18, scale: 2.2 },
    { pos: [35,  22, -30],  speed: 0.13, scale: 1.8 },
    { pos: [-5,  20, -20],  speed: 0.22, scale: 2.5 },
    { pos: [55,  16, -50],  speed: 0.15, scale: 2.0 },
    { pos: [20,  24, -60],  speed: 0.20, scale: 1.6 },
    { pos: [0,   19, -45],  speed: 0.17, scale: 2.3 },
    { pos: [50,  21, -20],  speed: 0.12, scale: 1.9 },
    { pos: [30,  17, -75],  speed: 0.25, scale: 1.7 },
    { pos: [-8,  23, -55],  speed: 0.16, scale: 2.1 },
    { pos: [65,  20, -40],  speed: 0.19, scale: 1.5 },
    { pos: [15,  25, -15],  speed: 0.14, scale: 2.4 },
    { pos: [45,  18, -65],  speed: 0.21, scale: 1.8 },
  ], [])
  return (
    <>
      {clouds.map((c, i) => (
        <CloudPuff key={i} position={c.pos} speed={c.speed} scale={c.scale} />
      ))}
    </>
  )
}


// ── Broadcasts player world position for minimap ──────────────────
function PlayerPosBroadcaster() {
  const _v = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ scene }) => {
    const p = scene.getObjectByName('player-root')
    if (p) { p.getWorldPosition(_v); window.__playerPos = { x: _v.x, z: _v.z } }
  })
  return null
}

// ── Master world component ─────────────────────────────────────────
export default function World() {
  return (
    <Suspense fallback={null}>
      {/* Ground tiles */}
      <TileGround />

      {/* All GLTF props */}
      <WorldProps />

      {/* NPCs */}
      <AllNPCs />

      {/* Treasures */}
      <AllTreasures />

      {/* Notes */}
      <AllNotes />

      {/* Gate + wall system */}
      <GateAndWallSystem />

      {/* Player */}
      <Player />

      {/* Cat companion */}
      <CatCompanion />

      {/* Fireflies scattered across world */}
      {[...Array(14)].map((_, i) => (
        <Firefly key={i} pos={[10+i*3.5, 1.5, -20-i*2.5]} phase={i*0.8} />
      ))}

      {/* Clouds drifting high above */}
      <Clouds />

      {/* Interaction manager */}
      <InteractionManager />

      {/* Player position broadcaster for minimap */}
      <PlayerPosBroadcaster />
    </Suspense>
  )
}