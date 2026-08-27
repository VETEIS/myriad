import { SheetState, CellRow } from './types'

const STORAGE_KEY = 'myriad-order-tracker-v1'

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function createDefaultRow(): CellRow {
  return { id: generateId(), values: [0, 0] }
}

export function createDefaultSheet(name = 'New Sheet'): SheetState {
  return {
    id: generateId(),
    name,
    columns: ['Column A', 'Column B'],
    rows: Array.from({ length: 8 }, createDefaultRow),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function saveToStorage(state: SheetState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage full or unavailable — silently fail
  }
}

export function loadFromStorage(): SheetState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SheetState
    // basic validation
    if (!parsed.id || !parsed.columns || !Array.isArray(parsed.rows)) return null
    return parsed
  } catch {
    return null
  }
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY)
}
