import { useState, useRef } from 'react'
import { ColumnConfig } from '../types'
import { generateId, getTodayDateString, loadSavedMenuColumns, validateAndParseMenuColumns } from '../storage'

interface SetupScreenProps {
  initialColumns: ColumnConfig[]
  initialName: string
  onSave: (name: string, columns: ColumnConfig[]) => void
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="price-field">
      <label className="price-label">{label}</label>
      <div className="price-input-wrap">
        <span className="currency-sign">₱</span>
        <input
          className="price-input"
          type="number"
          inputMode="decimal"
          min="0"
          step="1"
          value={value === 0 ? '' : value}
          placeholder="0"
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
      </div>
    </div>
  )
}

export function SetupScreen({ initialColumns, initialName, onSave }: SetupScreenProps) {
  const [name, setName] = useState(initialName)
  const [cols, setCols] = useState<ColumnConfig[]>(
    initialColumns.length > 0 ? initialColumns : loadSavedMenuColumns(),
  )
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateCol = (id: string, field: keyof Omit<ColumnConfig, 'id'>, value: string | number) => {
    setCols((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const addVariant = () => {
    setCols((prev) => [
      ...prev,
      { id: generateId(), name: `Variant ${prev.length + 1}`, basePrice: 0, pricePerCount: 0 },
    ])
  }

  const removeVariant = (id: string) => {
    if (cols.length <= 1) {
      alert('You must have at least one variant.')
      return
    }
    setCols((prev) => prev.filter((c) => c.id !== id))
  }

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(cols, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `myriad-menu-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setNoticeMessage('✓ Menu list exported successfully!')
      setTimeout(() => setNoticeMessage(null), 3000)
    } catch {
      alert('Failed to export menu list.')
    }
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content === 'string') {
        const parsed = validateAndParseMenuColumns(content)
        if (parsed && parsed.length > 0) {
          setCols(parsed)
          setNoticeMessage(`✓ Successfully imported ${parsed.length} menu variants!`)
          setTimeout(() => setNoticeMessage(null), 3500)
        } else {
          alert('Invalid menu JSON file format. Please choose a valid exported menu file.')
        }
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handlePasteJson = () => {
    const input = window.prompt('Paste your exported menu JSON here:')
    if (!input || !input.trim()) return
    const parsed = validateAndParseMenuColumns(input)
    if (parsed && parsed.length > 0) {
      setCols(parsed)
      setNoticeMessage(`✓ Successfully imported ${parsed.length} menu variants!`)
      setTimeout(() => setNoticeMessage(null), 3500)
    } else {
      alert('Invalid menu JSON format. Please paste valid JSON data.')
    }
  }

  const handleSave = () => {
    const cleaned = cols.map((c) => ({
      ...c,
      name: c.name.trim() || 'Untitled',
    }))
    onSave(name.trim(), cleaned)
  }

  const handleNuke = () => {
    if (window.confirm('This will permanently delete all saved data. Continue?')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="setup-screen">
      {/* Top bar */}
      <div className="setup-topbar">
        <div className="setup-logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor" opacity="0.9" />
            <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor" opacity="0.5" />
            <rect x="2" y="13" width="9" height="9" rx="2" fill="currentColor" opacity="0.5" />
            <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" opacity="0.2" />
          </svg>
        </div>
        <div>
          <h1 className="setup-title">Settings</h1>
          <p className="setup-subtitle">Configure your menu variants and pricing</p>
        </div>
      </div>

      <div className="setup-body">

        {noticeMessage && (
          <div className="setup-notice-banner">
            {noticeMessage}
          </div>
        )}

        {/* Column cards */}
        <div className="setup-section">
          <label className="setup-section-label">Menu Variants ({cols.length})</label>
          <div className="setup-cols">
            {cols.map((col, i) => (
              <div className="setup-col-card" key={col.id}>
                <div className="setup-col-header">
                  <span className="setup-col-badge">Variant {i + 1}</span>
                  {cols.length > 1 && (
                    <button
                      className="setup-col-delete-btn"
                      onClick={() => removeVariant(col.id)}
                      title="Remove variant"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="setup-field">
                  <label className="setup-field-label">Variant Name</label>
                  <input
                    className="setup-text-input"
                    value={col.name}
                    placeholder={i === 0 ? 'e.g. Spicy' : i === 1 ? 'e.g. Regular' : 'e.g. Special'}
                    onChange={(e) => updateCol(col.id, 'name', e.target.value)}
                  />
                </div>

                <div className="setup-prices">
                  <PriceInput
                    label="Rice Capital"
                    value={col.riceCost ?? 0}
                    onChange={(v) => updateCol(col.id, 'riceCost', v)}
                  />
                  <PriceInput
                    label="Rice Price"
                    value={col.basePrice}
                    onChange={(v) => updateCol(col.id, 'basePrice', v)}
                  />
                </div>

                <div className="setup-prices" style={{ marginTop: '10px' }}>
                  <PriceInput
                    label="Siomai Capital / pc"
                    value={col.siomaiCostPerPc ?? 0}
                    onChange={(v) => updateCol(col.id, 'siomaiCostPerPc', v)}
                  />
                  <PriceInput
                    label="Siomai Price / pc"
                    value={col.pricePerCount}
                    onChange={(v) => updateCol(col.id, 'pricePerCount', v)}
                  />
                </div>

                <p className="setup-formula-hint">
                  {col.basePrice > 0 || col.pricePerCount > 0
                    ? `Combo: 3 pcs + rice = ₱${col.basePrice + 3 * col.pricePerCount} · Solo: 4 pcs = ₱${4 * col.pricePerCount}`
                    : 'Set prices & costs above to preview pricing'}
                </p>
              </div>
            ))}
          </div>

          <button className="add-variant-btn" onClick={addVariant}>
            + Add Variant
          </button>
        </div>

        {/* Backup & Import Section */}
        <div className="setup-section backup-section">
          <label className="setup-section-label">📦 Menu Backup & Presets</label>
          <div className="backup-card">
            <div className="backup-card-info">
              <span className="backup-title">Save / Export Menu</span>
              <span className="backup-desc">Download current variants as a JSON backup</span>
            </div>
            <button type="button" className="btn-backup export-btn" onClick={handleExport}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export JSON
            </button>
          </div>

          <div className="backup-card" style={{ marginTop: '10px' }}>
            <div className="backup-card-info">
              <span className="backup-title">Import Menu</span>
              <span className="backup-desc">Load variants from file or paste JSON</span>
            </div>
            <div className="backup-btn-group">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleFileImport}
              />
              <button type="button" className="btn-backup import-btn" onClick={() => fileInputRef.current?.click()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Import File
              </button>
              <button type="button" className="btn-backup-ghost" onClick={handlePasteJson}>
                Paste
              </button>
            </div>
          </div>
        </div>

        {/* Developer Tools */}
        <div className="setup-section dev-section">
          <label className="setup-section-label">🛠 Developer</label>
          <div className="dev-card">
            <div className="dev-info">
              <span className="dev-title">Nuke Storage</span>
              <span className="dev-desc">Clear all saved data and restart from scratch</span>
            </div>
            <button className="dev-nuke-btn" onClick={handleNuke}>
              Nuke
            </button>
          </div>
        </div>
      </div>

      <div className="setup-footer">
        <button className="setup-save-btn" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  )
}
