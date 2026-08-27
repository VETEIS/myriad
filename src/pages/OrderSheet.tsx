import { useReducer, useEffect, useCallback, useState } from 'react'
import { sheetReducer } from '../reducer'
import { loadFromStorage, saveToStorage, createDefaultSheet } from '../storage'
import { SheetState } from '../types'
import { EditableTitle } from '../components/EditableTitle'
import { CountCell } from '../components/CountCell'

const SAVE_DEBOUNCE_MS = 600

export function OrderSheet() {
  const [state, dispatch] = useReducer(sheetReducer, null, () => {
    return loadFromStorage() ?? createDefaultSheet()
  })

  const [showReset, setShowReset] = useState(false)

  // debounced auto-save
  useEffect(() => {
    const t = setTimeout(() => saveToStorage(state), SAVE_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [state])

  const addRow = useCallback(() => dispatch({ type: 'ADD_ROW' }), [])

  const handleReset = () => {
    dispatch({ type: 'RESET_ALL' })
    setShowReset(false)
  }

  const columnSums: [number, number] = state.rows.reduce(
    (acc, row) => [acc[0] + row.values[0], acc[1] + row.values[1]],
    [0, 0] as [number, number],
  )

  return (
    <div className="sheet-wrapper">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor" opacity="0.9"/>
              <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor" opacity="0.5"/>
              <rect x="2" y="13" width="9" height="9" rx="2" fill="currentColor" opacity="0.5"/>
              <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" opacity="0.2"/>
            </svg>
          </div>
          <EditableTitle
            value={state.name}
            onChange={(name) => dispatch({ type: 'RENAME_SHEET', name })}
            placeholder="Sheet Name"
            className="sheet-name"
          />
        </div>
        <div className="header-actions">
          <button
            className="btn-icon btn-danger"
            onClick={() => setShowReset(true)}
            title="Reset all counts"
            aria-label="Reset all counts"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Sheet grid */}
      <div className="sheet-container">
        {/* Column title row */}
        <div className="grid-row title-row">
          <div className="row-number-cell" aria-hidden="true">#</div>
          <div className="title-cell">
            <EditableTitle
              value={state.columns[0]}
              onChange={(v) => dispatch({ type: 'SET_COLUMN_TITLE', col: 0, value: v })}
              placeholder="Column A"
            />
          </div>
          <div className="title-cell">
            <EditableTitle
              value={state.columns[1]}
              onChange={(v) => dispatch({ type: 'SET_COLUMN_TITLE', col: 1, value: v })}
              placeholder="Column B"
            />
          </div>
        </div>

        {/* Data rows */}
        <div className="rows-container">
          {state.rows.map((row, idx) => (
            <div key={row.id} className="grid-row data-row">
              <div className="row-number-cell">{idx + 1}</div>
              <CountCell
                value={row.values[0]}
                onIncrement={() => dispatch({ type: 'INCREMENT', rowId: row.id, col: 0 })}
                onDecrement={() => dispatch({ type: 'DECREMENT', rowId: row.id, col: 0 })}
              />
              <CountCell
                value={row.values[1]}
                onIncrement={() => dispatch({ type: 'INCREMENT', rowId: row.id, col: 1 })}
                onDecrement={() => dispatch({ type: 'DECREMENT', rowId: row.id, col: 1 })}
              />
            </div>
          ))}
        </div>

        {/* Summary row */}
        <div className="grid-row summary-row">
          <div className="row-number-cell summary-label">Σ</div>
          <div className="summary-cell">{columnSums[0]}</div>
          <div className="summary-cell">{columnSums[1]}</div>
        </div>
      </div>

      {/* Add row button */}
      <button className="add-row-btn" onClick={addRow} aria-label="Add row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Row
      </button>

      {/* Hint */}
      <p className="hint-text">Tap to count · Long-press to subtract · Tap title to rename</p>

      {/* Reset confirmation modal */}
      {showReset && (
        <div className="modal-overlay" onClick={() => setShowReset(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Reset all counts?</h2>
            <p className="modal-body">
              This will set every cell back to zero. Column titles and row count are kept.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowReset(false)}>Cancel</button>
              <button className="btn btn-reset" onClick={handleReset}>Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
