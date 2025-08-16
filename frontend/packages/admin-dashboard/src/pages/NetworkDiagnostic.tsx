import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@safeguard/shared-ui';
import { 
  Wifi, 
  Server, 
  Globe, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Activity,
  Clock,
  Zap
} from 'lucide-react';

/**
 * Página de Diagnóstico de Rede
 * 
 * Funcionalidades:
 * - Verificação de conectividade com blockchain
 * - Status dos nós da rede
 * - Latência e performance
 * - Diagnóstico de carteiras
 * - Logs de conexão
 */
export function NetworkDiagnostic() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Estados de diagnóstico
  const [networkStatus, setNetworkStatus] = useState({
    blockchain: { status: 'connected', latency: 45, blockHeight: 18234567 },
    rpc: { status: 'connected', latency: 23, endpoint: 'wss://mainnet.lunes.io' },
    ipfs: { status: 'connected', latency: 67, peers: 156 },
    wallets: {
      metamask: { status: 'connected', version: '11.2.1' },
      polkadot: { status: 'connected', version: '0.44.1' },
      subwallet: { status: 'disconnected', version: null }
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular verificação de rede
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'disconnected': return AlertCircle;
      case 'warning': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'disconnected': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-[5px]">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Diagnóstico de Rede
            </h1>
            <p className="text-muted-foreground mt-2">
              Status e performance da conectividade
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Blockchain */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Blockchain</h3>
            </div>
            <Badge variant={getStatusBadge(networkStatus.blockchain.status) as any}>
              {networkStatus.blockchain.status === 'connected' ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Latência:</span>
              <span className="font-medium">{networkStatus.blockchain.latency}ms</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bloco:</span>
              <span className="font-medium">{networkStatus.blockchain.blockHeight.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* RPC */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Server className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="font-semibold text-foreground">RPC Node</h3>
            </div>
            <Badge variant={getStatusBadge(networkStatus.rpc.status) as any}>
              {networkStatus.rpc.status === 'connected' ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Latência:</span>
              <span className="font-medium">{networkStatus.rpc.latency}ms</span>
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {networkStatus.rpc.endpoint}
            </div>
          </div>
        </Card>

        {/* IPFS */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-full">
                <Wifi className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="font-semibold text-foreground">IPFS</h3>
            </div>
            <Badge variant={getStatusBadge(networkStatus.ipfs.status) as any}>
              {networkStatus.ipfs.status === 'connected' ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Latência:</span>
              <span className="font-medium">{networkStatus.ipfs.latency}ms</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Peers:</span>
              <span className="font-medium">{networkStatus.ipfs.peers}</span>
            </div>
          </div>
        </Card>

        {/* Performance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-full">
                <Zap className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="font-semibold text-foreground">Performance</h3>
            </div>
            <Badge variant="default">Ótima</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">TPS:</span>
              <span className="font-medium">1,247</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gas Price:</span>
              <span className="font-medium">15 Gwei</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Status das Carteiras */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Status das Carteiras
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(networkStatus.wallets).map(([wallet, info]) => {
            const StatusIcon = getStatusIcon(info.status);
            return (
              <div key={wallet} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <StatusIcon className={`w-5 h-5 ${getStatusColor(info.status)}`} />
                  <div>
                    <h3 className="font-medium text-foreground capitalize">
                      {wallet}
                    </h3>
                    {info.version && (
                      <p className="text-sm text-muted-foreground">
                        v{info.version}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={getStatusBadge(info.status) as any}>
                  {info.status === 'connected' ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Logs de Rede */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Logs de Rede
        </h2>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {[
            { time: '14:32:15', type: 'success', message: 'Conexão com blockchain estabelecida' },
            { time: '14:31:45', type: 'info', message: 'Sincronizando com nó RPC...' },
            { time: '14:31:20', type: 'warning', message: 'Latência alta detectada (>100ms)' },
            { time: '14:30:55', type: 'success', message: 'MetaMask conectado com sucesso' },
            { time: '14:30:30', type: 'error', message: 'Falha na conexão com SubWallet' },
            { time: '14:30:10', type: 'info', message: 'Iniciando diagnóstico de rede...' }
          ].map((log, index) => {
            const getLogColor = (type: string) => {
              switch (type) {
                case 'success': return 'text-green-500';
                case 'error': return 'text-red-500';
                case 'warning': return 'text-yellow-500';
                case 'info': return 'text-blue-500';
                default: return 'text-muted-foreground';
              }
            };

            return (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground font-mono">
                    {log.time}
                  </span>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getLogColor(log.type).replace('text-', 'bg-')}`} />
                <span className="text-foreground">{log.message}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}