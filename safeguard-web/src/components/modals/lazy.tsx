import React from 'react'

// Lazy-loaded modal components to enable code-splitting without breaking current sync exports
// Usage example:
// const DepositModal = React.useMemo(() => DepositModalLazy, [])
// <Suspense fallback={null}><DepositModal {...props} /></Suspense>

export const DepositModalLazy = React.lazy(() =>
  import('./DepositModal').then((m) => ({ default: m.DepositModal }))
)

export const VoteModalLazy = React.lazy(() =>
  import('./VoteModal').then((m) => ({ default: m.VoteModal }))
)

export const ClaimModalLazy = React.lazy(() =>
  import('./ClaimModal').then((m) => ({ default: m.ClaimModal }))
)

// withSuspense helper moved to /utils/suspense.tsx to avoid fast refresh issues
