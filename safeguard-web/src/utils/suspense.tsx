import React from 'react'

// Optional helper wrapper to reduce Suspense boilerplate
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withSuspense<T extends React.ComponentType<any>>(Comp: T, fallback: React.ReactNode = null) {
  return function Suspended(props: React.ComponentProps<T>) {
    return (
      <React.Suspense fallback={fallback}>
        <Comp {...props} />
      </React.Suspense>
    )
  }
}