import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet, AlertTriangle, CheckCircle, Loader2, DollarSign, Info, ExternalLink } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '../../../components/ui'
import { useWeb3 } from '../../../hooks/useWeb3'
import { contractService } from '../../../services/contractService'
import type { ProjectRegistrationData } from '../types'

interface DepositGuaranteeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  projectData: ProjectRegistrationData
}

const DepositGuaranteeModal: React.FC<DepositGuaranteeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  projectData
}) => {
  // TODO: Implementar traduções com useTranslation
  const [step, setStep] = useState<'connect' | 'deposit' | 'confirm' | 'processing' | 'success'>('connect')
  const [depositAmount, setDepositAmount] = useState('')
  const [transactionHash, setTransactionHash] = useState('')

  // Usar o hook Web3 personalizado
  const { wallet, error, isProcessing, connectWallet, clearError, sendTransaction } = useWeb3()

  // Valores mínimos baseados no score estimado
  const minimumDeposit = calculateMinimumDeposit(projectData.estimatedScore)
  const recommendedDeposit = minimumDeposit * 1.5

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setStep('connect')
      clearError()
      setDepositAmount('')
      setTransactionHash('')
    }
  }, [isOpen, clearError])

  // Atualizar step quando carteira conectar
  useEffect(() => {
    if (wallet.isConnected && step === 'connect') {
      setStep('deposit')
    }
  }, [wallet.isConnected, step])

  const handleConnectWallet = async () => {
    const success = await connectWallet()
    if (success) {
      setStep('deposit')
    }
  }

  const handleDepositSubmit = async () => {
    if (!depositAmount || parseFloat(depositAmount) < minimumDeposit) {
      // TODO: Usar setError do hook quando implementado
      console.error(`Valor mínimo de depósito: ${minimumDeposit} DOT`)
      return
    }

    if (parseFloat(depositAmount) > parseFloat(wallet.balance || '0')) {
      // TODO: Usar setError do hook quando implementado
      console.error('Saldo insuficiente')
      return
    }

    setStep('confirm')
    clearError()
  }

  const confirmDeposit = async () => {
    setStep('processing')

    try {
      // Conectar ao serviço do contrato
      await contractService.connect()

      // Registrar projeto primeiro (se necessário)
      const projectResult = await contractService.registerProject(
        projectData.name,
        '', // metadataUri
        wallet.address || '',
        undefined // pairPsp22
      )

      // Adicionar garantia ao projeto
      const depositAmountWei = BigInt(Math.floor(parseFloat(depositAmount) * 10 ** 18))
      const guaranteeResult = await contractService.addGuarantee(
        projectResult.projectId,
        1, // tokenId para LUNES
        depositAmountWei
      )

      // Também usar o hook Web3 para transação na blockchain (quando integrado)
      const transaction = await sendTransaction(
        'SafeGuard_Contract_Address', // TODO: Usar endereço real do contrato
        depositAmount,
        'DOT'
      )

      if (transaction || guaranteeResult) {
        setTransactionHash(transaction?.hash || guaranteeResult.txHash)
        setStep('success')
      } else {
        setStep('deposit')
      }
    } catch (err) {
      console.error('Falha na transação:', err)
      setStep('deposit')
    }
  }

  const handleSuccess = () => {
    onSuccess()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        >
          <Card className="bg-lunes-dark/95 border-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader className="relative border-b border-white/10 pb-6">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 hover:bg-white/10 rounded-full transition-colors text-neutral-400 hover:text-white"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>

              <CardTitle className="flex items-center gap-3 pr-12 text-white">
                <div className="w-10 h-10 bg-lunes-purple/20 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-lunes-purple" />
                </div>
                Depósito de Garantia
              </CardTitle>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mt-6">
                {[
                  { key: 'connect', label: 'Conectar', icon: Wallet },
                  { key: 'deposit', label: 'Depósito', icon: DollarSign },
                  { key: 'confirm', label: 'Confirmar', icon: CheckCircle }
                ].map((stepItem, index) => {
                  const isActive = step === stepItem.key ||
                    (step === 'processing' && stepItem.key === 'confirm') ||
                    (step === 'success' && index <= 2)
                  const isCompleted =
                    (step === 'deposit' && stepItem.key === 'connect') ||
                    (step === 'confirm' && index <= 1) ||
                    (step === 'processing' && index <= 1) ||
                    (step === 'success' && index <= 2)

                  return (
                    <div key={stepItem.key} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${isCompleted ? 'bg-green-500 text-white' :
                        isActive ? 'bg-lunes-purple text-white shadow-lg shadow-purple-900/50' :
                          'bg-white/10 text-neutral-500 border border-white/5'
                        }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <stepItem.icon className="w-4 h-4" />
                        )}
                      </div>
                      <span className={`ml-2 text-sm font-medium ${isActive || isCompleted ? 'text-white' : 'text-neutral-500'
                        }`}>
                        {stepItem.label}
                      </span>
                      {index < 2 && (
                        <div className={`w-12 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-white/10'
                          }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Project Summary */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Resumo do Projeto</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-400">Nome:</span>
                    <span className="ml-2 font-medium text-white">{projectData.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Categoria:</span>
                    <Badge variant="secondary" className="ml-2 bg-white/10 text-white hover:bg-white/20">{projectData.category}</Badge>
                  </div>
                  <div>
                    <span className="text-neutral-400">Score Estimado:</span>
                    <span className="ml-2 font-bold text-lunes-purple">{projectData.estimatedScore}/100</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Depósito Mínimo:</span>
                    <span className="ml-2 font-medium text-white">{minimumDeposit} DOT</span>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-400">Erro</h4>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Step Content */}
              {step === 'connect' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-lunes-purple/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-lunes-purple/20">
                    <Wallet className="w-8 h-8 text-lunes-purple" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Conectar Carteira
                  </h3>
                  <p className="text-neutral-400 mb-6">
                    Conecte sua carteira Polkadot para realizar o depósito de garantia
                  </p>
                  <Button
                    onClick={handleConnectWallet}
                    disabled={isProcessing}
                    className="px-8 py-3 bg-lunes-purple hover:bg-lunes-purple-dark text-white rounded-full transition-all shadow-lg hover:shadow-purple-500/25"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      'Conectar Carteira'
                    )}
                  </Button>
                </div>
              )}

              {step === 'deposit' && (
                <div className="space-y-6">
                  {/* Wallet Info */}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h4 className="font-semibold text-green-400">Carteira Conectada</h4>
                    </div>
                    <div className="text-sm text-green-300/80">
                      <p><strong>Endereço:</strong> {wallet.address?.slice(0, 8)}...{wallet.address?.slice(-8)}</p>
                      <p><strong>Saldo:</strong> {wallet.balance} DOT</p>
                      <p><strong>Rede:</strong> {wallet.network}</p>
                    </div>
                  </div>

                  {/* Deposit Amount */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Valor do Depósito (DOT)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min={minimumDeposit}
                      max={wallet.balance}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder={`Mínimo: ${minimumDeposit} DOT`}
                      className="bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-lunes-purple"
                    />
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="text-neutral-400">
                        Mínimo: {minimumDeposit} DOT
                      </span>
                      <button
                        type="button"
                        onClick={() => setDepositAmount(recommendedDeposit.toString())}
                        className="text-lunes-purple hover:text-purple-400 font-medium transition-colors"
                      >
                        Usar recomendado: {recommendedDeposit} DOT
                      </button>
                    </div>
                  </div>

                  {/* Deposit Info */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-300/80">
                        <h4 className="font-semibold mb-1 text-blue-400">Sobre o Depósito de Garantia</h4>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>O depósito será bloqueado como garantia para os investidores</li>
                          <li>Valores maiores aumentam a confiança e podem melhorar seu score</li>
                          <li>O depósito será devolvido após o período de garantia</li>
                          <li>Em caso de problemas, o depósito pode ser usado para compensar investidores</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleDepositSubmit}
                      disabled={!depositAmount || parseFloat(depositAmount) < minimumDeposit}
                      className="bg-lunes-purple hover:bg-lunes-purple-dark text-white"
                    >
                      Continuar
                    </Button>
                  </div>
                </div>
              )}

              {step === 'confirm' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
                      <AlertTriangle className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Confirmar Transação
                    </h3>
                    <p className="text-neutral-400">
                      Revise os detalhes antes de confirmar o depósito
                    </p>
                  </div>

                  {/* Transaction Summary */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Valor do Depósito:</span>
                      <span className="font-semibold text-white">{depositAmount} DOT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Taxa de Rede (estimada):</span>
                      <span className="font-semibold text-white">~0.01 DOT</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between">
                      <span className="font-semibold text-white">Total:</span>
                      <span className="font-bold text-lg text-lunes-purple">{(parseFloat(depositAmount) + 0.01).toFixed(2)} DOT</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep('deposit')}
                      className="flex-1 border-white/10 text-white hover:bg-white/5"
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={confirmDeposit}
                      disabled={isProcessing}
                      className="flex-1 bg-lunes-purple hover:bg-lunes-purple-dark text-white"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Confirmar Depósito'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {step === 'processing' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-lunes-purple/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-lunes-purple/20">
                    <Loader2 className="w-8 h-8 text-lunes-purple animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Processando Transação
                  </h3>
                  <p className="text-neutral-400 mb-4">
                    Aguarde enquanto sua transação é processada na blockchain...
                  </p>
                  <div className="text-sm text-neutral-500">
                    Isso pode levar alguns minutos
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Depósito Realizado com Sucesso!
                  </h3>
                  <p className="text-neutral-400 mb-6">
                    Seu projeto foi registrado e está aguardando aprovação
                  </p>

                  {transactionHash && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">Hash da Transação:</span>
                        <a
                          href={`https://polkadot.subscan.io/extrinsic/${transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lunes-purple hover:text-purple-400 text-sm font-mono flex items-center gap-1 transition-colors"
                        >
                          {transactionHash.slice(0, 8)}...{transactionHash.slice(-8)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleSuccess} className="px-8 bg-lunes-purple hover:bg-lunes-purple-dark text-white">
                    Continuar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Função para calcular depósito mínimo baseado no score
function calculateMinimumDeposit(score: number): number {
  // Score mais baixo = depósito maior
  const baseDeposit = 100 // 100 DOT base
  const scoreMultiplier = (100 - score) / 100 // Quanto menor o score, maior o multiplicador
  return Math.max(50, baseDeposit * (1 + scoreMultiplier)) // Mínimo de 50 DOT
}

export { DepositGuaranteeModal }