import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Wallet, Plus, Shield, TrendingUp, Users, Clock, Settings, BarChart3, ArrowRight, Search } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Badge } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data para demonstração
const mockProjects = [
  {
    id: 1,
    name: 'Projeto Alpha',
    status: 'active',
    totalGuarantee: 150000,
    score: 85,
    nextVoting: '2025-02-15'
  },
  {
    id: 2,
    name: 'Projeto Beta',
    status: 'voting',
    totalGuarantee: 89000,
    score: 72,
    nextVoting: '2025-01-30'
  }
];

const mockStats = {
  totalProjects: 12,
  totalGuarantees: 2450000,
  activeVotings: 3,
  avgScore: 78
};

export default function AdminAccess() {
  // const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showAddGuarantee, setShowAddGuarantee] = useState(false);
  const [newGuarantee, setNewGuarantee] = useState({
    projectName: '',
    lunesAmount: '',
    lusdtAmount: '',
    description: ''
  });

  const handleConnectWallet = () => {
    // Mock wallet connection
    setIsConnected(true);
    setWalletAddress('lunes1abc...xyz789');
  };

  const handleAddGuarantee = () => {
    // Mock add guarantee logic
    console.log('Adicionando garantia:', newGuarantee);
    setShowAddGuarantee(false);
    setNewGuarantee({ projectName: '', lunesAmount: '', lusdtAmount: '', description: '' });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Ativo', variant: 'success' as const },
      voting: { label: 'Em Votação', variant: 'warning' as const },
      locked: { label: 'Bloqueado', variant: 'secondary' as const }
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  return (
    <main className="min-h-screen bg-lunes-dark text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lunes-purple/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
      </div>

      <Helmet>
        <title>Acesso Admin — SafeGard</title>
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="/acesso-admin" />
      </Helmet>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-lunes-purple to-lunes-purple-dark rounded-2xl flex items-center justify-center shadow-lg shadow-lunes-purple/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Admin Terminal</h1>
              <p className="text-neutral-400 font-medium">Controle central de segurança do protocolo SafeGard</p>
            </div>
          </div>
        </motion.div>

        {!isConnected ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-20 relative"
          >
            {/* Background High-Tech Elements */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                className="absolute w-[600px] h-[600px] bg-lunes-purple/5 rounded-full blur-[100px]"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(10,10,12,0.9)_70%)] z-10" />
              <div className="w-full h-full opacity-20 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M0%2020%20L40%2020%20M20%200%20L20%2040%22%20stroke%3D%22%236d28d9%22%20stroke-width%3D%220.5%22%20fill%3D%22none%22%20opacity%3D%220.3%22/%3E%3C/svg%3E')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
            </div>

            <Card className="max-w-md w-full bg-white/5 backdrop-blur-2xl border-white/10 shadow-[0_0_50px_rgba(109,40,217,0.15)] overflow-hidden relative group z-20">
              <div className="absolute inset-0 bg-gradient-to-br from-lunes-purple/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Animated corner borders */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-lunes-purple opacity-40 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-lunes-purple opacity-40 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-lunes-purple opacity-40 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-lunes-purple opacity-40 group-hover:opacity-100 transition-opacity" />

              <CardHeader className="text-center relative z-10 pt-10">
                <motion.div
                  initial={{ rotate: -10, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="w-20 h-20 bg-gradient-to-br from-lunes-purple/20 to-lunes-purple/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10 relative group-hover:shadow-[0_0_30px_rgba(109,40,217,0.3)] transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-lunes-purple/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
                  <Shield className="w-10 h-10 text-lunes-purple relative z-10" />

                  {/* Scanning Effect */}
                  <motion.div
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-0.5 bg-lunes-light/50 z-20 blur-[1px]"
                  />
                </motion.div>

                <CardTitle className="text-3xl font-black text-white mb-2 tracking-tight">
                  Terminal <span className="text-lunes-purple">Encerrado</span>
                </CardTitle>
                <CardDescription className="text-neutral-400 px-4">
                  O acesso ao núcleo administrativo exige assinatura criptográfica de nível 4.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 pb-10 px-8">
                <Button
                  onClick={handleConnectWallet}
                  className="w-full bg-lunes-purple hover:bg-lunes-purple-dark text-white h-14 text-lg font-bold shadow-[0_10px_30px_rgba(109,40,217,0.3)] transition-all duration-500 rounded-xl flex items-center justify-center group/btn overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                  <Wallet className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                  Autenticar Operador
                </Button>

                <p className="mt-6 text-center text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium">
                  SafeGard Protocol v2.5.0 • Biometric Bypass Disabled
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-8 relative z-10">
            {/* Wallet Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/20">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-xs uppercase tracking-widest font-bold">Admin Ident</span>
                    <div className="flex items-center gap-2">
                      <code className="text-lunes-purple font-mono text-sm">{walletAddress}</code>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Online</Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConnected(false)}
                  className="border-white/10 text-white hover:bg-white/10 rounded-xl px-6 h-10"
                >
                  Sair do Terminal
                </Button>
              </div>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Projetos Ativos', value: mockStats.totalProjects, icon: Shield, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { label: 'Total em Garantias', value: `${formatCurrency(mockStats.totalGuarantees, 'LUNES')}`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
                { label: 'Votações Ativas', value: mockStats.activeVotings, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                { label: 'Score Médio', value: mockStats.avgScore, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (idx * 0.05) }}
                >
                  <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300 group">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center border border-current opacity-70 group-hover:opacity-100 transition-opacity`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                          <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">{stat.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions Control Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Manage Projects Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-white/5 border-white/10 overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-lunes-purple" />
                            Managed Systems
                          </CardTitle>
                          <CardDescription className="text-neutral-500">
                            Monitoramento em tempo real dos protocolos sob custódia
                          </CardDescription>
                        </div>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                          <Input className="bg-white/5 border-white/10 pl-9 w-[200px] h-9 text-sm rounded-xl focus:ring-lunes-purple/50" placeholder="Filtrar sistemas..." />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-white/5">
                        {mockProjects.map((project, idx) => {
                          const statusInfo = getStatusBadge(project.status);
                          return (
                            <motion.div
                              key={project.id}
                              className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors group"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 + (idx * 0.1) }}
                            >
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-lunes-purple/30 transition-all">
                                  <div className="text-lunes-purple font-bold text-lg">{project.name.charAt(0)}</div>
                                </div>
                                <div>
                                  <h3 className="font-bold text-white group-hover:text-lunes-light transition-colors">{project.name}</h3>
                                  <div className="flex items-center gap-4 mt-1">
                                    <div className="flex items-center gap-1.5">
                                      <TrendingUp className="w-3.5 h-3.5 text-neutral-500" />
                                      <span className="text-xs text-neutral-400 font-mono">
                                        {formatCurrency(project.totalGuarantee, 'LUNES')}
                                      </span>
                                    </div>
                                    <Badge className={`bg-${statusInfo.variant}-500/10 text-${statusInfo.variant}-400 border-${statusInfo.variant}-500/20 text-[10px] uppercase font-bold py-0.5`}>
                                      {statusInfo.label}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-8">
                                <div className="text-right flex flex-col items-end">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-neutral-500 text-[10px] uppercase font-bold">Reliability Score</span>
                                    <div className={`w-2 h-2 rounded-full ${project.score > 80 ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-yellow-500 shadow-lg shadow-yellow-500/50'}`}></div>
                                  </div>
                                  <div className="text-xl font-black text-white">{project.score}</div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-lunes-purple/20 text-white hover:text-white border border-white/5">
                                  <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                                </Button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="space-y-8">
                {/* Action Panel */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="bg-lunes-purple border-none shadow-2xl shadow-lunes-purple/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Nova Operação
                      </CardTitle>
                      <CardDescription className="text-white/70">
                        Injetar nova garantia ou expandir protocolo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => setShowAddGuarantee(!showAddGuarantee)}
                        className="w-full bg-white text-lunes-purple hover:bg-neutral-100 font-bold h-11 rounded-xl shadow-lg"
                      >
                        {showAddGuarantee ? 'Cancelar Operação' : 'Iniciar Injeção'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <AnimatePresence>
                  {showAddGuarantee && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                        <CardContent className="pt-6 space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase">Nome do Projeto</label>
                            <Input
                              className="bg-white/5 border-white/10 rounded-xl text-white h-11 focus:ring-lunes-purple/50"
                              placeholder="Ex: Lunes DEX Core"
                              value={newGuarantee.projectName}
                              onChange={(e) => setNewGuarantee({ ...newGuarantee, projectName: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-neutral-500 uppercase">Quant. LUNES</label>
                              <Input
                                type="number"
                                className="bg-white/5 border-white/10 rounded-xl text-white h-11"
                                placeholder="10K"
                                value={newGuarantee.lunesAmount}
                                onChange={(e) => setNewGuarantee({ ...newGuarantee, lunesAmount: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-neutral-500 uppercase">Quant. LUSDT</label>
                              <Input
                                type="number"
                                className="bg-white/5 border-white/10 rounded-xl text-white h-11"
                                placeholder="1K"
                                value={newGuarantee.lusdtAmount}
                                onChange={(e) => setNewGuarantee({ ...newGuarantee, lusdtAmount: e.target.value })}
                              />
                            </div>
                          </div>
                          <Button
                            onClick={handleAddGuarantee}
                            disabled={!newGuarantee.projectName || !newGuarantee.lunesAmount}
                            className="w-full bg-white/10 border border-white/10 hover:bg-white/20 text-white font-bold h-11 rounded-xl"
                          >
                            Validar e Adicionar
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* System Shortcuts */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-1">Acessos Rápidos</h4>
                  {[
                    { label: 'Depósitos de Garantia', icon: Shield, to: '/admin/depositos', desc: 'Gerenciar histórico de fundos' },
                    { label: 'Votações & Propostas', icon: Users, to: '/admin/votacoes', desc: 'Controle de governança ativa' },
                    { label: 'Relatórios Médios', icon: TrendingUp, to: '/admin/relatorios', desc: 'Análise de performance' }
                  ].map((link, idx) => (
                    <Link key={idx} to={link.to} className="block group">
                      <Card className="bg-white/5 border-white/10 group-hover:bg-white/10 transition-all duration-300">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-lunes-purple/10 rounded-xl flex items-center justify-center border border-lunes-purple/20">
                              <link.icon className="w-5 h-5 text-lunes-purple" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-white">{link.label}</p>
                              <p className="text-[10px] text-neutral-500 font-medium">{link.desc}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-lunes-light group-hover:translate-x-1 transition-all" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}