import { useReducer, useEffect, useCallback, useState } from 'react'
import { sheetReducer } from '../reducer'
import { loadFromStorage, saveToStorage, createDefaultSheet, cellTotal, rowTotal, getTodayDateString } from '../storage'
import { CountCell } from '../components/CountCell'

const SAVE_DEBOUNCE_MS = 600

const fmt = (n: number) => `₱${n.toLocaleString()}`

interface Props {
  onOpenSetup: () => void
}

export function OrderSheet({ onOpenSetup }: Props) {
  const [state, dispatch] = useReducer(sheetReducer, null, () => {
    return loadFromStorage() ?? createDefaultSheet()
  })

  const [showReset, setShowReset] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => saveToStorage(state), SAVE_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [state])

  const addRow = useCallback(() => dispatch({ type: 'ADD_ROW' }), [])

  const handleReset = () => {
    dispatch({ type: 'RESET_ALL' })
    dispatch({ type: 'RENAME_SHEET', name: getTodayDateString() })
    setShowReset(false)
  }

  const { columns, rows } = state

  // Grand total per column and overall
  const colTotals = columns.map((col, ci) =>
    rows.reduce((sum, row) => sum + cellTotal(row.values[ci] ?? 0, col), 0),
  )
  const grandTotal = colTotals.reduce((a, b) => a + b, 0)

  return (
    <div className="sheet-wrapper">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor" opacity="0.9" />
              <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor" opacity="0.5" />
              <rect x="2" y="13" width="9" height="9" rx="2" fill="currentColor" opacity="0.5" />
              <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
          <div className="header-title-block">
            <span className="sheet-name">{state.name}</span>
            <span className="sheet-total-badge">{fmt(grandTotal)}</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={onOpenSetup} aria-label="Settings" title="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button className="btn-icon btn-danger" onClick={() => setShowReset(true)} aria-label="Reset all counts">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </div>
      </header>

      {/* Column header labels */}
      <div className="col-label-bar">
        <div className="col-label-num" />
        {columns.map((col) => (
          <div className="col-label" key={col.id}>
            <span className="col-label-name">{col.name}</span>
            {(col.basePrice > 0 || col.pricePerCount > 0) && (
              <span className="col-label-price">
                {col.basePrice > 0 ? `Rice ₱${col.basePrice}` : ''}
                {col.basePrice > 0 && col.pricePerCount > 0 ? ' · ' : ''}
                {col.pricePerCount > 0 ? `Siomai ₱${col.pricePerCount}/pc` : ''}
              </span>
            )}
          </div>
        ))}
        <div className="col-label-total">Total</div>
      </div>

      {/* Sheet grid */}
      <div className="sheet-container">
        <div className="rows-container">
          {rows.map((row, idx) => {
            const total = rowTotal(row.values, columns)
            return (
              <div key={row.id} className="grid-row data-row" style={{ gridTemplateColumns: `44px repeat(${columns.length}, 1fr) 76px` }}>
                <div className="row-number-cell">{idx + 1}</div>
                {columns.map((col, ci) => (
                  <CountCell
                    key={col.id}
                    value={row.values[ci] ?? 0}
                    onIncrement={() => dispatch({ type: 'INCREMENT', rowId: row.id, colIndex: ci })}
                    onDecrement={() => dispatch({ type: 'DECREMENT', rowId: row.id, colIndex: ci })}
                  />
                ))}
                <div className={`row-total-cell ${total > 0 ? 'has-total' : ''}`}>
                  {total > 0 ? fmt(total) : '—'}
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary row */}
        <div className="grid-row summary-row" style={{ gridTemplateColumns: `44px repeat(${columns.length}, 1fr) 76px` }}>
          <div className="summary-num">Σ</div>
          {colTotals.map((total, ci) => (
            <div className="summary-col-cell" key={ci}>
              {total > 0 ? fmt(total) : '—'}
            </div>
          ))}
          <div className="summary-grand">{grandTotal > 0 ? fmt(grandTotal) : '—'}</div>
        </div>
      </div>

      {/* Add row */}
      <button className="add-row-btn" onClick={addRow} aria-label="Add row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Row
      </button>

      <p className="hint-text">Tap = +1 siomai · Long-press = remove · Each row is one order</p>

      {/* Reset modal */}
      {showReset && (
        <div className="modal-overlay" onClick={() => setShowReset(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Start New Day?</h2>
            <p className="modal-body">
              This resets all row counts to 0 and updates the date. Your menu variants and prices stay saved.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowReset(false)}>Cancel</button>
              <button className="btn btn-reset" onClick={handleReset}>Start New Day</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
