import { useState } from 'react'
import { useLongPress } from '../hooks/useLongPress'

interface CountCellProps {
  value: number
  onIncrement: () => void
  onDecrement: () => void
}

export function CountCell({ value, onIncrement, onDecrement }: CountCellProps) {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)

  const handleTap = () => {
    onIncrement()
    setFlash('up')
    setTimeout(() => setFlash(null), 300)
  }

  const handleLongPress = () => {
    onDecrement()
    setFlash('down')
    setTimeout(() => setFlash(null), 300)
  }

  const pressHandlers = useLongPress({ onTap: handleTap, onLongPress: handleLongPress })

  return (
    <div
      className={`count-cell ${flash === 'up' ? 'flash-up' : ''} ${flash === 'down' ? 'flash-down' : ''} ${value > 0 ? 'has-value' : ''}`}
      {...pressHandlers}
      role="button"
      aria-label={`${value} siomai pieces. Tap to add, long-press to subtract.`}
    >
      {value > 0 ? (
        <div className="count-with-unit">
          <span className="count-value">{value}</span>
          <span className="count-unit">pcs</span>
        </div>
      ) : (
        <span className="count-value"><span className="count-empty">—</span></span>
      )}
    </div>
  )
}
