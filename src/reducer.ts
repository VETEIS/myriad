import { SheetState, SheetAction, ColumnConfig } from './types'
import { generateId, createDefaultRow } from './storage'

export function sheetReducer(state: SheetState, action: SheetAction): SheetState {
  const now = Date.now()

  switch (action.type) {
    case 'LOAD':
      return action.state

    case 'APPLY_SETUP': {
      // Update column configs; pad/trim row values to match new column count
      const newCols: ColumnConfig[] = action.columns
      const numCols = newCols.length
      const rows = state.rows.map((row) => {
        const values = Array(numCols)
          .fill(0)
          .map((_, i) => row.values[i] ?? 0)
        return { ...row, values }
      })
      return { ...state, name: action.name, columns: newCols, rows, updatedAt: now }
    }

    case 'INCREMENT': {
      const rows = state.rows.map((row) => {
        if (row.id !== action.rowId) return row
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

    case 'RESET_ALL': {
      const rows = state.rows.map((row) => ({
        ...row,
        id: generateId(),
        values: Array(state.columns.length).fill(0),
      }))
      return { ...state, rows, updatedAt: now }
    }

    default:
      return state
  }
}
