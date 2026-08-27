import { SheetState, SheetAction, CellRow } from './types'
import { generateId, createDefaultRow } from './storage'

export function sheetReducer(state: SheetState, action: SheetAction): SheetState {
  const now = Date.now()
  switch (action.type) {
    case 'LOAD':
      return action.state

    case 'RENAME_SHEET':
      return { ...state, name: action.name, updatedAt: now }

    case 'SET_COLUMN_TITLE': {
      const columns = [...state.columns] as [string, string]
      columns[action.col] = action.value
      return { ...state, columns, updatedAt: now }
    }

    case 'INCREMENT': {
      const rows = state.rows.map((row) => {
        if (row.id !== action.rowId) return row
        const values = [...row.values] as [number, number]
        values[action.col] = values[action.col] + 1
        return { ...row, values }
      })
      return { ...state, rows, updatedAt: now }
    }

    case 'DECREMENT': {
      const rows = state.rows.map((row) => {
        if (row.id !== action.rowId) return row
        const values = [...row.values] as [number, number]
        values[action.col] = Math.max(0, values[action.col] - 1)
        return { ...row, values }
      })
      return { ...state, rows, updatedAt: now }
    }

    case 'ADD_ROW': {
      const newRow: CellRow = createDefaultRow()
      return { ...state, rows: [...state.rows, newRow], updatedAt: now }
    }

    case 'DELETE_ROW': {
      const rows = state.rows.filter((r) => r.id !== action.rowId)
      return { ...state, rows, updatedAt: now }
    }

    case 'RESET_ALL': {
      const rows = state.rows.map((row) => ({
        ...row,
        id: generateId(),
        values: [0, 0] as [number, number],
      }))
      return { ...state, rows, updatedAt: now }
    }

    default:
      return state
  }
}
