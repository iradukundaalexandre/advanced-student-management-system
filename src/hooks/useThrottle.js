import { useRef } from 'react'

// Returns a function that can execute at most once per wait interval.
export function useThrottle(callback, wait = 1200) {
  const lastRun = useRef(0)
  return (...args) => {
    const now = Date.now()
    if (now - lastRun.current < wait) return false
    lastRun.current = now
    callback(...args)
    return true
  }
}