import { SheetState, ColumnConfig, CellRow, CompletedOrder } from './types'

const STORAGE_KEY = 'myriad-order-tracker-v3'
const MENU_PRESET_KEY = 'myriad-menu-preset-v1'

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
  return new Date().toLocaleDateString('en-US', options)
}

export function loadSavedMenuColumns(): ColumnConfig[] {
  try {
    const raw = localStorage.getItem(MENU_PRESET_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ColumnConfig[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  return [
    createDefaultColumn('', 0, 0),
    createDefaultColumn('', 0, 0),
  ]
}

export function saveSavedMenuColumns(columns: ColumnConfig[]): void {
  try {
    localStorage.setItem(MENU_PRESET_KEY, JSON.stringify(columns))
  } catch {
    // ignore
  }
}

export function createDefaultSheet(): SheetState {
  const columns = loadSavedMenuColumns()
  return {
    id: generateId(),
    customerName: '',
    columns,
    rows: Array.from({ length: 50 }, () => createDefaultRow(columns.length)),
    history: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

// Compute total for one cell
// count = 0: inactive (₱0)
// count = 1: plain fried rice with 0 siomai pcs (basePrice)
// count >= 2: fried rice with (count - 1) siomai pcs (basePrice + (count - 1) * pricePerCount)
export function cellTotal(count: number, col: ColumnConfig): number {
  if (count <= 0) return 0
  const siomaiPcs = count - 1
  return col.basePrice + siomaiPcs * col.pricePerCount
}

// Compute capital cost for one cell
export function cellCost(count: number, col: ColumnConfig): number {
  if (count <= 0) return 0
  const siomaiPcs = count - 1
  const riceCost = col.riceCost ?? 0
  const siomaiCost = col.siomaiCostPerPc ?? 0
  return riceCost + siomaiPcs * siomaiCost
}

// Compute total revenue for one row
export function rowTotal(values: number[], columns: ColumnConfig[]): number {
  return values.reduce((sum, count, i) => sum + cellTotal(count, columns[i] ?? { basePrice: 0, pricePerCount: 0 }), 0)
}

// Compute total capital cost for one row
export function rowCost(values: number[], columns: ColumnConfig[]): number {
  return values.reduce((sum, count, i) => sum + cellCost(count, columns[i] ?? { basePrice: 0, pricePerCount: 0 }), 0)
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
    if (!Array.isArray(parsed.history)) parsed.history = []
    if (!parsed.customerName) parsed.customerName = ''
    return parsed
  } catch {
    return null
  }
}
