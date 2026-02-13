import { useEffect, useRef } from 'react'

interface LiveRegionProps {
  message: string
  politeness?: 'polite' | 'assertive' | 'off'
  clearOnUnmount?: boolean
}

const LiveRegion = ({ message, politeness = 'polite', clearOnUnmount = true }: LiveRegionProps) => {
  const regionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentRef = regionRef.current
    if (currentRef) {
      currentRef.textContent = message
    }

    return () => {
      if (clearOnUnmount && currentRef) {
        currentRef.textContent = ''
      }
    }
  }, [message, clearOnUnmount])

  return (
    <div
      ref={regionRef}
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    />
  )
}

export { LiveRegion }
