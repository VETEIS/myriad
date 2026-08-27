import { useReducer, useEffect, useCallback, useState } from 'react'
import { sheetReducer } from '../reducer'
import { loadFromStorage, saveToStorage, createDefaultSheet, cellTotal, rowTotal, getTodayDateString } from '../storage'
import { CountCell } from '../components/CountCell'
import { EditableTitle } from '../components/EditableTitle'
import { CompletedOrder } from '../types'

const SAVE_DEBOUNCE_MS = 600
const fmt = (n: number) => `₱${n.toLocaleString()}`
const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

interface Props {
  onOpenSetup: () => void
}

export function OrderSheet({ onOpenSetup }: Props) {
  const [state, dispatch] = useReducer(sheetReducer, null, () => {
    return loadFromStorage() ?? createDefaultSheet()
  })

  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<CompletedOrder | null>(null)

  useEffect(() => {
    const t = setTimeout(() => saveToStorage(state), SAVE_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [state])

  const addRow = useCallback(() => dispatch({ type: 'ADD_ROW' }), [])

  const handleCompleteOrder = () => {
    dispatch({ type: 'COMPLETE_ORDER' })
  }

  const { columns, rows, history, customerName } = state

  // Total amount for CURRENT customer ticket
  const colTotals = columns.map((col, ci) =>
    rows.reduce((sum, row) => sum + cellTotal(row.values[ci] ?? 0, col), 0),
  )
  const currentTicketTotal = colTotals.reduce((a, b) => a + b, 0)

  // Overall today's total revenue across all settled orders
  const todayTotalRevenue = history.reduce((sum, item) => sum + item.totalAmount, 0)

  return (
    <div className="sheet-wrapper">
      {/* App Header */}
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
            <div className="customer-input-wrap">
              <EditableTitle
                value={customerName}
                onChange={(name) => dispatch({ type: 'SET_CUSTOMER_NAME', customerName: name })}
                placeholder="Order for... (e.g. John)"
                className="sheet-name"
              />
              <span className="sheet-date-subtitle">{getTodayDateString()}</span>
            </div>
            {currentTicketTotal > 0 && (
              <span className="sheet-total-badge">{fmt(currentTicketTotal)}</span>
            )}
          </div>
        </div>

        <div className="header-actions">
          {/* History log drawer button */}
          <button
            className="btn-icon btn-history"
            onClick={() => setShowHistoryModal(true)}
            title="History Log"
            aria-label="History Log"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="9" />
            </svg>
            {history.length > 0 && <span className="history-badge">{history.length}</span>}
          </button>

          {/* Settings / Menu Manager */}
          <button className="btn-icon" onClick={onOpenSetup} aria-label="Menu & Pricing Setup" title="Menu & Pricing Setup">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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

      {/* Sheet Grid Container */}
      <div className="sheet-container">
        <div className="rows-container">
          {rows.map((row, idx) => {
            const total = rowTotal(row.values, columns)
            return (
              <div key={row.id} className="grid-row data-row" style={{ gridTemplateColumns: `44px repeat(${columns.length}, 1fr) 76px` }}>
                <div className="row-number-cell">{idx + 1}</div>
                {columns.map((col, ci) => {
                  const isDisabled = idx > 0 && (rows[idx - 1]?.values[ci] ?? 0) === 0
                  return (
                    <CountCell
                      key={col.id}
                      value={row.values[ci] ?? 0}
                      disabled={isDisabled}
                      onIncrement={() => dispatch({ type: 'INCREMENT', rowId: row.id, colIndex: ci })}
                      onDecrement={() => dispatch({ type: 'DECREMENT', rowId: row.id, colIndex: ci })}
                    />
                  )
                })}
                <div className={`row-total-cell ${total > 0 ? 'has-total' : ''}`}>
                  {total > 0 ? fmt(total) : '—'}
                </div>
              </div>
            )
          })}
        </div>

        {/* Current Customer Summary Row */}
        <div className="grid-row summary-row" style={{ gridTemplateColumns: `44px repeat(${columns.length}, 1fr) 76px` }}>
          <div className="summary-num">Σ</div>
          {colTotals.map((total, ci) => (
            <div className="summary-col-cell" key={ci}>
              {total > 0 ? fmt(total) : '—'}
            </div>
          ))}
          <div className="summary-grand">{currentTicketTotal > 0 ? fmt(currentTicketTotal) : '—'}</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="sheet-action-bar">
        <button className="complete-order-btn" onClick={handleCompleteOrder}>
          Settle Order {currentTicketTotal > 0 ? `(${fmt(currentTicketTotal)})` : ''}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>

      <p className="hint-text">Tap = +1 siomai · Long-press = remove · Cells unlock sequentially</p>

      {/* HISTORY MODAL */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="history-modal-header">
              <div>
                <h2 className="modal-title">Completed Orders</h2>
                <p className="history-revenue-subtitle">
                  Total Sales: <strong className="revenue-highlight">{fmt(todayTotalRevenue)}</strong> ({history.length} settled orders)
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowHistoryModal(false)}>✕</button>
            </div>

            <div className="history-list">
              {history.length === 0 ? (
                <div className="history-empty">
                  <p>No settled orders yet today.</p>
                  <span className="history-empty-hint">Settle customer orders to log them here.</span>
                </div>
              ) : (
                history.map((order) => (
                  <div
                    key={order.id}
                    className="history-item-card"
                    onClick={() => setSelectedHistoryOrder(order)}
                  >
                    <div className="history-item-left">
                      <span className="history-customer-name">{order.customerName}</span>
                      <span className="history-time">{fmtTime(order.completedAt)}</span>
                    </div>
                    <div className="history-item-right">
                      <span className="history-amount">{fmt(order.totalAmount)}</span>
                      <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <div className="history-modal-footer">
                <button
                  className="btn btn-ghost text-danger"
                  onClick={() => {
                    if (window.confirm('Clear all completed orders log for today?')) {
                      dispatch({ type: 'CLEAR_HISTORY' })
                    }
                  }}
                >
                  Clear History Log
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SELECTED HISTORY ITEM RECEIPT MODAL */}
      {selectedHistoryOrder && (
        <div className="modal-overlay" onClick={() => setSelectedHistoryOrder(null)}>
          <div className="modal receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-header">
              <h2 className="modal-title">{selectedHistoryOrder.customerName}</h2>
              <span className="receipt-time">{fmtTime(selectedHistoryOrder.completedAt)}</span>
            </div>

            <div className="receipt-body">
              <div className="receipt-table-header">
                <span>Row</span>
                {selectedHistoryOrder.columns.map((c) => (
                  <span key={c.id}>{c.name}</span>
                ))}
                <span>Total</span>
              </div>
              {selectedHistoryOrder.rows.map((row, i) => {
                const rTotal = rowTotal(row.values, selectedHistoryOrder.columns)
                if (rTotal === 0 && row.values.every((v) => v === 0)) return null
                return (
                  <div key={row.id} className="receipt-row">
                    <span className="receipt-row-num">{i + 1}</span>
                    {selectedHistoryOrder.columns.map((col, ci) => (
                      <span key={col.id} className="receipt-val">
                        {row.values[ci] > 0 ? `${row.values[ci]} pcs` : '—'}
                      </span>
                    ))}
                    <span className="receipt-total">{fmt(rTotal)}</span>
                  </div>
                )
              })}
            </div>

            <div className="receipt-total-bar">
              <span>Total Paid:</span>
              <strong className="receipt-total-amount">{fmt(selectedHistoryOrder.totalAmount)}</strong>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-ghost text-danger"
                onClick={() => {
                  if (window.confirm('Delete this order entry?')) {
                    dispatch({ type: 'DELETE_HISTORY_ITEM', orderId: selectedHistoryOrder.id })
                    setSelectedHistoryOrder(null)
                  }
                }}
              >
                Delete Entry
              </button>
              <button className="btn btn-ghost" onClick={() => setSelectedHistoryOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
