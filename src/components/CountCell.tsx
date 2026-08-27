import { useState } from 'react'
import { useLongPress } from '../hooks/useLongPress'

interface CountCellProps {
  value: number
  disabled?: boolean
  onIncrement: () => void
  onDecrement: () => void
}

export function CountCell({ value, disabled = false, onIncrement, onDecrement }: CountCellProps) {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)

  const handleTap = () => {
    if (disabled) return
    onIncrement()
    setFlash('up')
    setTimeout(() => setFlash(null), 300)
  }

  const handleLongPress = () => {
    if (disabled) return
    onDecrement()
    setFlash('down')
    setTimeout(() => setFlash(null), 300)
  }

  const pressHandlers = useLongPress({ onTap: handleTap, onLongPress: handleLongPress })

  return (
    <div
      className={`count-cell ${flash === 'up' ? 'flash-up' : ''} ${flash === 'down' ? 'flash-down' : ''} ${value > 0 ? 'has-value' : ''} ${disabled ? 'is-disabled' : ''}`}
      {...pressHandlers}
      role="button"
      aria-disabled={disabled}
      aria-label={`${value} siomai pieces.`}
    >
      {value > 0 ? (
        <div className="count-with-unit">
          <span className="count-value">{value}</span>
          <span className="count-unit">pcs</span>
        </div>
      ) : (
        <span className="count-value"><span className="count-empty">{disabled ? '' : '—'}</span></span>
      )}
    </div>
  )
}
