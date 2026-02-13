// Core types for SafeGard application

export interface Project {
  id: number
  name: string
  description: string
  metadataUri?: string // URI do IPFS com metadados (JSON)
  category: string
  owner?: string
  status: ProjectStatus
  score: number
  guaranteeValue: number
  createdAt: Date
  nextVoting: Date
  contractAddress: string
  vaultComposition: VaultComposition
  isAudited?: boolean
  isKYC?: boolean
}

export interface VaultComposition {
  lunes: number
  psp22Tokens: Array<{ tokenId: string; amount: number }>
  nfts: Array<{ collectionId: string; count: number; totalValue: number }>
}

export type ProjectStatus = 
  | 'active'
  | 'in_lock'
  | 'voting_open'
  | 'correction_window'
  | 'liquidation'
  | 'claims_open'
  | 'completed'

export type ScoreLevel = 'low' | 'moderate' | 'high'

export interface Vote {
  id: string
  projectId: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  yesVotes: number
  noVotes: number
  totalVotes: number
  quorum: number
  status: VoteStatus
  type: VoteType
}

export type VoteStatus = 'open' | 'closed' | 'approved' | 'rejected'
export type VoteType = 'annual' | 'correction' | 'liquidation'

export interface Metric {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  format?: 'currency' | 'percentage' | 'number'
}

export interface TransactionMock {
  id: string
  type: 'deposit' | 'vote' | 'claim'
  amount?: number
  token?: string
  fee: {
    lunes: number
    lusdt: number
  }
  status: 'pending' | 'success' | 'error'
  timestamp: Date
}

// i18n types
export type Locale = 'pt' | 'en' | 'es'

export interface LocaleConfig {
  code: Locale
  name: string
  flag: string
}
