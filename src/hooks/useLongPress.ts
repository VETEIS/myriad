import { useRef, useCallback } from 'react'

const LONG_PRESS_MS = 500

interface UseLongPressOptions {
  onTap: () => void
  onLongPress: () => void
}

export function useLongPress({ onTap, onLongPress }: UseLongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longFiredRef = useRef(false)

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      longFiredRef.current = false
      timerRef.current = setTimeout(() => {
        longFiredRef.current = true
        onLongPress()
        // vibrate if supported
        if ('vibrate' in navigator) navigator.vibrate(40)
      }, LONG_PRESS_MS)
    },
    [onLongPress],
  )

  const end = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (!longFiredRef.current) {
      onTap()
      if ('vibrate' in navigator) navigator.vibrate(10)
    }
  }, [onTap])

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    longFiredRef.current = true // treat as cancelled
  }, [])

  return {
    onTouchStart: start,
    onTouchEnd: end,
    onTouchCancel: cancel,
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: cancel,
  }
}
