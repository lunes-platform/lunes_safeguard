import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button } from '@safeguard/shared-ui';
import { Wallet, Shield, ArrowRight } from 'lucide-react';

/**
 * Página de Login
 * 
 * Funcionalidades:
 * - Conectar carteira Web3
 * - Redirecionamento automático se já autenticado
 * - Interface moderna e responsiva
 */
export function Login() {
  const { isAuthenticated, connectWallet, isLoading, error } = useAuth();

  // Redireciona se já estiver autenticado
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Erro ao conectar carteira:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo e Título */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            SafeGuard Admin
          </h1>
          <p className="text-muted-foreground">
            Conecte sua carteira para acessar o painel administrativo
          </p>
        </div>

        {/* Card de Login */}
        <Card className="p-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground text-center">
              Conectar Carteira
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Use sua carteira Web3 para fazer login de forma segura
            </p>
          </div>

          {/* Erro */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Botão de Conectar */}
          <Button
            onClick={handleConnectWallet}
            disabled={isLoading}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Conectando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Conectar Carteira
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>

          {/* Informações de Segurança */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Conexão Segura
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Suas chaves privadas permanecem seguras em sua carteira. 
                  Nunca compartilhamos ou armazenamos informações sensíveis.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Rodapé */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Suporte para carteiras Substrate e Ethereum
          </p>
        </div>
      </div>
    </div>
  );
}