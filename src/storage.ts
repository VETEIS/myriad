import { SheetState, ColumnConfig, CellRow } from './types'

const STORAGE_KEY = 'myriad-order-tracker-v2'

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function createDefaultColumn(name: string, basePrice = 0, pricePerCount = 0): ColumnConfig {
  return { id: generateId(), name, basePrice, pricePerCount }
}

export function createDefaultRow(numCols: number): CellRow {
  return { id: generateId(), values: Array(numCols).fill(0) }
}

export function getTodayDateString(): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
  return new Date().toLocaleDateString('en-US', options) // e.g. "Thu, Aug 27, 2026"
}

export function createDefaultSheet(): SheetState {
  const columns = [
    createDefaultColumn('Spicy'),
    createDefaultColumn('Regular'),
  ]
  return {
    id: generateId(),
    name: getTodayDateString(),
    columns,
    rows: Array.from({ length: 8 }, () => createDefaultRow(columns.length)),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

// Compute total for one cell
export function cellTotal(count: number, col: ColumnConfig): number {
  if (count === 0) return 0
  return col.basePrice + count * col.pricePerCount
}

// Compute total for one row
export function rowTotal(values: number[], columns: ColumnConfig[]): number {
  return values.reduce((sum, count, i) => sum + cellTotal(count, columns[i]), 0)
}

export function saveToStorage(state: SheetState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage full or unavailable
  }
}

export function loadFromStorage(): SheetState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SheetState
    if (!parsed.id || !Array.isArray(parsed.columns) || !Array.isArray(parsed.rows)) return null
    return parsed
  } catch {
    return null
  }
}
