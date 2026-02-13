import React from 'react'
import { useWeb3 } from '../hooks/useWeb3'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Wallet, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'

/**
 * Componente de teste para verificar a integração Web3
 * Este componente pode ser removido em produção
 */
export const Web3TestComponent: React.FC = () => {
  const { 
    wallet, 
    error, 
    isProcessing, 
    connectWallet, 
    disconnectWallet, 
    sendTransaction, 
    clearError 
  } = useWeb3()

  const handleTestTransaction = async () => {
    if (!wallet.isConnected) {
      alert('Conecte a carteira primeiro')
      return
    }

    const transaction = await sendTransaction(
      '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      '10',
      'DOT'
    )

    if (transaction) {
      alert(`Transação enviada! Hash: ${transaction.hash}`)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Teste Web3 Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da Carteira */}
        <div className="p-3 rounded-lg bg-gray-50">
          <h3 className="font-medium mb-2">Status da Carteira</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              {wallet.isConnected ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              <span>
                {wallet.isConnected ? 'Conectada' : 'Desconectada'}
              </span>
            </div>
            {wallet.address && (
              <div className="text-xs text-gray-600">
                <strong>Endereço:</strong> {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
              </div>
            )}
            {wallet.balance && (
              <div className="text-xs text-gray-600">
                <strong>Saldo:</strong> {wallet.balance} {wallet.network || 'DOT'}
              </div>
            )}
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="mt-2 text-red-600 hover:text-red-700"
            >
              Limpar Erro
            </Button>
          </div>
        )}

        {/* Ações */}
        <div className="space-y-2">
          {!wallet.isConnected ? (
            <Button
              onClick={connectWallet}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                'Conectar Carteira'
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleTestTransaction}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Testar Transação (10 DOT)'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={disconnectWallet}
                className="w-full"
              >
                Desconectar
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default Web3TestComponent