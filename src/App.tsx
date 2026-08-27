import { useState } from 'react'
import { OrderSheet } from './pages/OrderSheet'
import { SetupScreen } from './components/SetupScreen'
import { loadFromStorage, saveToStorage, createDefaultSheet, getTodayDateString, saveSavedMenuColumns } from './storage'
import { ColumnConfig } from './types'

type Screen = 'setup' | 'sheet'

export default function App() {
  const existing = loadFromStorage()
  const [screen, setScreen] = useState<Screen>(existing ? 'sheet' : 'setup')

  const handleSaveSetup = (name: string, columns: ColumnConfig[]) => {
    saveSavedMenuColumns(columns)
    const current = loadFromStorage() ?? createDefaultSheet()
    const numCols = columns.length
    const rows = current.rows.map((row) => ({
      ...row,
      values: Array(numCols).fill(0).map((_, i) => row.values[i] ?? 0),
    }))
    saveToStorage({ ...current, customerName: name, columns, rows, updatedAt: Date.now() })
    setScreen('sheet')
  }

  if (screen === 'setup') {
    const saved = loadFromStorage()
    return (
      <SetupScreen
        initialName={saved?.customerName ?? ''}
        initialColumns={saved?.columns ?? []}
        onSave={handleSaveSetup}
      />
    )
  }

  return <OrderSheet onOpenSetup={() => setScreen('setup')} />
}
