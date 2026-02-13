import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Gift, AlertTriangle, CheckCircle, Loader2, Calculator, Info } from 'lucide-react'
import { Button, Badge } from '../ui'
import { formatCurrency, formatDate, formatPercentage } from '../../utils/formatters'

interface ClaimModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  projectName: string
  projectStatus: 'liquidated' | 'completed' | 'paused'
  userTokenBalance: number
  userTokenSymbol: string
  totalProjectTokens: number
  vaultComposition: Array<{
    tokenId: string
    tokenName: string
    tokenSymbol: string
    amount: number
    percentage: number
  }>
  liquidationDate?: string
  onClaim?: (projectId: number, tokensToClaim: number) => Promise<void>
}

const ClaimModal = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  projectStatus,
  userTokenBalance,
  userTokenSymbol,
  totalProjectTokens,
  vaultComposition,
  liquidationDate,
  onClaim
}: ClaimModalProps) => {
  const { t } = useTranslation()
  const [tokensToReturn, setTokensToReturn] = useState(userTokenBalance.toString())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'calculate' | 'confirm' | 'processing' | 'success'>('calculate')

  if (!isOpen) return null

  const userSharePercentage = totalProjectTokens > 0 ? (userTokenBalance / totalProjectTokens) * 100 : 0

  const calculateClaimableAmounts = () => {
    const tokensToReturnNum = Number(tokensToReturn)
    const sharePercentage = totalProjectTokens > 0 ? (tokensToReturnNum / totalProjectTokens) * 100 : 0

    return vaultComposition.map(asset => ({
      ...asset,
      claimableAmount: (asset.amount * sharePercentage) / 100
    }))
  }

  const claimableAmounts = calculateClaimableAmounts()

  const getStatusInfo = () => {
    switch (projectStatus) {
      case 'liquidated':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-critical-600" />,
          color: 'text-critical-600',
          bgColor: 'bg-critical-100',
          borderColor: 'border-critical-200',
          title: t('modals.claim.status.liquidated'),
          description: t('modals.claim.status.liquidatedDescription')
        }
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-success-600" />,
          color: 'text-success-600',
          bgColor: 'bg-success-100',
          borderColor: 'border-success-200',
          title: t('modals.claim.status.completed'),
          description: t('modals.claim.status.completedDescription')
        }
      case 'paused':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-warning-600" />,
          color: 'text-warning-600',
          bgColor: 'bg-warning-100',
          borderColor: 'border-warning-200',
          title: t('modals.claim.status.paused'),
          description: t('modals.claim.status.pausedDescription')
        }
      default:
        return {
          icon: <Info className="w-5 h-5 text-primary-600" />,
          color: 'text-primary-600',
          bgColor: 'bg-primary-100',
          borderColor: 'border-primary-200',
          title: t('modals.claim.status.unknown'),
          description: t('modals.claim.status.unknownDescription')
        }
    }
  }

  const statusInfo = getStatusInfo()

  const handleTokensChange = (value: string) => {
    const numValue = Number(value)
    if (numValue >= 0 && numValue <= userTokenBalance) {
      setTokensToReturn(value)
      setError('')
    }
  }

  const handleNext = () => {
    const amount = Number(tokensToReturn)
    if (amount <= 0 || amount > userTokenBalance) {
      setError(t('modals.claim.errors.invalidAmount'))
      return
    }

    setStep('confirm')
  }

  const handleConfirm = async () => {
    setStep('processing')
    setIsLoading(true)

    try {
      if (onClaim) {
        await onClaim(projectId, Number(tokensToReturn))
      }

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      setStep('success')
    } catch {
      setError(t('modals.claim.errors.transactionFailed'))
      setStep('confirm')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setTokensToReturn(userTokenBalance.toString())
    setError('')
    setStep('calculate')
    onClose()
  }

  const renderStepContent = () => {
    switch (step) {
      case 'calculate':
        return (
          <>
            {/* Project Status */}
            <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-4 mb-6`}>
              <div className="flex items-start gap-3">
                {statusInfo.icon}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{statusInfo.title}</h3>
                    <Badge variant="outline">
                      {t(`modals.claim.status.${projectStatus}`)}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">{statusInfo.description}</p>
                  {liquidationDate && (
                    <div className="text-sm text-neutral-500">
                      {t('modals.claim.liquidationDate')}: {formatDate(new Date(liquidationDate))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Holdings */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">{t('modals.claim.yourHoldings')}</h4>
              <div className="bg-neutral-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neutral-600">{t('modals.claim.projectTokens')}:</span>
                  <span className="font-medium">{formatCurrency(userTokenBalance, userTokenSymbol)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">{t('modals.claim.shareOfProject')}:</span>
                  <span className="font-medium">{formatPercentage(userSharePercentage)}</span>
                </div>
              </div>
            </div>

            {/* Tokens to Return */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('modals.claim.tokensToReturn')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={tokensToReturn}
                  onChange={(e) => handleTokensChange(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-20"
                  min="0"
                  max={userTokenBalance}
                  step="0.000001"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-neutral-500">
                  {userTokenSymbol}
                </div>
              </div>
              <div className="mt-1 flex justify-between text-sm text-neutral-500">
                <span>{t('modals.claim.available')}: {formatCurrency(userTokenBalance, userTokenSymbol)}</span>
                <button
                  onClick={() => setTokensToReturn(userTokenBalance.toString())}
                  className="text-primary-600 hover:text-primary-700"
                >
                  {t('modals.claim.useMax')}
                </button>
              </div>
              {error && (
                <div className="mt-2 flex items-center gap-2 text-sm text-critical-600">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            {/* Claimable Assets Preview */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4" />
                <h4 className="font-medium">{t('modals.claim.claimableAssets')}</h4>
              </div>
              <div className="space-y-3">
                {claimableAmounts.map((asset, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <div className="font-medium">{asset.tokenName}</div>
                      <div className="text-sm text-neutral-500">{asset.tokenSymbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(asset.claimableAmount, asset.tokenSymbol)}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {formatPercentage((Number(tokensToReturn) / totalProjectTokens) * 100)} {t('modals.claim.ofVault')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-warning-100 border border-warning-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                <div className="text-sm text-warning-800">
                  <p className="font-medium mb-1">{t('modals.claim.notice.title')}</p>
                  <p>{t('modals.claim.notice.description')}</p>
                </div>
              </div>
            </div>
          </>
        )

      case 'confirm':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Gift className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('modals.claim.confirmTitle')}</h3>
              <p className="text-neutral-600">{t('modals.claim.confirmDescription')}</p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">{t('modals.claim.project')}:</span>
                <span className="font-medium">{projectName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">{t('modals.claim.returning')}:</span>
                <span className="font-bold text-lg">{formatCurrency(Number(tokensToReturn), userTokenSymbol)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">{t('modals.claim.youWillReceive')}:</h4>
              {claimableAmounts.map((asset, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-success-50 rounded-lg">
                  <span className="font-medium">{asset.tokenName} ({asset.tokenSymbol})</span>
                  <span className="font-bold text-success-600">
                    {formatCurrency(asset.claimableAmount, 'pt-BR', asset.tokenSymbol)}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-critical-100 border border-critical-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-critical-600 mt-0.5" />
                <div className="text-sm text-critical-800">
                  <p className="font-medium mb-1">{t('modals.claim.warning.title')}</p>
                  <p>{t('modals.claim.warning.description')}</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'processing':
        return (
          <div className="text-center py-8">
            <Loader2 className="w-16 h-16 text-primary-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">{t('modals.claim.processing.title')}</h3>
            <p className="text-neutral-400 mb-4">{t('modals.claim.processing.description')}</p>
            <div className="bg-primary-100 rounded-lg p-4">
              <p className="text-sm text-primary-800">{t('modals.claim.processing.note')}</p>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-success-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('modals.claim.success.title')}</h3>
            <p className="text-neutral-400 mb-6">{t('modals.claim.success.description')}</p>

            <div className="bg-success-100 rounded-lg p-4 mb-6">
              <div className="text-sm text-success-800 space-y-2">
                <div className="flex justify-between">
                  <span>{t('modals.claim.returned')}:</span>
                  <span className="font-medium">{formatCurrency(Number(tokensToReturn), userTokenSymbol)}</span>
                </div>
                <div className="border-t border-success-200 pt-2">
                  <div className="font-medium mb-2">{t('modals.claim.received')}:</div>
                  {claimableAmounts.map((asset, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{asset.tokenSymbol}:</span>
                      <span className="font-medium">{formatCurrency(asset.claimableAmount, 'pt-BR', asset.tokenSymbol)}</span>
                    </div>
                  ))}
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
    switch (step) {
      case 'calculate':
        return (
          <nav className="flex gap-3" role="navigation" aria-label="Ações de resgate">
            <Button variant="purple-outline" onClick={handleClose} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button variant="purple" onClick={handleNext} disabled={!tokensToReturn || !!error} className="flex-1">
              {t('common.next')}
            </Button>
          </nav>
        )

      case 'confirm':
        return (
          <nav className="flex gap-3" role="navigation" aria-label="Confirmação de resgate">
            <Button variant="purple-outline" onClick={() => setStep('calculate')} className="flex-1">
              {t('common.back')}
            </Button>
            <Button variant="purple" onClick={handleConfirm} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('modals.claim.confirming')}
                </>
              ) : (
                t('modals.claim.confirm')
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
    <div className="fixed inset-0 bg-lunes-dark/50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="claim-modal-title">
      <section className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <header className="flex items-center justify-between p-6 border-b border-lunes-purple/20">
          <h2 id="claim-modal-title" className="text-xl font-semibold text-lunes-dark">
            {step === 'success' ? t('modals.claim.success.title') : t('modals.claim.title')}
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

export { ClaimModal }
