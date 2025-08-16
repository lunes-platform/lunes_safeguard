import React from 'react';
import { Card, Button, Badge } from '@safeguard/shared-ui';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  Globe,
} from 'lucide-react';

/**
 * Página de Configurações do Sistema
 * 
 * Funcionalidades:
 * - Configurações gerais do sistema
 * - Configurações de segurança
 * - Preferências de notificação
 * - Configurações de aparência
 * - Configurações de rede
 */
export function Settings() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações do sistema SafeGuard
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações Gerais */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <SettingsIcon className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Configurações Gerais
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Nome do Sistema</p>
                <p className="text-sm text-muted-foreground">
                  SafeGuard Admin Dashboard
                </p>
              </div>
              <Button variant="outline" size="sm">
                Editar
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Versão</p>
                <p className="text-sm text-muted-foreground">v1.0.0</p>
              </div>
              <Badge variant="default">Atual</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Modo de Desenvolvimento</p>
                <p className="text-sm text-muted-foreground">
                  Ativar recursos de debug
                </p>
              </div>
              <Button variant="outline" size="sm">
                Desabilitado
              </Button>
            </div>
          </div>
        </Card>

        {/* Configurações de Segurança */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-500/10 rounded-full">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Segurança
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Autenticação 2FA</p>
                <p className="text-sm text-muted-foreground">
                  Autenticação de dois fatores
                </p>
              </div>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Sessões Ativas</p>
                <p className="text-sm text-muted-foreground">
                  Gerenciar sessões de login
                </p>
              </div>
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Logs de Auditoria</p>
                <p className="text-sm text-muted-foreground">
                  Histórico de ações administrativas
                </p>
              </div>
              <Button variant="outline" size="sm">
                Visualizar
              </Button>
            </div>
          </div>
        </Card>

        {/* Configurações de Notificação */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-full">
              <Bell className="h-5 w-5 text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Notificações
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">
                  Notificações por email
                </p>
              </div>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Push</p>
                <p className="text-sm text-muted-foreground">
                  Notificações push no navegador
                </p>
              </div>
              <Badge variant="secondary">Inativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Alertas de Sistema</p>
                <p className="text-sm text-muted-foreground">
                  Alertas críticos do sistema
                </p>
              </div>
              <Badge variant="default">Ativo</Badge>
            </div>
          </div>
        </Card>

        {/* Configurações de Aparência */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-full">
              <Palette className="h-5 w-5 text-purple-500" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Aparência
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Tema</p>
                <p className="text-sm text-muted-foreground">
                  Modo claro ou escuro
                </p>
              </div>
              <Button variant="outline" size="sm">
                Sistema
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Idioma</p>
                <p className="text-sm text-muted-foreground">
                  Idioma da interface
                </p>
              </div>
              <Button variant="outline" size="sm">
                Português
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Densidade</p>
                <p className="text-sm text-muted-foreground">
                  Espaçamento da interface
                </p>
              </div>
              <Button variant="outline" size="sm">
                Confortável
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Configurações Avançadas */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Configurações Avançadas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rede */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Rede</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">RPC URL:</span>
                <span className="font-medium">Mainnet</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Chain ID:</span>
                <span className="font-medium">1</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Configurar
            </Button>
          </div>

          {/* API Keys */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-yellow-500" />
              <h3 className="font-medium text-foreground">API Keys</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Admin API:</span>
                <Badge variant="default">Ativa</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Webhook:</span>
                <Badge variant="secondary">Inativa</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Gerenciar
            </Button>
          </div>

          {/* Backup */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-500" />
              <h3 className="font-medium text-foreground">Backup</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Último:</span>
                <span className="font-medium">Hoje</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Automático:</span>
                <Badge variant="default">Ativo</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Configurar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}