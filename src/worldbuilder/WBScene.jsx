import { useRef, useCallback, Suspense, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Grid, TransformControls, OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei'
import * as THREE from 'three'
import { useWBStore, NPC_COLORS, hexToWorld, worldToHex } from './wbStore'

// ── Hex tile rendered from GLTF ────────────────────────────────────
function HexTileGLTF({ type, x, z }) {
  const path = type === 'water' ? '/assets/hex_water.gltf' : '/assets/hex_grass.gltf'
  const { scene } = useGLTF(path)
  return <primitive object={scene.clone()} position={[x, -0.05, z]} scale={1.03} />
}

// ── All rendered tiles ─────────────────────────────────────────────
function TileLayer() {
  const tiles = useWBStore(s => s.tiles)
  return (
    <Suspense fallback={null}>
      {Object.entries(tiles).map(([key, type]) => {
        const [q, r] = key.split(',').map(Number)
        const [x, z] = hexToWorld(q, r)
        return <HexTileGLTF key={key} type={type} x={x} z={z} />
      })}
    </Suspense>
  )
}

// ── Hex cursor highlight ───────────────────────────────────────────
function HexCursor({ groundRef }) {
  const ref   = useRef()
  const tool  = useWBStore(s => s.tool)
  const { raycaster, camera, pointer } = useThree()

  useFrame(() => {
    if (!ref.current) return
    const isTileTool = tool === 'tile_paint' || tool === 'tile_erase'
    if (!isTileTool) { ref.current.visible = false; return }

    raycaster.setFromCamera(pointer, camera)
    const ground = groundRef.current
    if (!ground) { ref.current.visible = false; return }
    const hits = raycaster.intersectObject(ground, false)
    if (!hits.length) { ref.current.visible = false; return }

    const [q, r] = worldToHex(hits[0].point.x, hits[0].point.z)
    const [hx, hz] = hexToWorld(q, r)
    ref.current.position.set(hx, 0.08, hz)
    ref.current.visible = true
  })

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0.52]} visible={false}>
      <circleGeometry args={[1.02, 6]} />
      <meshBasicMaterial
        color={tool === 'tile_erase' ? '#ff4444' : '#44ffcc'}
        transparent opacity={0.35}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ── Ghost prop preview while placing ──────────────────────────────
function GhostProp({ asset }) {
  const { scene } = useGLTF(asset)
  return <primitive object={scene.clone()} />
}

function GhostPreview({ groundRef }) {
  const ref   = useRef()
  const tool  = useWBStore(s => s.tool)
  const pendingType  = useWBStore(s => s.pendingType)
  const pendingAsset = useWBStore(s => s.pendingAsset)
  const pendingScale = useWBStore(s => s.pendingScale)
  const pendingRotY  = useWBStore(s => s.pendingRotY)
  const pendingNpcColor = useWBStore(s => s.pendingNpcColor)
  const { raycaster, camera, pointer } = useThree()

  useFrame(() => {
    if (!ref.current || tool !== 'place') { if (ref.current) ref.current.visible = false; return }
    raycaster.setFromCamera(pointer, camera)
    const hits = groundRef.current ? raycaster.intersectObject(groundRef.current, false) : []
    if (hits.length) {
      ref.current.visible = true
      ref.current.position.set(hits[0].point.x, 0, hits[0].point.z)
    } else {
      ref.current.visible = false
    }
  })

  const color = pendingType === 'npc' ? (NPC_COLORS[pendingNpcColor] ?? '#44aaff')
    : pendingType === 'note'      ? '#ffffff'
    : pendingType === 'treasure'  ? '#ffaa00'
    : pendingType === 'zone_gate' ? '#00ffcc'
    : '#88ffaa'

  return (
    <group ref={ref} rotation={[0, pendingRotY, 0]} scale={pendingScale} visible={false}>
      {pendingType === 'prop' ? (
        <Suspense fallback={null}><GhostProp asset={pendingAsset} /></Suspense>
      ) : (
        <mesh position={[0, pendingType === 'npc' ? 0.7 : 0.5, 0]}>
          {pendingType === 'npc'       ? <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
          : pendingType === 'note'     ? <boxGeometry args={[0.5, 0.5, 0.05]} />
          : pendingType === 'treasure' ? <octahedronGeometry args={[0.4]} />
          :                             <cylinderGeometry args={[0.5, 0.5, 0.15, 16]} />}
          <meshStandardMaterial color={color} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  )
}

// ── Placed object ──────────────────────────────────────────────────
function PlacedProp({ asset }) {
  const { scene } = useGLTF(asset)
  return <primitive object={scene.clone()} />
}

function PlacedObject({ obj }) {
  const selectedId   = useWBStore(s => s.selectedId)
  const setSelected  = useWBStore(s => s.setSelected)
  const updateObject = useWBStore(s => s.updateObject)
  const tool         = useWBStore(s => s.tool)
  const isSelected   = selectedId === obj.id
  const meshRef      = useRef()
  const tfRef        = useRef()

  const onTransformChange = useCallback(() => {
    if (!meshRef.current) return
    const p = meshRef.current.position
    const r = meshRef.current.rotation
    const sc = meshRef.current.scale
    updateObject(obj.id, {
      x: +p.x.toFixed(3), y: +p.y.toFixed(3), z: +p.z.toFixed(3),
      rotY: +r.y.toFixed(3), scale: +sc.x.toFixed(3),
    })
  }, [obj.id, updateObject])

  const npcColor = obj.type === 'npc' ? (NPC_COLORS[obj.color] ?? '#44aaff') : '#fff'

  const inner = (
    <group
      ref={meshRef}
      position={[obj.x, obj.y ?? 0, obj.z]}
      rotation={[0, obj.rotY ?? 0, 0]}
      scale={obj.scale ?? 1}
      onClick={(e) => { e.stopPropagation(); setSelected(obj.id) }}
    >
      {obj.type === 'prop' ? (
        <Suspense fallback={null}><PlacedProp asset={obj.asset} /></Suspense>
      ) : obj.type === 'npc' ? (
        <group>
          <mesh position={[0, 0.7, 0]}>
            <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
            <meshStandardMaterial color={npcColor} />
          </mesh>
          {/* ID tag */}
          <mesh position={[0, 1.75, 0]}>
            <planeGeometry args={[1.4, 0.38]} />
            <meshBasicMaterial color="#111111cc" transparent side={THREE.DoubleSide} />
          </mesh>
        </group>
      ) : obj.type === 'note' ? (
        <group>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.55, 0.55, 0.06]} />
            <meshStandardMaterial color="#fffde0" />
          </mesh>
          <mesh position={[0, 0.5, 0.04]}>
            <boxGeometry args={[0.04, 0.48, 0.01]} />
            <meshBasicMaterial color="#cc2222" />
          </mesh>
        </group>
      ) : obj.type === 'treasure' ? (
        <mesh position={[0, 0.5, 0]}>
          <octahedronGeometry args={[0.42]} />
          <meshStandardMaterial color="#ffcc00" emissive="#cc8800" emissiveIntensity={0.4} />
        </mesh>
      ) : (
        <group>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.18, 16]} />
            <meshStandardMaterial color="#00ffcc" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <ringGeometry args={[0.62, 0.7, 24]} />
            <meshBasicMaterial color="#00ffcc" />
          </mesh>
        </group>
      )}

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.75, 0.95, 24]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )

  if (isSelected && tool === 'select') {
    return (
      <TransformControls ref={tfRef} object={meshRef} mode="translate" onObjectChange={onTransformChange}>
        {inner}
      </TransformControls>
    )
  }
  return inner
}

// ── Main scene ─────────────────────────────────────────────────────
export default function WBScene() {
  const objects      = useWBStore(s => s.objects)
  const tool         = useWBStore(s => s.tool)
  const placeObject  = useWBStore(s => s.placeObject)
  const setSelected  = useWBStore(s => s.setSelected)
  const setTile      = useWBStore(s => s.setTile)
  const activeTileType = useWBStore(s => s.activeTileType)
  const groundRef    = useRef()
  const isPainting   = useRef(false)
  const { raycaster, camera, pointer } = useThree()

  // Tile painting on pointer events
  const paintTileAt = useCallback((e) => {
    const type = tool === 'tile_erase' ? 'erase' : activeTileType
    const [q, r] = worldToHex(e.point.x, e.point.z)
    setTile(q, r, type)
  }, [tool, activeTileType, setTile])

  const handleGroundClick = useCallback((e) => {
    e.stopPropagation()
    if (tool === 'place')       { placeObject(e.point.x, e.point.z); return }
    if (tool === 'tile_paint' || tool === 'tile_erase') { paintTileAt(e); return }
  }, [tool, placeObject, paintTileAt])

  const handlePointerDown = useCallback((e) => {
    if (tool === 'tile_paint' || tool === 'tile_erase') {
      isPainting.current = true
      paintTileAt(e)
    }
  }, [tool, paintTileAt])

  const handlePointerMove = useCallback((e) => {
    if (isPainting.current && (tool === 'tile_paint' || tool === 'tile_erase')) {
      paintTileAt(e)
    }
  }, [tool, paintTileAt])

  const handlePointerUp = useCallback(() => { isPainting.current = false }, [])

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[20, 30, 20]} intensity={1.2} castShadow />
      <pointLight position={[0, 10, 0]} intensity={0.3} color="#ccaaff" />

      {/* Reference grid */}
      <Grid
        args={[300, 300]}
        cellSize={1} cellThickness={0.3} cellColor="#334455"
        sectionSize={10} sectionThickness={0.8} sectionColor="#556677"
        fadeDistance={160} fadeStrength={1} infiniteGrid
        position={[0, 0.005, 0]}
      />

      {/* Ground plane — handles clicks + paint drag */}
      <mesh
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={handleGroundClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial visible={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Deselect background */}
      <mesh
        position={[0, -0.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={() => { if (tool === 'select') setSelected(null) }}
      >
        <planeGeometry args={[600, 600]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Tiles */}
      <TileLayer />

      {/* Hex cursor highlight */}
      <HexCursor groundRef={groundRef} />

      {/* Placed objects */}
      {objects.map(obj => <PlacedObject key={obj.id} obj={obj} />)}

      {/* Ghost preview */}
      <Suspense fallback={null}>
        <GhostPreview groundRef={groundRef} />
      </Suspense>

      {/* Camera */}
      <OrbitControls
        enablePan enableZoom enableRotate
        maxPolarAngle={Math.PI / 2.05}
        minDistance={3} maxDistance={160}
        panSpeed={1.4}
        mouseButtons={{
          LEFT:   (tool === 'place' || tool === 'tile_paint' || tool === 'tile_erase') ? -1 : THREE.MOUSE.LEFT,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT:  THREE.MOUSE.PAN,
        }}
      />

      <GizmoHelper alignment="bottom-right" margin={[72, 72]}>
        <GizmoViewport axisColors={['#ff4444', '#44ff88', '#4488ff']} labelColor="white" />
      </GizmoHelper>
    </>
  )
}