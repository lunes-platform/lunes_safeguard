import React from 'react';
import { Tooltip, Button, Card } from '@safeguard/shared-ui';
import { Info, Settings, User, Bell, Download, Trash2, Edit, Eye } from 'lucide-react';

/**
 * Página de demonstração dos tooltips dinâmicos
 * Mostra diferentes variantes, posições e funcionalidades
 */
export function TooltipDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Demonstração de Tooltips Dinâmicos
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore diferentes variantes, posições e funcionalidades dos tooltips implementados
            com posicionamento automático e animações suaves.
          </p>
        </div>

        {/* Seção: Variantes */}
        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Variantes Visuais
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Tooltip content="Tooltip padrão" variant="default">
              <Button variant="outline" className="w-full">
                Default
              </Button>
            </Tooltip>
            
            <Tooltip content="Tooltip escuro" variant="dark">
              <Button variant="outline" className="w-full">
                Dark
              </Button>
            </Tooltip>
            
            <Tooltip content="Tooltip claro" variant="light">
              <Button variant="outline" className="w-full">
                Light
              </Button>
            </Tooltip>
            
            <Tooltip content="Operação realizada com sucesso!" variant="success">
              <Button variant="outline" className="w-full">
                Success
              </Button>
            </Tooltip>
            
            <Tooltip content="Atenção: Verifique os dados" variant="warning">
              <Button variant="outline" className="w-full">
                Warning
              </Button>
            </Tooltip>
            
            <Tooltip content="Erro: Operação falhou" variant="error">
              <Button variant="outline" className="w-full">
                Error
              </Button>
            </Tooltip>
          </div>
        </Card>

        {/* Seção: Posicionamento */}
        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Posicionamento Automático
          </h2>
          <div className="flex flex-col items-center space-y-8">
            {/* Tooltip Top */}
            <Tooltip content="Tooltip posicionado no topo" position="top">
              <Button variant="default">
                Top
              </Button>
            </Tooltip>
            
            {/* Tooltips Left e Right */}
            <div className="flex items-center space-x-16">
              <Tooltip content="Tooltip à esquerda" position="left">
                <Button variant="default">
                  Left
                </Button>
              </Tooltip>
              
              <Tooltip content="Posicionamento automático baseado no espaço disponível" position="auto">
                <Button variant="secondary" size="lg">
                  Auto Position
                </Button>
              </Tooltip>
              
              <Tooltip content="Tooltip à direita" position="right">
                <Button variant="default">
                  Right
                </Button>
              </Tooltip>
            </div>
            
            {/* Tooltip Bottom */}
            <Tooltip content="Tooltip posicionado embaixo" position="bottom">
              <Button variant="default">
                Bottom
              </Button>
            </Tooltip>
          </div>
        </Card>

        {/* Seção: Funcionalidades Avançadas */}
        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Funcionalidades Avançadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tooltip com delay */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Delay Personalizado</h3>
              <Tooltip 
                content="Aparece após 1 segundo" 
                showDelay={1000}
                variant="success"
              >
                <Button variant="outline" className="w-full">
                  <Bell className="w-4 h-4 mr-2" />
                  Delay 1s
                </Button>
              </Tooltip>
            </div>
            
            {/* Tooltip que segue o cursor */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Segue o Cursor</h3>
              <Tooltip 
                content="Este tooltip segue o movimento do mouse" 
                followCursor
                variant="dark"
              >
                <Button variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  Follow Cursor
                </Button>
              </Tooltip>
            </div>
            
            {/* Tooltip com conteúdo rico */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Conteúdo Rico</h3>
              <Tooltip 
                content={
                  <div className="space-y-1">
                    <div className="font-semibold">Configurações</div>
                    <div className="text-xs opacity-90">
                      Acesse as configurações do sistema
                    </div>
                  </div>
                }
                variant="light"
              >
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Rich Content
                </Button>
              </Tooltip>
            </div>
            
            {/* Tooltip desabilitado */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Desabilitado</h3>
              <Tooltip 
                content="Este tooltip não aparece" 
                disabled
              >
                <Button variant="outline" className="w-full" disabled>
                  <User className="w-4 h-4 mr-2" />
                  Disabled
                </Button>
              </Tooltip>
            </div>
          </div>
        </Card>

        {/* Seção: Casos de Uso Práticos */}
        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Casos de Uso Práticos
          </h2>
          
          {/* Barra de ferramentas */}
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Barra de Ferramentas</h3>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <Tooltip content="Editar item" position="bottom">
                  <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                </Tooltip>
                
                <Tooltip content="Visualizar detalhes" position="bottom">
                  <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                </Tooltip>
                
                <Tooltip content="Fazer download" position="bottom">
                  <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                </Tooltip>
                
                <Tooltip content="Excluir permanentemente" variant="error" position="bottom">
                  <button className="p-2 hover:bg-red-100 rounded transition-colors">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </Tooltip>
              </div>
            </div>
            
            {/* Ícones informativos */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Ícones Informativos</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700">Status do Sistema</span>
                  <Tooltip 
                    content="Sistema funcionando normalmente. Última verificação: há 2 minutos"
                    variant="success"
                  >
                    <Info className="w-4 h-4 text-green-600 cursor-help" />
                  </Tooltip>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700">Configuração Avançada</span>
                  <Tooltip 
                    content={
                      <div className="space-y-2">
                        <div className="font-semibold">Configurações Avançadas</div>
                        <div className="text-xs space-y-1">
                          <div>• Requer permissões de administrador</div>
                          <div>• Pode afetar o desempenho do sistema</div>
                          <div>• Recomendado apenas para usuários experientes</div>
                        </div>
                      </div>
                    }
                    variant="warning"
                    position="right"
                  >
                    <Info className="w-4 h-4 text-yellow-600 cursor-help" />
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Seção: Demonstração Interativa */}
        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Demonstração Interativa
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-600 mb-4">
              Mova o mouse pelos elementos abaixo para ver os tooltips em ação:
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {Array.from({ length: 12 }, (_, i) => (
                <Tooltip 
                  key={i}
                  content={`Tooltip ${i + 1}: Posicionamento automático`}
                  position="auto"
                  variant={['default', 'success', 'warning', 'error'][i % 4] as any}
                >
                  <div className="aspect-square bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center hover:border-blue-300 transition-colors cursor-pointer">
                    <span className="text-sm font-medium text-gray-600">{i + 1}</span>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}