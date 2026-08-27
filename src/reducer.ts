import { SheetState, SheetAction, ColumnConfig, CompletedOrder } from './types'
import { generateId, createDefaultRow, rowTotal } from './storage'

export function sheetReducer(state: SheetState, action: SheetAction): SheetState {
  const now = Date.now()

  switch (action.type) {
    case 'LOAD':
      return action.state

    case 'SET_CUSTOMER_NAME':
      return { ...state, customerName: action.customerName, updatedAt: now }

    case 'APPLY_SETUP': {
      const newCols: ColumnConfig[] = action.columns
      const numCols = newCols.length
      const rows = state.rows.map((row) => {
        const values = Array(numCols)
          .fill(0)
          .map((_, i) => row.values[i] ?? 0)
        return { ...row, values }
      })
      return { ...state, customerName: action.customerName, columns: newCols, rows, updatedAt: now }
    }

    case 'INCREMENT': {
      const rowIndex = state.rows.findIndex((r) => r.id === action.rowId)
      if (rowIndex < 0) return state

      // Sequential rule: Row 0 is always allowed; Row N requires Row N-1 in that column to be > 0
      if (rowIndex > 0) {
        const prevRowVal = state.rows[rowIndex - 1]?.values[action.colIndex] ?? 0
        if (prevRowVal === 0) return state // Ignore increment if previous row in column is 0
      }

      const rows = state.rows.map((row, idx) => {
        if (idx !== rowIndex) return row
        const values = [...row.values]
        values[action.colIndex] = (values[action.colIndex] ?? 0) + 1
        return { ...row, values }
      })
      return { ...state, rows, updatedAt: now }
    }

    case 'DECREMENT': {
      const rows = state.rows.map((row) => {
        if (row.id !== action.rowId) return row
        const values = [...row.values]
        values[action.colIndex] = Math.max(0, (values[action.colIndex] ?? 0) - 1)
        return { ...row, values }
      })
      return { ...state, rows, updatedAt: now }
    }

    case 'ADD_ROW': {
      return {
        ...state,
        rows: [...state.rows, createDefaultRow(state.columns.length)],
        updatedAt: now,
      }
    }

    case 'COMPLETE_ORDER': {
      // Calculate order total
      const orderTotal = state.rows.reduce(
        (sum, row) => sum + rowTotal(row.values, state.columns),
        0,
      )

      // Only archive if there is non-zero order data or explicit customer
      const completedRecord: CompletedOrder = {
        id: generateId(),
        customerName: state.customerName.trim() || `Customer #${state.history.length + 1}`,
        columns: [...state.columns],
        rows: state.rows.map((r) => ({ ...r, values: [...r.values] })),
        totalAmount: orderTotal,
        completedAt: now,
      }

      const nextCustomerIndex = state.history.length + 2
      const freshRows = Array.from({ length: 50 }, () => createDefaultRow(state.columns.length))

      return {
        ...state,
        id: generateId(),
        customerName: '',
        rows: freshRows,
        history: [completedRecord, ...state.history],
        updatedAt: now,
      }
    }

    case 'DELETE_HISTORY_ITEM': {
      return {
        ...state,
        history: state.history.filter((item) => item.id !== action.orderId),
        updatedAt: now,
      }
    }

    case 'CLEAR_HISTORY': {
      return {
        ...state,
        history: [],
        updatedAt: now,
      }
    }

    default:
      return state
  }
}
