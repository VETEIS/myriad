export interface ColumnConfig {
  id: string
  name: string
  basePrice: number      // fixed amount when count > 0
  pricePerCount: number  // added for each count tap
}

export interface CellRow {
  id: string
  values: number[] // one per column, index-matched
}

export interface SheetState {
  id: string
  name: string
  columns: ColumnConfig[]
  rows: CellRow[]
  createdAt: number
  updatedAt: number
}

export type SheetAction =
  | { type: 'APPLY_SETUP'; columns: ColumnConfig[]; name: string }
  | { type: 'INCREMENT'; rowId: string; colIndex: number }
  | { type: 'DECREMENT'; rowId: string; colIndex: number }
  | { type: 'ADD_ROW' }
  | { type: 'RESET_ALL' }
  | { type: 'LOAD'; state: SheetState }
