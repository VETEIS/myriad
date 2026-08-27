// Types for the order tracker
export interface SheetState {
  id: string
  name: string
  columns: [string, string]
  rows: CellRow[]
  createdAt: number
  updatedAt: number
}

export interface CellRow {
  id: string
  values: [number, number]
}

export type SheetAction =
  | { type: 'SET_COLUMN_TITLE'; col: 0 | 1; value: string }
  | { type: 'INCREMENT'; rowId: string; col: 0 | 1 }
  | { type: 'DECREMENT'; rowId: string; col: 0 | 1 }
  | { type: 'ADD_ROW' }
  | { type: 'DELETE_ROW'; rowId: string }
  | { type: 'RESET_ALL' }
  | { type: 'RENAME_SHEET'; name: string }
  | { type: 'LOAD'; state: SheetState }
