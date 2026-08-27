import { useRef, useCallback } from 'react'

const LONG_PRESS_MS = 500

interface UseLongPressOptions {
  onTap: () => void
  onLongPress: () => void
}

export function useLongPress({ onTap, onLongPress }: UseLongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longFiredRef = useRef(false)
  const ignoreMouseRef = useRef(false)

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (e.type === 'touchstart') {
        ignoreMouseRef.current = true
      } else if (e.type === 'mousedown' && ignoreMouseRef.current) {
        return
      }

      longFiredRef.current = false
      timerRef.current = setTimeout(() => {
        longFiredRef.current = true
        onLongPress()
        if ('vibrate' in navigator) navigator.vibrate(40)
      }, LONG_PRESS_MS)
    },
    [onLongPress],
  )

  const end = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (e.type === 'mouseup' && ignoreMouseRef.current) {
        ignoreMouseRef.current = false
        return
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (!longFiredRef.current) {
        onTap()
        if ('vibrate' in navigator) navigator.vibrate(10)
      }
    },
    [onTap],
  )

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    longFiredRef.current = true
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
