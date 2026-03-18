import { useWBStore, PROP_ASSETS, ASSET_GROUPS, NPC_COLORS } from './wbStore'

const TYPE_ICONS = {
  prop: '🏠', npc: '👤', note: '📝', treasure: '💎', zone_gate: '🚪',
}

// ── Styles ────────────────────────────────────────────────────────
const c = {
  sidebar: {
    width: '290px', minWidth: '290px',
    background: '#0f0a20', borderRight: '1px solid #2a1a4a',
    display: 'flex', flexDirection: 'column',
    fontFamily: 'monospace', fontSize: '13px', color: '#d0c0f0', overflow: 'hidden',
  },
  header: { padding: '12px 14px 8px', borderBottom: '1px solid #2a1a4a', background: '#160d2a' },
  title:  { fontSize: '15px', fontWeight: 'bold', color: '#cc88ff', letterSpacing: '1px', marginBottom: '1px' },
  sub:    { color: '#7060a0', fontSize: '11px' },

  tabRow: { display: 'flex', borderBottom: '1px solid #2a1a4a' },
  tab: (active) => ({
    flex: 1, padding: '9px', textAlign: 'center', cursor: 'pointer',
    background: active ? '#1a1030' : 'transparent',
    color: active ? '#cc88ff' : '#5a4880',
    borderBottom: active ? '2px solid #8844ff' : '2px solid transparent',
    fontSize: '12px', fontFamily: 'monospace',
  }),

  section: { padding: '10px 12px', borderBottom: '1px solid #1a1030' },
  secTitle: { fontSize: '10px', letterSpacing: '2px', color: '#7060a0', textTransform: 'uppercase', marginBottom: '7px' },

  toolRow: { display: 'flex', gap: '5px', marginBottom: '5px', flexWrap: 'wrap' },
  toolBtn: (active, danger = false) => ({
    flex: 1, padding: '7px 5px',
    background: active ? (danger ? '#4a0000' : '#2a0a50') : '#140a28',
    border: `1px solid ${active ? (danger ? '#cc0000' : '#8844ff') : '#2a1a4a'}`,
    borderRadius: '5px', color: active ? (danger ? '#ff8888' : '#cc88ff') : '#7060a0',
    cursor: 'pointer', fontSize: '11px', fontFamily: 'monospace', minWidth: '60px',
  }),

  typeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' },
  typeBtn: (active) => ({
    padding: '7px 4px',
    background: active ? '#2a1050' : '#140a28',
    border: `1px solid ${active ? '#8844ff' : '#2a1a4a'}`,
    borderRadius: '5px', color: active ? '#cc88ff' : '#7060a0',
    cursor: 'pointer', textAlign: 'center', fontSize: '11px', fontFamily: 'monospace',
  }),

  label:  { color: '#9080b0', marginBottom: '3px', display: 'block', fontSize: '11px' },
  select: {
    width: '100%', background: '#140a28', border: '1px solid #2a1a4a',
    borderRadius: '5px', color: '#d0c0f0', padding: '5px 7px',
    fontSize: '12px', fontFamily: 'monospace', marginBottom: '6px',
  },
  input: {
    width: '100%', background: '#140a28', border: '1px solid #2a1a4a',
    borderRadius: '5px', color: '#d0c0f0', padding: '5px 7px',
    fontSize: '12px', fontFamily: 'monospace', marginBottom: '6px', boxSizing: 'border-box',
  },
  range: { width: '100%', marginBottom: '6px', accentColor: '#8844ff' },

  colorRow: { display: 'flex', gap: '5px', marginBottom: '6px', flexWrap: 'wrap' },
  colorDot: (color, active) => ({
    width: '24px', height: '24px', borderRadius: '50%', background: color,
    border: active ? '2px solid #fff' : '2px solid transparent',
    cursor: 'pointer', boxShadow: active ? `0 0 6px ${color}` : 'none',
  }),

  scrollList: { flex: 1, overflowY: 'auto', padding: '6px 10px' },
  objRow: (selected) => ({
    display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 7px',
    borderRadius: '5px', background: selected ? '#2a1050' : 'transparent',
    border: `1px solid ${selected ? '#8844ff' : 'transparent'}`,
    cursor: 'pointer', marginBottom: '2px',
  }),
  delBtn: { background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '13px', padding: '0 2px' },

  // Tile palette
  tilePalette: { display: 'flex', gap: '6px', marginBottom: '8px' },
  tileBtn: (color, active) => ({
    flex: 1, padding: '10px 6px', borderRadius: '6px', cursor: 'pointer', textAlign: 'center',
    background: active ? color + '33' : '#140a28',
    border: `2px solid ${active ? color : '#2a1a4a'}`,
    color: active ? color : '#7060a0', fontSize: '11px', fontFamily: 'monospace',
  }),

  // Fill tool
  fillRow: { display: 'flex', gap: '5px', marginTop: '6px' },
  fillInput: {
    width: '52px', background: '#140a28', border: '1px solid #2a1a4a',
    borderRadius: '4px', color: '#d0c0f0', padding: '4px 5px',
    fontSize: '11px', fontFamily: 'monospace', textAlign: 'center',
  },
  fillBtn: {
    flex: 1, padding: '6px', background: '#1a0a40', border: '1px solid #5533aa',
    borderRadius: '5px', color: '#bb88ff', cursor: 'pointer', fontSize: '11px', fontFamily: 'monospace',
  },

  // Inspector
  coordInput: {
    flex: 1, background: '#140a28', border: '1px solid #2a1a4a',
    borderRadius: '4px', color: '#d0c0f0', padding: '4px 5px',
    fontSize: '11px', fontFamily: 'monospace',
  },
  coordLabel: { color: '#7060a0', fontSize: '10px', marginBottom: '1px' },
}

// ── Tile stats mini display ────────────────────────────────────────
function TileStats() {
  const tiles = useWBStore(s => s.tiles)
  const grass = Object.values(tiles).filter(t => t === 'grass').length
  const water = Object.values(tiles).filter(t => t === 'water').length
  return (
    <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#7060a0', marginTop: '4px' }}>
      <span style={{ color: '#44bb66' }}>🟩 {grass} grass</span>
      <span style={{ color: '#4488ff' }}>🟦 {water} water</span>
      <span>total: {grass + water}</span>
    </div>
  )
}

// ── Tiles Tab ─────────────────────────────────────────────────────
function TilesTab() {
  const tool           = useWBStore(s => s.tool)
  const setTool        = useWBStore(s => s.setTool)
  const activeTileType = useWBStore(s => s.activeTileType)
  const setActiveTile  = useWBStore(s => s.setActiveTileType)
  const fillHexCircle  = useWBStore(s => s.fillHexCircle)
  const clearTiles     = useWBStore(s => s.clearTiles)

  const isTileTool = tool === 'tile_paint' || tool === 'tile_erase'

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Tool buttons */}
      <div style={c.section}>
        <div style={c.secTitle}>Tile Tool</div>
        <div style={c.toolRow}>
          <button style={c.toolBtn(tool === 'tile_paint')} onClick={() => setTool('tile_paint')}>🖌 Paint</button>
          <button style={c.toolBtn(tool === 'tile_erase', true)} onClick={() => setTool('tile_erase')}>🧹 Erase</button>
          <button style={c.toolBtn(tool === 'select')} onClick={() => setTool('select')}>✋ Select</button>
        </div>
        <div style={{ color: '#4a3870', fontSize: '10px' }}>
          {tool === 'tile_paint' ? 'Click or drag to paint tiles'
          : tool === 'tile_erase' ? 'Click or drag to erase tiles'
          : 'Tile tools off — switch to paint or erase'}
        </div>
      </div>

      {/* Tile type palette */}
      <div style={c.section}>
        <div style={c.secTitle}>Tile Type</div>
        <div style={c.tilePalette}>
          <button style={c.tileBtn('#44bb66', activeTileType === 'grass')}
            onClick={() => { setActiveTile('grass'); if (!isTileTool) setTool('tile_paint') }}>
            🟩<br/>grass
          </button>
          <button style={c.tileBtn('#4488ff', activeTileType === 'water')}
            onClick={() => { setActiveTile('water'); if (!isTileTool) setTool('tile_paint') }}>
            🟦<br/>water
          </button>
        </div>
      </div>

      {/* Fill circle tool */}
      <div style={c.section}>
        <div style={c.secTitle}>Fill Circle</div>
        <div style={{ color: '#7060a0', fontSize: '11px', marginBottom: '8px' }}>
          Stamp a full hex circle of the active tile type
        </div>
        <FillCircleTool />
      </div>

      {/* Stats */}
      <div style={c.section}>
        <div style={c.secTitle}>Tile Count</div>
        <TileStats />
        <button
          onClick={() => { if (window.confirm('Clear all tiles?')) clearTiles() }}
          style={{ marginTop: '8px', padding: '5px 10px', background: '#2a0808', border: '1px solid #660000', borderRadius: '4px', color: '#ff6666', cursor: 'pointer', fontSize: '11px', fontFamily: 'monospace' }}>
          🗑 Clear all tiles
        </button>
      </div>

      {/* Mini tile map */}
      <div style={c.section}>
        <div style={c.secTitle}>Tile Map Preview</div>
        <TileMiniMap />
      </div>
    </div>
  )
}

function FillCircleTool() {
  const fillHexCircle  = useWBStore(s => s.fillHexCircle)
  const activeTileType = useWBStore(s => s.activeTileType)
  const tiles          = useWBStore(s => s.tiles)

  const handleFill = () => {
    const q = parseInt(document.getElementById('fill-q').value) || 0
    const r = parseInt(document.getElementById('fill-r').value) || 0
    const rad = parseInt(document.getElementById('fill-rad').value) || 8
    const type = document.getElementById('fill-type').value
    fillHexCircle(q, r, rad, type)
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginBottom: '6px' }}>
        <div>
          <div style={c.coordLabel}>Center Q</div>
          <input id="fill-q" type="number" defaultValue="0" style={c.fillInput} />
        </div>
        <div>
          <div style={c.coordLabel}>Center R</div>
          <input id="fill-r" type="number" defaultValue="0" style={c.fillInput} />
        </div>
        <div>
          <div style={c.coordLabel}>Radius</div>
          <input id="fill-rad" type="number" defaultValue="8" min="1" max="30" style={c.fillInput} />
        </div>
      </div>
      <div style={{ marginBottom: '6px' }}>
        <div style={c.coordLabel}>Type</div>
        <select id="fill-type" style={{ ...c.select, marginBottom: 0 }}>
          <option value="grass">🟩 Grass</option>
          <option value="water">🟦 Water</option>
          <option value="erase">🧹 Erase</option>
        </select>
      </div>
      <button style={c.fillBtn} onClick={handleFill}>▶ Fill Circle</button>
      <div style={{ color: '#4a3870', fontSize: '10px', marginTop: '5px' }}>
        Tip: fill a grass circle (r=12), then paint water on top for rivers/moats
      </div>
    </div>
  )
}

// ── Mini 2D tile map (canvas-based) ───────────────────────────────
function TileMiniMap() {
  const tiles = useWBStore(s => s.tiles)
  const keys  = Object.keys(tiles)
  if (!keys.length) return <div style={{ color: '#4a3870', fontSize: '11px' }}>No tiles placed yet</div>

  const SIZE = 220
  // Find bounds
  let minQ=Infinity,maxQ=-Infinity,minR=Infinity,maxR=-Infinity
  keys.forEach(k => {
    const [q,r] = k.split(',').map(Number)
    minQ=Math.min(minQ,q); maxQ=Math.max(maxQ,q)
    minR=Math.min(minR,r); maxR=Math.max(maxR,r)
  })
  const spanQ = maxQ-minQ+1, spanR = maxR-minR+1
  const hex_r = Math.min(SIZE/(spanQ*1.5+1), SIZE/(spanR*1.8+1), 8)

  const hexPoints = (cx,cy,r) => {
    const pts = []
    for(let i=0;i<6;i++){
      const a = Math.PI/180*(60*i-30)
      pts.push(`${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`)
    }
    return pts.join(' ')
  }

  const tileEls = keys.map(key => {
    const [q,r] = key.split(',').map(Number)
    const px = (q-minQ) * hex_r * 1.5 + hex_r + 4
    const py = (r-minR) * hex_r * Math.sqrt(3) + (q-minQ) * hex_r * Math.sqrt(3)/2 + hex_r + 4
    const fill = tiles[key] === 'water' ? '#2255aa' : '#2a7a3a'
    return <polygon key={key} points={hexPoints(px,py,hex_r-0.5)} fill={fill} stroke="#1a1a2a" strokeWidth="0.5" />
  })

  const svgH = (maxR-minR+1)*hex_r*Math.sqrt(3) + hex_r*2 + 8
  const svgW = (maxQ-minQ+1)*hex_r*1.5 + hex_r*2 + 8

  return (
    <div style={{ background: '#080414', borderRadius: '6px', padding: '6px', overflow: 'auto', maxHeight: '160px' }}>
      <svg width={Math.min(svgW, SIZE)} height={Math.min(svgH, SIZE)} viewBox={`0 0 ${svgW} ${svgH}`}>
        {tileEls}
      </svg>
    </div>
  )
}

// ── Inspector ─────────────────────────────────────────────────────
function Inspector() {
  const selectedId   = useWBStore(s => s.selectedId)
  const objects      = useWBStore(s => s.objects)
  const updateObject = useWBStore(s => s.updateObject)
  const deleteObject = useWBStore(s => s.deleteObject)
  const obj = objects.find(o => o.id === selectedId)

  if (!obj) return (
    <div style={{ ...c.section, color: '#4a3870', fontStyle: 'italic', fontSize: '11px' }}>
      Click an object in the scene or list to inspect
    </div>
  )

  const u = (k, v) => updateObject(obj.id, { [k]: v })

  return (
    <div style={{ ...c.section, overflowY: 'auto' }}>
      <div style={{ ...c.secTitle, marginBottom: '8px' }}>Inspector — {obj.type}</div>

      {/* Coords */}
      {['x','y','z'].map(k => (
        <div key={k} style={{ marginBottom: '5px' }}>
          <div style={c.coordLabel}>{k.toUpperCase()}</div>
          <input type="number" step="0.1" value={obj[k] ?? 0}
            onChange={e => u(k, parseFloat(e.target.value) || 0)} style={c.coordInput} />
        </div>
      ))}

      <label style={c.label}>Rotation Y (rad)</label>
      <input type="number" step="0.1" value={obj.rotY ?? 0}
        onChange={e => u('rotY', parseFloat(e.target.value) || 0)} style={c.input} />

      <label style={c.label}>Scale — {(obj.scale ?? 1).toFixed(2)}</label>
      <input type="range" min="0.1" max="6" step="0.05" value={obj.scale ?? 1}
        onChange={e => u('scale', parseFloat(e.target.value))} style={c.range} />

      {obj.type === 'prop' && (
        <>
          <label style={c.label}>Asset Group</label>
          <select
            value={PROP_ASSETS.find(a => a.path === obj.asset)?.group ?? 'Buildings'}
            onChange={e => {
              const first = PROP_ASSETS.find(a => a.group === e.target.value)
              if (first) u('asset', first.path)
            }}
            style={c.select}
          >
            {['Buildings','Walls','Nature'].map(g => <option key={g}>{g}</option>)}
          </select>
          <label style={c.label}>Asset</label>
          <select value={obj.asset} onChange={e => u('asset', e.target.value)} style={c.select}>
            {PROP_ASSETS
              .filter(a => a.group === (PROP_ASSETS.find(x => x.path === obj.asset)?.group ?? 'Buildings'))
              .map(a => <option key={a.path} value={a.path}>{a.label}</option>)}
          </select>
        </>
      )}

      {obj.type === 'npc' && (
        <>
          <label style={c.label}>NPC ID</label>
          <input type="text" value={obj.npcId ?? ''} onChange={e => u('npcId', e.target.value)}
            style={c.input} placeholder="e.g. gerald-fox" />
          <label style={c.label}>Role</label>
          <div style={c.colorRow}>
            {Object.entries(NPC_COLORS).map(([role, col]) => (
              <div key={role} title={role} style={c.colorDot(col, obj.color === role)} onClick={() => u('color', role)} />
            ))}
          </div>
        </>
      )}

      {obj.type === 'note' && (
        <>
          <label style={c.label}>Note ID</label>
          <input type="text" value={obj.noteId ?? ''} onChange={e => u('noteId', e.target.value)}
            style={c.input} placeholder="e.g. note1" />
          <label style={c.label}>Text preview</label>
          <textarea value={obj.text ?? ''} onChange={e => u('text', e.target.value)}
            style={{ ...c.input, height: '56px', resize: 'vertical' }}
            placeholder="Optional note content" />
        </>
      )}

      {obj.type === 'treasure' && (
        <>
          <label style={c.label}>Treasure ID</label>
          <input type="text" value={obj.treasureId ?? ''} onChange={e => u('treasureId', e.target.value)}
            style={c.input} placeholder="fish / shoe / moonbeam / clock" />
        </>
      )}

      {obj.type === 'zone_gate' && (
        <>
          <label style={c.label}>Gate Label</label>
          <input type="text" value={obj.label ?? ''} onChange={e => u('label', e.target.value)}
            style={c.input} placeholder="Into the Forest" />
          <label style={c.label}>Trigger Radius</label>
          <input type="number" step="0.5" min="1" max="20" value={obj.radius ?? 4}
            onChange={e => u('radius', parseFloat(e.target.value))} style={c.input} />
        </>
      )}

      <button onClick={() => deleteObject(obj.id)} style={{
        width: '100%', padding: '6px', marginTop: '4px',
        background: '#2a0808', border: '1px solid #660000',
        borderRadius: '5px', color: '#ff6666', cursor: 'pointer', fontSize: '11px', fontFamily: 'monospace',
      }}>🗑 Delete</button>
    </div>
  )
}

// ── Objects Tab ───────────────────────────────────────────────────
function ObjectsTab() {
  const tool            = useWBStore(s => s.tool)
  const setTool         = useWBStore(s => s.setTool)
  const pendingType     = useWBStore(s => s.pendingType)
  const pendingAsset    = useWBStore(s => s.pendingAsset)
  const pendingAssetGroup = useWBStore(s => s.pendingAssetGroup)
  const pendingNpcColor = useWBStore(s => s.pendingNpcColor)
  const pendingNpcId    = useWBStore(s => s.pendingNpcId)
  const pendingNoteId   = useWBStore(s => s.pendingNoteId)
  const pendingTreasureId = useWBStore(s => s.pendingTreasureId)
  const pendingScale    = useWBStore(s => s.pendingScale)
  const pendingRotY     = useWBStore(s => s.pendingRotY)
  const objects         = useWBStore(s => s.objects)
  const selectedId      = useWBStore(s => s.selectedId)
  const setSelected     = useWBStore(s => s.setSelected)
  const deleteObject    = useWBStore(s => s.deleteObject)
  const clearObjects    = useWBStore(s => s.clearObjects)
  const st              = useWBStore.getState

  const groupAssets = PROP_ASSETS.filter(a => a.group === pendingAssetGroup)

  const objLabel = (obj) => {
    if (obj.type === 'prop') return PROP_ASSETS.find(a => a.path === obj.asset)?.label ?? obj.asset.split('/').pop()
    if (obj.type === 'npc')  return obj.npcId || obj.id
    if (obj.type === 'note') return obj.noteId || obj.id
    if (obj.type === 'treasure') return obj.treasureId || obj.id
    return obj.label || obj.id
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Tool */}
      <div style={c.section}>
        <div style={c.secTitle}>Tool</div>
        <div style={c.toolRow}>
          <button style={c.toolBtn(tool === 'select')} onClick={() => setTool('select')}>✋ Select</button>
          <button style={c.toolBtn(tool === 'place')}  onClick={() => setTool('place')}>➕ Place</button>
        </div>
        <div style={{ color: '#4a3870', fontSize: '10px' }}>
          {tool === 'place' ? 'Click grid to place • Right-drag to pan' : 'Click object to select and move'}
        </div>
      </div>

      {/* Place config */}
      {tool === 'place' && (
        <div style={c.section}>
          <div style={c.secTitle}>Place Type</div>
          <div style={c.typeGrid}>
            {Object.entries(TYPE_ICONS).map(([type, icon]) => (
              <button key={type} style={c.typeBtn(pendingType === type)}
                onClick={() => st().setPendingType(type)}>
                {icon}<br/><span style={{ fontSize: '9px' }}>{type}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '9px' }}>
            {pendingType === 'prop' && (
              <>
                <label style={c.label}>Group</label>
                <select value={pendingAssetGroup}
                  onChange={e => {
                    st().setPendingAssetGroup(e.target.value)
                    const first = PROP_ASSETS.find(a => a.group === e.target.value)
                    if (first) st().setPendingAsset(first.path)
                  }} style={c.select}>
                  {ASSET_GROUPS.map(g => <option key={g}>{g}</option>)}
                </select>
                <label style={c.label}>Asset</label>
                <select value={pendingAsset} onChange={e => st().setPendingAsset(e.target.value)} style={c.select}>
                  {groupAssets.map(a => <option key={a.path} value={a.path}>{a.label}</option>)}
                </select>
              </>
            )}

            {pendingType === 'npc' && (
              <>
                <label style={c.label}>NPC ID</label>
                <input type="text" value={pendingNpcId}
                  onChange={e => st().setPendingNpcId(e.target.value)}
                  style={c.input} placeholder="e.g. gerald-fox" />
                <label style={c.label}>Role / Color</label>
                <div style={c.colorRow}>
                  {Object.entries(NPC_COLORS).map(([role, col]) => (
                    <div key={role} title={role} style={c.colorDot(col, pendingNpcColor === role)}
                      onClick={() => st().setPendingNpcColor(role)} />
                  ))}
                </div>
                <div style={{ color: '#5a4870', fontSize: '10px', marginBottom: '5px' }}>
                  🟡 quest 🔵 villager 🔴 enemy 🟢 merchant 🟣 neutral
                </div>
              </>
            )}

            {pendingType === 'note' && (
              <>
                <label style={c.label}>Note ID</label>
                <input type="text" value={pendingNoteId}
                  onChange={e => st().setPendingNoteId(e.target.value)}
                  style={c.input} placeholder="e.g. note1" />
              </>
            )}

            {pendingType === 'treasure' && (
              <>
                <label style={c.label}>Treasure ID</label>
                <input type="text" value={pendingTreasureId}
                  onChange={e => st().setPendingTreasureId(e.target.value)}
                  style={c.input} placeholder="fish / shoe / moonbeam / clock" />
              </>
            )}

            <label style={c.label}>Scale — {parseFloat(pendingScale).toFixed(2)}</label>
            <input type="range" min="0.1" max="6" step="0.05" value={pendingScale}
              onChange={e => st().setPendingScale(e.target.value)} style={c.range} />

            <label style={c.label}>Rotation Y — {(parseFloat(pendingRotY) * 180 / Math.PI).toFixed(0)}°</label>
            <input type="range" min="0" max={Math.PI * 2} step="0.05" value={pendingRotY}
              onChange={e => st().setPendingRotY(e.target.value)} style={c.range} />
          </div>
        </div>
      )}

      {/* Inspector when selected */}
      {tool === 'select' && selectedId && <Inspector />}

      {/* Object list */}
      <div style={{ ...c.section, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={c.secTitle}>Objects ({objects.length})</div>
          {objects.length > 0 && (
            <button onClick={() => { if (window.confirm('Clear all objects?')) clearObjects() }}
              style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '11px' }}>
              clear all
            </button>
          )}
        </div>
        <div style={c.scrollList}>
          {objects.length === 0 && <div style={{ color: '#4a3870', fontStyle: 'italic', fontSize: '11px' }}>No objects yet</div>}
          {objects.map(obj => (
            <div key={obj.id} style={c.objRow(selectedId === obj.id)}
              onClick={() => { setSelected(obj.id); setTool('select') }}>
              <span style={{ fontSize: '13px', minWidth: '16px' }}>{TYPE_ICONS[obj.type] ?? '?'}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '11px' }}>
                {objLabel(obj)}
              </span>
              <span style={{ color: '#4a3870', fontSize: '10px' }}>{obj.x?.toFixed(0)},{obj.z?.toFixed(0)}</span>
              <button style={c.delBtn} onClick={e => { e.stopPropagation(); deleteObject(obj.id) }}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Root sidebar ──────────────────────────────────────────────────
export default function WBSidebar() {
  const sidebarTab    = useWBStore(s => s.sidebarTab)
  const setSidebarTab = useWBStore(s => s.setSidebarTab)

  return (
    <div style={c.sidebar}>
      <div style={c.header}>
        <div style={c.title}>🧙‍♀️ World Builder</div>
        <div style={c.sub}>Paper Wizard — Layout Editor</div>
      </div>

      <div style={c.tabRow}>
        <button style={c.tab(sidebarTab === 'objects')} onClick={() => setSidebarTab('objects')}>🏠 Objects</button>
        <button style={c.tab(sidebarTab === 'tiles')}   onClick={() => setSidebarTab('tiles')}>🟩 Tiles</button>
      </div>

      {sidebarTab === 'objects' ? <ObjectsTab /> : <TilesTab />}
    </div>
  )
}