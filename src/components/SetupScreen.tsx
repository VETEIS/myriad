import { useState } from 'react'
import { ColumnConfig } from '../types'
import { generateId, getTodayDateString, loadSavedMenuColumns } from '../storage'

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

  const updateCol = (id: string, field: keyof Omit<ColumnConfig, 'id'>, value: string | number) => {
    setCols((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const handleSave = () => {
    const cleaned = cols.map((c) => ({
      ...c,
      name: c.name.trim() || 'Untitled',
    }))
    onSave(name.trim() || getTodayDateString(), cleaned)
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
          <h1 className="setup-title">Sheet Setup</h1>
          <p className="setup-subtitle">Set your menu variants and pricing</p>
        </div>
      </div>

      <div className="setup-body">
        {/* Sheet name */}
        <div className="setup-section">
          <label className="setup-section-label">Sheet Name</label>
          <input
            className="setup-name-input"
            value={name}
            placeholder="e.g. Saturday Orders"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Column cards */}
        <div className="setup-section">
          <label className="setup-section-label">Menu Variants</label>
          <div className="setup-cols">
            {cols.map((col, i) => (
              <div className="setup-col-card" key={col.id}>
                <div className="setup-col-header">
                  <span className="setup-col-badge">Variant {i + 1}</span>
                </div>
                <div className="setup-field">
                  <label className="setup-field-label">Variant Name</label>
                  <input
                    className="setup-text-input"
                    value={col.name}
                    placeholder={i === 0 ? 'e.g. Spicy' : 'e.g. Regular'}
                    onChange={(e) => updateCol(col.id, 'name', e.target.value)}
                  />
                </div>
                <div className="setup-prices">
                  <PriceInput
                    label="Rice Price"
                    value={col.basePrice}
                    onChange={(v) => updateCol(col.id, 'basePrice', v)}
                  />
                  <PriceInput
                    label="Per Siomai"
                    value={col.pricePerCount}
                    onChange={(v) => updateCol(col.id, 'pricePerCount', v)}
                  />
                </div>
                <p className="setup-formula-hint">
                  {col.basePrice > 0 || col.pricePerCount > 0
                    ? `e.g. 3 pcs siomai = ₱${col.basePrice + 3 * col.pricePerCount} total`
                    : 'Set prices above to preview'}
                </p>
              </div>
            ))}
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
          Start Recording
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  )
}
