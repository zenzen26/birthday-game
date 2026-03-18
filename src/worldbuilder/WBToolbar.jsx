import { useRef, useState } from 'react'
import { useWBStore } from './wbStore'

const s = {
  bar: {
    height: '48px',
    background: '#0f0a20',
    borderBottom: '1px solid #2a1a4a',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: '10px',
    flexShrink: 0,
  },
  btn: (variant = 'default') => ({
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'monospace',
    transition: 'all 0.15s',
    ...(variant === 'primary' ? {
      background: '#5a1a8a',
      borderColor: '#aa55ff',
      color: '#fff',
    } : variant === 'success' ? {
      background: '#1a4a1a',
      borderColor: '#44aa44',
      color: '#88ff88',
    } : variant === 'danger' ? {
      background: '#3a0a0a',
      borderColor: '#880000',
      color: '#ff6666',
    } : {
      background: '#1a1030',
      borderColor: '#2a1a4a',
      color: '#9080b0',
    }),
  }),
  sep: {
    width: '1px',
    height: '24px',
    background: '#2a1a4a',
    margin: '0 4px',
  },
  coords: {
    marginLeft: 'auto',
    color: '#4a3870',
    fontSize: '11px',
    fontFamily: 'monospace',
  },
  count: {
    color: '#6a50a0',
    fontSize: '12px',
    fontFamily: 'monospace',
  },
  jsonModal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    fontFamily: 'monospace',
  },
  jsonBox: {
    background: '#0f0a20',
    border: '2px solid #5a1a8a',
    borderRadius: '12px',
    padding: '24px',
    width: '680px',
    maxWidth: '92vw',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  jsonTitle: {
    color: '#cc88ff',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  jsonArea: {
    flex: 1,
    minHeight: '300px',
    background: '#080414',
    border: '1px solid #2a1a4a',
    borderRadius: '6px',
    color: '#88ff88',
    padding: '12px',
    fontSize: '12px',
    fontFamily: 'monospace',
    resize: 'vertical',
    outline: 'none',
  },
  btnRow: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
}

export default function WBToolbar() {
  const exportJSON   = useWBStore(st => st.exportJSON)
  const tiles        = useWBStore(st => st.tiles)
  const importJSON   = useWBStore(st => st.importJSON)
  const objects      = useWBStore(st => st.objects)
  const clearAll     = useWBStore(st => st.clearAll)

  const [modal, setModal] = useState(null) // null | 'export' | 'import'
  const [importText, setImportText] = useState('')
  const [exportText, setExportText] = useState('')
  const [copied, setCopied] = useState(false)
  const fileRef = useRef()

  function handleExport() {
    const json = exportJSON()
    setExportText(json)
    setModal('export')
  }

  function handleDownload() {
    const json = exportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `world-layout-${Date.now()}.json`
    a.click()
  }

  function handleCopy() {
    navigator.clipboard.writeText(exportText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  function handleImportConfirm() {
    importJSON(importText)
    setModal(null)
    setImportText('')
  }

  function handleFileImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      importJSON(ev.target.result)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <>
      <div style={s.bar}>
        <span style={{ color: '#cc88ff', fontSize: '14px', fontFamily: 'monospace', fontWeight: 'bold', marginRight: '4px' }}>
          🗺️ World Builder
        </span>
        <div style={s.sep} />

        <button style={s.btn('success')} onClick={handleExport}>
          📤 Export JSON
        </button>
        <button style={s.btn('success')} onClick={handleDownload}>
          ⬇ Download
        </button>
        <button style={s.btn()} onClick={() => setModal('import')}>
          📥 Import JSON
        </button>
        <button style={s.btn()} onClick={() => fileRef.current?.click()}>
          📂 Load File
        </button>
        <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileImport} />

        <div style={s.sep} />
        <span style={s.count}>{objects.length} objects | {Object.keys(useWBStore(s => s.tiles)).length} tiles</span>

        <div style={s.sep} />
        <div style={{ color: '#4a3870', fontSize: '11px', fontFamily: 'monospace' }}>
          Right-drag: pan &nbsp;|&nbsp; Scroll: zoom &nbsp;|&nbsp; Middle: orbit &nbsp;|&nbsp; Place mode: click grid
        </div>
      </div>

      {/* Export modal */}
      {modal === 'export' && (
        <div style={s.jsonModal} onClick={() => setModal(null)}>
          <div style={s.jsonBox} onClick={e => e.stopPropagation()}>
            <div style={s.jsonTitle}>📤 Export — send this JSON back to Claude</div>
            <textarea
              style={s.jsonArea}
              value={exportText}
              readOnly
              onClick={e => e.target.select()}
            />
            <div style={s.btnRow}>
              <button style={s.btn('success')} onClick={handleCopy}>
                {copied ? '✅ Copied!' : '📋 Copy All'}
              </button>
              <button style={s.btn('success')} onClick={handleDownload}>⬇ Download</button>
              <button style={s.btn()} onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {modal === 'import' && (
        <div style={s.jsonModal} onClick={() => setModal(null)}>
          <div style={s.jsonBox} onClick={e => e.stopPropagation()}>
            <div style={s.jsonTitle}>📥 Import JSON</div>
            <textarea
              style={{ ...s.jsonArea, color: '#d0c0f0' }}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder={'Paste your world JSON here...\n\n{"objects": [...]}'}
            />
            <div style={s.btnRow}>
              <button style={s.btn('primary')} onClick={handleImportConfirm}>Load</button>
              <button style={s.btn()} onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}