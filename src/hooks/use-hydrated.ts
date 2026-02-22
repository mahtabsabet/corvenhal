import { useState, useEffect } from 'react'

// Returns true after the first client render, preventing SSR/hydration mismatches
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Use requestAnimationFrame to ensure we're after paint
    requestAnimationFrame(() => {
      setHydrated(true)
    })
  }, [])

  return hydrated
}
