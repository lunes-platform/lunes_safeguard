import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Wallet, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { Button, Input } from '../ui'
import { formatCurrency } from '../../utils/formatters'
import { sanitizeInput, validateAmount } from '../../utils/security'
import { contractService } from '../../services/contractService'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  projectName: string
  minDeposit?: number
  maxDeposit?: number
  onDeposit?: (amount: number, token: string) => Promise<void>
}

interface Token {
  id: string
  name: string
  symbol: string
  balance: number
  decimals: number
  icon?: string
}

const mockTokens: Token[] = [
  {
    id: 'lunes',
    name: 'Lunes',
    symbol: 'LUNES',
    balance: 15000,
    decimals: 18
  },
  {
    id: 'lusdt',
    name: 'Lunes USDT',
    symbol: 'LUSDT',
    balance: 5000,
    decimals: 6
  },
  {
    id: 'lbtc',
    name: 'Lunes Bitcoin',
    symbol: 'LBTC',
    balance: 0.5,
    decimals: 8
  }
]

const DepositModal = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  minDeposit = 1000,
  maxDeposit = 1000000,
  onDeposit
}: DepositModalProps) => {
  const { t } = useTranslation()
  const [selectedToken, setSelectedToken] = useState<Token>(mockTokens[0])
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'input' | 'confirm' | 'processing' | 'success'>('input')

  if (!isOpen) return null

  const handleAmountChange = (value: string) => {
    const sanitized = sanitizeInput(value)
    setAmount(sanitized)
    setError('')
  }

  const validateDepositAmount = (): boolean => {
    if (!amount || isNaN(Number(amount))) {
      setError(t('modals.deposit.errors.invalidAmount'))
      return false
    }

    const validation = validateAmount(amount)

    if (!validation.isValid) {
      setError(validation.error || t('modals.deposit.errors.invalidAmount'))
      return false
    }

    const numAmount = Number(amount)

    if (numAmount < minDeposit) {
      setError(t('modals.deposit.errors.belowMinimum', { min: formatCurrency(minDeposit, selectedToken.symbol, 'pt-BR') }))
      return false
    }

    if (numAmount > maxDeposit) {
      setError(t('modals.deposit.errors.aboveMaximum', { max: formatCurrency(maxDeposit, selectedToken.symbol, 'pt-BR') }))
      return false
    }

    if (numAmount > selectedToken.balance) {
      setError(t('modals.deposit.errors.insufficientBalance'))
      return false
    }

    return true
  }

  const handleNext = () => {
    if (validateDepositAmount()) {
      setStep('confirm')
    }
  }

  const handleConfirm = async () => {
    setStep('processing')
    setIsLoading(true)

    try {
      // Conectar ao serviço do contrato
      await contractService.connect()

      // Converter amount para BigInt com 18 decimais
      const amountWei = BigInt(Math.floor(Number(amount) * 10 ** selectedToken.decimals))

      // Chamar addGuarantee no contrato
      const result = await contractService.addGuarantee(
        projectId,
        selectedToken.id === 'lunes' ? 1 : 2, // tokenId
        amountWei
      )

      console.log('Guarantee added:', result.txHash)

      // Callback opcional para lógica adicional
      if (onDeposit) {
        await onDeposit(Number(amount), selectedToken.id)
      }

      setStep('success')
    } catch (err) {
      console.error('Deposit failed:', err)
      setError(t('modals.deposit.errors.transactionFailed'))
      setStep('confirm')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setAmount('')
    setError('')
    setStep('input')
    onClose()
  }

  const renderStepContent = () => {
    switch (step) {
      case 'input':
        return (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('modals.deposit.selectToken')}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {mockTokens.map((token) => (
                  <button
                    key={token.id}
                    onClick={() => setSelectedToken(token)}
                    className={`p-3 border rounded-lg text-left transition-colors ${selectedToken.id === token.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{token.name}</div>
                        <div className="text-sm text-neutral-500">{token.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(token.balance, token.symbol, 'pt-BR')}</div>
                        <div className="text-sm text-neutral-500">{t('modals.deposit.available')}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('modals.deposit.amount')}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="pr-20"
                  min={minDeposit}
                  max={Math.min(maxDeposit, selectedToken.balance)}
                  step="0.000001"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-neutral-500">
                  {selectedToken.symbol}
                </div>
              </div>
              {error && (
                <div className="mt-2 flex items-center gap-2 text-sm text-critical-600">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <div className="bg-neutral-100 rounded-lg p-4 mb-6">
              <div className="text-sm text-neutral-600 space-y-2">
                <div className="flex justify-between">
                  <span>{t('modals.deposit.minimum')}:</span>
                  <span className="font-medium">{formatCurrency(minDeposit, selectedToken.symbol, 'pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('modals.deposit.maximum')}:</span>
                  <span className="font-medium">{formatCurrency(maxDeposit, selectedToken.symbol, 'pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('modals.deposit.balance')}:</span>
                  <span className="font-medium">{formatCurrency(selectedToken.balance, selectedToken.symbol, 'pt-BR')}</span>
                </div>
              </div>
            </div>
          </>
        )

      case 'confirm':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Wallet className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('modals.deposit.confirmTitle')}</h3>
              <p className="text-neutral-600">{t('modals.deposit.confirmDescription')}</p>
            </div>

            <div className="bg-neutral-100 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">{t('modals.deposit.project')}:</span>
                <span className="font-medium">{projectName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">{t('modals.deposit.token')}:</span>
                <span className="font-medium">{selectedToken.name} ({selectedToken.symbol})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">{t('modals.deposit.amount')}:</span>
                <span className="font-bold text-lg">{formatCurrency(Number(amount), selectedToken.symbol, 'pt-BR')}</span>
              </div>
            </div>

            <div className="bg-warning-100 border border-warning-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                <div className="text-sm text-warning-800">
                  <p className="font-medium mb-1">{t('modals.deposit.warning.title')}</p>
                  <p>{t('modals.deposit.warning.description')}</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'processing':
        return (
          <div className="text-center py-8">
            <Loader2 className="w-16 h-16 text-primary-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">{t('modals.deposit.processing.title')}</h3>
            <p className="text-neutral-600 mb-4">{t('modals.deposit.processing.description')}</p>
            <div className="bg-primary-100 rounded-lg p-4">
              <p className="text-sm text-primary-800">{t('modals.deposit.processing.note')}</p>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-success-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('modals.deposit.success.title')}</h3>
            <p className="text-neutral-600 mb-6">{t('modals.deposit.success.description')}</p>

            <div className="bg-success-100 rounded-lg p-4 mb-6">
              <div className="text-sm text-success-800 space-y-2">
                <div className="flex justify-between">
                  <span>{t('modals.deposit.deposited')}:</span>
                  <span className="font-medium">{formatCurrency(Number(amount), selectedToken.symbol, 'pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('modals.deposit.project')}:</span>
                  <span className="font-medium">{projectName}</span>
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
      case 'input':
        return (
          <nav className="flex gap-3" role="navigation" aria-label="Ações de depósito">
            <Button variant="purple-outline" onClick={handleClose} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button variant="purple" onClick={handleNext} disabled={!amount || !!error} className="flex-1">
              {t('common.next')}
            </Button>
          </nav>
        )

      case 'confirm':
        return (
          <nav className="flex gap-3" role="navigation" aria-label="Confirmação de depósito">
            <Button variant="purple-outline" onClick={() => setStep('input')} className="flex-1">
              {t('common.back')}
            </Button>
            <Button variant="purple" onClick={handleConfirm} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('modals.deposit.confirming')}
                </>
              ) : (
                t('modals.deposit.confirm')
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
    <div className="fixed inset-0 bg-lunes-dark/50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="deposit-modal-title">
      <section className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <header className="flex items-center justify-between p-6 border-b border-lunes-purple/20">
          <h2 id="deposit-modal-title" className="text-xl font-semibold text-lunes-dark">
            {step === 'success' ? t('modals.deposit.success.title') : t('modals.deposit.title')}
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

export { DepositModal, type DepositModalProps }
