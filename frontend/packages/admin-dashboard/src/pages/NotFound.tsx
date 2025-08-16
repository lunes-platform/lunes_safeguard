import React from 'react';
import { Button } from '@safeguard/shared-ui';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

/**
 * Página 404 - Não Encontrado
 * 
 * Exibida quando o usuário acessa uma rota que não existe
 * Oferece opções para retornar ao dashboard ou página anterior
 */
export function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* Ilustração 404 */}
        <div className="space-y-4">
          <div className="text-8xl font-bold text-primary/20">
            404
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Página não encontrada
          </h1>
          <p className="text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={handleGoHome}
            className="flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Ir para Dashboard</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
        </div>

        {/* Links úteis */}
        <div className="pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">
            Links úteis:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button 
              onClick={() => navigate('/projects')}
              className="text-primary hover:underline"
            >
              Projetos
            </button>
            <button 
              onClick={() => navigate('/guarantees')}
              className="text-primary hover:underline"
            >
              Garantias
            </button>
            <button 
              onClick={() => navigate('/voting')}
              className="text-primary hover:underline"
            >
              Votações
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="text-primary hover:underline"
            >
              Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}