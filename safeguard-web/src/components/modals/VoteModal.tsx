import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Vote, CheckCircle, XCircle, AlertTriangle, Loader2, Info } from 'lucide-react'
import { Button, Badge } from '../ui'
import { formatCurrency, formatDate, formatPercentage } from '../../utils/formatters'

interface VoteModalProps {
  isOpen: boolean
  onClose: () => void
  proposalId: number
  proposalTitle: string
  proposalDescription: string
  proposalType: 'project_approval' | 'parameter_change' | 'emergency_pause'
  voteEndTime: string
  currentVotesYes: number
  currentVotesNo: number
  quorumRequired: number
  userVotingPower: number
  hasVoted?: boolean
  userVote?: 'yes' | 'no'
  onVote?: (proposalId: number, vote: 'yes' | 'no', amount: number) => Promise<void>
}

const VoteModal = ({
  isOpen,
  onClose,
  proposalId,
  proposalTitle,
  proposalDescription,
  proposalType,
  voteEndTime,
  currentVotesYes,
  currentVotesNo,
  quorumRequired,
  userVotingPower,
  hasVoted = false,
  userVote,
  onVote
}: VoteModalProps) => {
  const { t } = useTranslation()
  const [selectedVote, setSelectedVote] = useState<'yes' | 'no' | null>(null)
  const [voteAmount, setVoteAmount] = useState(userVotingPower.toString())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'select' | 'confirm' | 'processing' | 'success'>('select')

  if (!isOpen) return null

  const totalVotes = currentVotesYes + currentVotesNo
  const approvalRate = totalVotes > 0 ? (currentVotesYes / totalVotes) * 100 : 0
  const isExpired = new Date(voteEndTime) < new Date()

  const getProposalTypeInfo = () => {
    switch (proposalType) {
      case 'project_approval':
        return {
          icon: <CheckCircle className="w-5 h-5 text-success-600" />,
          color: 'text-success-600',
          bgColor: 'bg-success-100',
          borderColor: 'border-success-200'
        }
      case 'parameter_change':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-warning-600" />,
          color: 'text-warning-600',
          bgColor: 'bg-warning-100',
          borderColor: 'border-warning-200'
        }
      case 'emergency_pause':
        return {
          icon: <XCircle className="w-5 h-5 text-critical-600" />,
          color: 'text-critical-600',
          bgColor: 'bg-critical-100',
          borderColor: 'border-critical-200'
        }
      default:
        return {
          icon: <Vote className="w-5 h-5 text-primary-600" />,
          color: 'text-primary-600',
          bgColor: 'bg-primary-100',
          borderColor: 'border-primary-200'
        }
    }
  }

  const typeInfo = getProposalTypeInfo()

  const handleVoteAmountChange = (value: string) => {
    const numValue = Number(value)
    if (numValue >= 0 && numValue <= userVotingPower) {
      setVoteAmount(value)
      setError('')
    }
  }

  const handleNext = () => {
    if (!selectedVote) {
      setError(t('modals.vote.errors.selectVote'))
      return
    }

    const amount = Number(voteAmount)
    if (amount <= 0 || amount > userVotingPower) {
      setError(t('modals.vote.errors.invalidAmount'))
      return
    }

    setStep('confirm')
  }

  const handleConfirm = async () => {
    if (!selectedVote) return

    setStep('processing')
    setIsLoading(true)

    try {
      if (onVote) {
        await onVote(proposalId, selectedVote, Number(voteAmount))
      }
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setStep('success')
    } catch {
      setError(t('modals.vote.errors.transactionFailed'))
      setStep('confirm')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedVote(null)
    setVoteAmount(userVotingPower.toString())
    setError('')
    setStep('select')
    onClose()
  }

  const renderStepContent = () => {
    switch (step) {
      case 'select':
        return (
          <>
            {/* Proposal Info */}
            <div className={`${typeInfo.bgColor} ${typeInfo.borderColor} border rounded-lg p-4 mb-6`}>
              <div className="flex items-start gap-3">
                {typeInfo.icon}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{proposalTitle}</h3>
                    <Badge variant="outline">
                      {t(`governance.type.${proposalType}`)}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">{proposalDescription}</p>
                  <div className="text-sm text-neutral-500">
                    {t('modals.vote.endsAt')}: {formatDate(new Date(voteEndTime))}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Results */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">{t('modals.vote.currentResults')}</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-success-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-success-600" />
                    <span className="text-sm font-medium text-success-800">{t('governance.votes.yes')}</span>
                  </div>
                  <div className="text-lg font-bold text-success-600">
                    {formatCurrency(currentVotesYes, 'LUNES')}
                  </div>
                  <div className="text-sm text-success-600">
                    {formatPercentage(approvalRate)}
                  </div>
                </div>

                <div className="bg-critical-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-critical-600" />
                    <span className="text-sm font-medium text-critical-800">{t('governance.votes.no')}</span>
                  </div>
                  <div className="text-lg font-bold text-critical-600">
                    {formatCurrency(currentVotesNo, 'LUNES')}
                  </div>
                  <div className="text-sm text-critical-600">
                    {formatPercentage(100 - approvalRate)}
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm text-neutral-600 mb-1">
                  <span>{t('governance.approvalProgress')}</span>
                  <span>{quorumRequired}% {t('governance.required')}</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      approvalRate >= quorumRequired ? 'bg-success-500' : 'bg-warning-500'
                    }`}
                    style={{ width: `${Math.min(approvalRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* User Status */}
            {hasVoted ? (
              <div className="bg-primary-100 border border-primary-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-primary-800">{t('modals.vote.alreadyVoted')}</p>
                    <p className="text-sm text-primary-600">
                      {t('modals.vote.yourVote')}: {userVote === 'yes' ? t('governance.votes.yes') : t('governance.votes.no')}
                    </p>
                  </div>
                </div>
              </div>
            ) : isExpired ? (
              <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="font-medium text-neutral-500">{t('modals.vote.expired')}</p>
                    <p className="text-sm text-neutral-400">{t('modals.vote.expiredDescription')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Vote Selection */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t('modals.vote.castYourVote')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedVote('yes')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        selectedVote === 'yes'
                          ? 'border-success-500 bg-success-100'
                          : 'border-neutral-200 hover:border-success-300'
                      }`}
                    >
                      <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${
                        selectedVote === 'yes' ? 'text-success-600' : 'text-neutral-400'
                      }`} />
                      <div className="font-medium">{t('governance.votes.yes')}</div>
                      <div className="text-sm text-neutral-500">{t('modals.vote.approve')}</div>
                    </button>

                    <button
                      onClick={() => setSelectedVote('no')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        selectedVote === 'no'
                          ? 'border-critical-500 bg-critical-100'
                          : 'border-neutral-200 hover:border-critical-300'
                      }`}
                    >
                      <XCircle className={`w-8 h-8 mx-auto mb-2 ${
                        selectedVote === 'no' ? 'text-critical-600' : 'text-neutral-400'
                      }`} />
                      <div className="font-medium">{t('governance.votes.no')}</div>
                      <div className="text-sm text-neutral-500">{t('modals.vote.reject')}</div>
                    </button>
                  </div>
                </div>

                {/* Vote Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {t('modals.vote.votingPower')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={voteAmount}
                      onChange={(e) => handleVoteAmountChange(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-20"
                      min="0"
                      max={userVotingPower}
                      step="0.000001"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-neutral-500">
                      LUNES
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">
                    {t('modals.vote.available')}: {formatCurrency(userVotingPower, 'LUNES')}
                  </div>
                  {error && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-critical-600">
                      <AlertTriangle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )

      case 'confirm':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Vote className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('modals.vote.confirmTitle')}</h3>
              <p className="text-neutral-600">{t('modals.vote.confirmDescription')}</p>
            </div>

            <div className="bg-neutral-100 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">{t('modals.vote.proposal')}:</span>
                <span className="font-medium">{proposalTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">{t('modals.vote.yourVote')}:</span>
                <div className="flex items-center gap-2">
                  {selectedVote === 'yes' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-success-600" />
                      <span className="font-medium text-success-600">{t('governance.votes.yes')}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-critical-600" />
                      <span className="font-medium text-critical-600">{t('governance.votes.no')}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">{t('modals.vote.votingPower')}:</span>
                <span className="font-bold text-lg">{formatCurrency(Number(voteAmount), 'LUNES')}</span>
              </div>
            </div>

            <div className="bg-warning-100 border border-warning-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                <div className="text-sm text-warning-800">
                  <p className="font-medium mb-1">{t('modals.vote.warning.title')}</p>
                  <p>{t('modals.vote.warning.description')}</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'processing':
        return (
          <div className="text-center py-8">
            <Loader2 className="w-16 h-16 text-primary-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">{t('modals.vote.processing.title')}</h3>
            <p className="text-neutral-400 mb-4">{t('modals.vote.processing.description')}</p>
            <div className="bg-primary-100 rounded-lg p-4">
              <p className="text-sm text-primary-800">{t('modals.vote.processing.note')}</p>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-success-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('modals.vote.success.title')}</h3>
            <p className="text-neutral-400 mb-6">{t('modals.vote.success.description')}</p>
            
            <div className="bg-success-100 rounded-lg p-4 mb-6">
              <div className="text-sm text-success-800 space-y-2">
                <div className="flex justify-between">
                  <span>{t('modals.vote.yourVote')}:</span>
                  <span className="font-medium">
                    {selectedVote === 'yes' ? t('governance.votes.yes') : t('governance.votes.no')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('modals.vote.votingPower')}:</span>
                  <span className="font-medium">{formatCurrency(Number(voteAmount), 'LUNES')}</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderFooter = () => {
    if (hasVoted || isExpired) {
      return (
        <Button variant="purple" onClick={handleClose} className="w-full">
          {t('common.close')}
        </Button>
      )
    }

    switch (step) {
      case 'select':
        return (
          <nav className="flex gap-3" role="navigation" aria-label="Ações de votação">
            <Button variant="purple-outline" onClick={handleClose} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button variant="purple" onClick={handleNext} disabled={!selectedVote || !!error} className="flex-1">
              {t('common.next')}
            </Button>
          </nav>
        )

      case 'confirm':
        return (
          <nav className="flex gap-3" role="navigation" aria-label="Confirmação de voto">
            <Button variant="purple-outline" onClick={() => setStep('select')} className="flex-1">
              {t('common.back')}
            </Button>
            <Button variant="purple" onClick={handleConfirm} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('modals.vote.confirming')}
                </>
              ) : (
                t('modals.vote.confirm')
              )}
            </Button>
          </nav>
        )

      case 'processing':
        return null

      case 'success':
        return (
          <Button variant="purple" onClick={handleClose} className="w-full">
            {t('common.close')}
          </Button>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-lunes-dark/50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="vote-modal-title">
      <section className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <header className="flex items-center justify-between p-6 border-b border-lunes-purple/20">
          <h2 id="vote-modal-title" className="text-xl font-semibold text-lunes-dark">
            {step === 'success' ? t('modals.vote.success.title') : t('modals.vote.title')}
          </h2>
          <button
            onClick={handleClose}
            className="text-lunes-purple hover:text-lunes-purple-dark transition-colors"
            disabled={step === 'processing'}
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        <main className="p-6">
          {renderStepContent()}
        </main>

        {renderFooter() && (
          <footer className="p-6 border-t border-lunes-purple/20 bg-lunes-light">
            {renderFooter()}
          </footer>
        )}
      </section>
    </div>
  )
}

export { VoteModal }
