import { useState, useEffect, useCallback } from 'react'

/**
 * Interface para conexão de carteira Web3
 */
export interface WalletConnection {
  isConnected: boolean
  address?: string
  balance?: string
  network?: string
  isLoading?: boolean
}

/**
 * Interface para transação blockchain
 */
export interface Transaction {
  hash: string
  status: 'pending' | 'success' | 'failed'
  timestamp: number
  amount?: string
  token?: string
}

/**
 * Tipos de erro Web3
 */
export type Web3Error = 
  | 'WALLET_NOT_FOUND'
  | 'USER_REJECTED'
  | 'NETWORK_ERROR'
  | 'INSUFFICIENT_BALANCE'
  | 'TRANSACTION_FAILED'
  | 'UNKNOWN_ERROR'

/**
 * Hook personalizado para integração Web3/Polkadot
 * 
 * Fornece funcionalidades para:
 * - Conexão de carteira
 * - Verificação de saldo
 * - Envio de transações
 * - Monitoramento de status
 * 
 * @example
 * ```tsx
 * const { wallet, connectWallet, sendTransaction, error } = useWeb3()
 * 
 * const handleConnect = async () => {
 *   await connectWallet()
 * }
 * ```
 */
export const useWeb3 = () => {
  const [wallet, setWallet] = useState<WalletConnection>({
    isConnected: false,
    isLoading: false
  })
  const [error, setError] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [_currentTransaction, _setCurrentTransaction] = useState<Transaction | null>(null)

  /**
   * Verifica se há uma carteira conectada ao carregar
   */
  const checkWalletConnection = useCallback(async (): Promise<void> => {
    try {
      setWallet(prev => ({ ...prev, isLoading: true }))
      
      // TODO: Implementar verificação real com @polkadot/extension-dapp
      // const { web3Accounts, web3Enable } = await import('@polkadot/extension-dapp')
      // const extensions = await web3Enable('SafeGuard')
      
      // Mock para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockWallet: WalletConnection = {
        isConnected: false,
        isLoading: false
      }
      
      setWallet(mockWallet)
    } catch (err) {
      console.error('Erro ao verificar carteira:', err)
      setError('Erro ao verificar conexão da carteira')
      setWallet({ isConnected: false, isLoading: false })
    }
  }, [])

  /**
   * Conecta a carteira Web3
   */
  const connectWallet = useCallback(async (): Promise<boolean> => {
    try {
      setIsProcessing(true)
      setError('')
      
      // TODO: Implementar conexão real
      // const { web3Accounts, web3Enable } = await import('@polkadot/extension-dapp')
      // const extensions = await web3Enable('SafeGuard')
      // 
      // if (extensions.length === 0) {
      //   throw new Error('WALLET_NOT_FOUND')
      // }
      // 
      // const accounts = await web3Accounts()
      // if (accounts.length === 0) {
      //   throw new Error('USER_REJECTED')
      // }
      
      // Mock para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const connectedWallet: WalletConnection = {
        isConnected: true,
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        balance: '1000.50',
        network: 'Polkadot',
        isLoading: false
      }
      
      setWallet(connectedWallet)
      return true
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error)
      setError(errorMessage)
      setWallet({ isConnected: false, isLoading: false })
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [])

  /**
   * Desconecta a carteira
   */
  const disconnectWallet = useCallback((): void => {
    setWallet({ isConnected: false, isLoading: false })
    setError('')
  }, [])

  /**
   * Envia uma transação
   */
  const sendTransaction = useCallback(async (
    _to: string,
    amount: string,
    token: string = 'DOT'
  ): Promise<Transaction | null> => {
    if (!wallet.isConnected) {
      setError('Carteira não conectada')
      return null
    }

    try {
      setIsProcessing(true)
      setError('')
      
      // Validar saldo
      const balance = parseFloat(wallet.balance || '0')
      const txAmount = parseFloat(amount)
      
      if (txAmount > balance) {
        throw new Error('INSUFFICIENT_BALANCE')
      }
      
      // TODO: Implementar envio real de transação
      // const api = await ApiPromise.create({ provider: wsProvider })
      // const transfer = api.tx.balances.transfer(to, amount)
      // const hash = await transfer.signAndSend(account)
      
      // Mock para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const transaction: Transaction = {
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: 'success',
        timestamp: Date.now(),
        amount,
        token
      }
      
      // Atualizar saldo após transação
      const newBalance = (balance - txAmount).toString()
      setWallet(prev => ({ ...prev, balance: newBalance }))
      
      return transaction
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error)
      setError(errorMessage)
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [wallet])

  /**
   * Atualiza o saldo da carteira
   */
  const refreshBalance = useCallback(async (): Promise<void> => {
    if (!wallet.isConnected || !wallet.address) return
    
    try {
      // TODO: Implementar consulta real de saldo
      // const api = await ApiPromise.create({ provider: wsProvider })
      // const balance = await api.query.system.account(wallet.address)
      
      // Mock para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setWallet(prev => ({
        ...prev,
        balance: (Math.random() * 1000 + 500).toFixed(2)
      }))
    } catch (err) {
      console.error('Erro ao atualizar saldo:', err)
    }
  }, [wallet.isConnected, wallet.address])

  /**
   * Limpa erros
   */
  const clearError = useCallback((): void => {
    setError('')
  }, [])

  // Verificar conexão ao montar o componente
  useEffect(() => {
    checkWalletConnection()
  }, [])

  return {
    wallet,
    error,
    isProcessing,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    refreshBalance,
    clearError,
    checkWalletConnection
  }
}

/**
 * Converte erros em mensagens amigáveis
 */
function getErrorMessage(error: Error): string {
  const errorType = error.message as Web3Error
  
  switch (errorType) {
    case 'WALLET_NOT_FOUND':
      return 'Nenhuma carteira Web3 encontrada. Instale uma extensão como Polkadot.js'
    case 'USER_REJECTED':
      return 'Conexão rejeitada pelo usuário'
    case 'NETWORK_ERROR':
      return 'Erro de rede. Verifique sua conexão'
    case 'INSUFFICIENT_BALANCE':
      return 'Saldo insuficiente para realizar a transação'
    case 'TRANSACTION_FAILED':
      return 'Falha ao processar a transação'
    default:
      return 'Erro desconhecido. Tente novamente'
  }
}

export default useWeb3