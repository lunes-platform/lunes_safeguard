import React from 'react';
import { Card } from '@safeguard/shared-ui';
import { 
  Shield, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Vote
} from 'lucide-react';


/**
 * Página principal do Dashboard
 * 
 * Exibe:
 * - Métricas principais do sistema
 * - Projetos recentes
 * - Alertas e notificações
 * - Atividades recentes
 */
export function Dashboard() {
  // TODO: Substituir por dados reais do React Query
  const metrics: any[] = [];
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="p-2 md:p-3 bg-primary/10 rounded-[5px]">
          <svg className="w-6 h-6 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Visão geral do sistema SafeGuard
          </p>
        </div>
      </div>



      {/* Alertas e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Alertas */}
        <Card className="p-4 md:p-6 card-modern">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/10 rounded-[5px]">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Alertas Recentes
            </h2>
          </div>
          <div className="space-y-4">
            {/* TODO: Mapear alertas reais */}
            <p className="text-muted-foreground">Nenhum alerta recente.</p>
          </div>
        </Card>

        {/* Atividades */}
        <Card className="p-4 md:p-6 card-modern">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-[5px]">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Atividades Recentes
            </h2>
          </div>
          <div className="space-y-4">
            {/* TODO: Mapear atividades reais */}
            <p className="text-muted-foreground">Nenhuma atividade recente.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}