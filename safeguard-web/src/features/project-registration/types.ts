export interface ProjectRegistrationData {
  id: number
  name: string
  description: string
  category: 'DeFi' | 'NFT' | 'Gaming' | 'Infrastructure' | 'Other'
  avatar?: string
  website?: string
  github?: string
  twitter?: string
  telegram?: string
  tokenContract: string
  treasuryAddress: string
  teamSize: number
  hasAudit: boolean
  hasKYC: boolean
  auditReport?: string
  kycProvider?: string
  agreedToTerms: boolean
  status: 'pending_deposit' | 'pending_approval' | 'approved' | 'rejected'
  createdAt: Date
  estimatedScore: number
  contractTxHash?: string // Hash da transação de registro no contrato
}

export interface DepositGuaranteeData {
  amount: string
  tokenAddress: string
  transactionHash?: string
  blockNumber?: number
  timestamp?: Date
}

export interface ProjectSubmissionResult {
  success: boolean
  projectId?: number
  transactionHash?: string
  error?: string
}

export type ProjectCategory = 'DeFi' | 'NFT' | 'Gaming' | 'Infrastructure' | 'Other'
export type ProjectStatus = 'pending_deposit' | 'pending_approval' | 'approved' | 'rejected'