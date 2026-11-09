import { useEffect } from 'react'

// Custom hook: Ctrl/Cmd + K focuses search; Escape closes the details panel.
export function useKeyboardShortcuts({ onSearch, onEscape }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase()
      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault()
        onSearch?.()
      }
      if (key === 'escape') onEscape?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSearch, onEscape])
}