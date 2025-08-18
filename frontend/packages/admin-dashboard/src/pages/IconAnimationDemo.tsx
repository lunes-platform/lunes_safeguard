import React, { useState } from 'react';
import {
  IconAnimation,
  AnimatedIcon,
  AnimatedNotification,
  useIconAnimation,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../shared-ui/src';
import {
  Heart,
  Star,
  Bell,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  Wifi,
  Battery,
  Signal,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Settings,
  Search,
  Mail,
  Phone,
  MessageCircle,
  ThumbsUp,
  Share,
  Bookmark,
  Eye,
  EyeOff,
} from 'lucide-react';

export function IconAnimationDemo() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>>([]);

  const { startAnimation: triggerHeartbeat, stopAnimation: stopHeartbeat } = useIconAnimation();
  const { startAnimation: triggerBounce, stopAnimation: stopBounce } = useIconAnimation();
  const { startAnimation: triggerPulse, stopAnimation: stopPulse } = useIconAnimation();

  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const animationTypes = [
    { name: 'pulse', icon: <Heart className="w-6 h-6" />, color: '#ef4444' },
    { name: 'bounce', icon: <Star className="w-6 h-6" />, color: '#f59e0b' },
    { name: 'shake', icon: <Bell className="w-6 h-6" />, color: '#3b82f6' },
    { name: 'rotate', icon: <RefreshCw className="w-6 h-6" />, color: '#10b981' },
    { name: 'swing', icon: <Settings className="w-6 h-6" />, color: '#8b5cf6' },
    { name: 'heartbeat', icon: <Heart className="w-6 h-6" />, color: '#ec4899' },
    { name: 'flash', icon: <Download className="w-6 h-6" />, color: '#06b6d4' },
    { name: 'wobble', icon: <Upload className="w-6 h-6" />, color: '#84cc16' },
    { name: 'tada', icon: <CheckCircle className="w-6 h-6" />, color: '#22c55e' },
    { name: 'jello', icon: <Star className="w-6 h-6" />, color: '#f97316' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">
            Demonstração de Animações de Ícones
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore diferentes tipos de animações para ícones que melhoram a experiência do usuário
            e fornecem feedback visual interativo.
          </p>
        </div>

        {/* Tipos de Animação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Tipos de Animação
            </CardTitle>
            <CardDescription>
              Clique nos ícones para ver as diferentes animações disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {animationTypes.map(({ name, icon, color }) => (
                <div key={name} className="text-center space-y-2">
                  <div className="flex justify-center">
                    <AnimatedIcon
                      icon={icon}
                      animation={name}
                      animateOnClick={true}
                      size="lg"
                      color={color}
                    />
                  </div>
                  <p className="text-sm font-medium text-slate-700 capitalize">
                    {name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Casos de Uso Práticos */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Interface de Mídia */}
          <Card>
            <CardHeader>
              <CardTitle>Interface de Mídia</CardTitle>
              <CardDescription>
                Animações para controles de reprodução e status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                <AnimatedIcon
                  icon={<Play className="w-8 h-8" />}
                  animation="pulse"
                  animateOnHover={true}
                  size="xl"
                  color="#22c55e"
                />
                <AnimatedIcon
                  icon={<Pause className="w-8 h-8" />}
                  animation="bounce"
                  animateOnHover={true}
                  size="xl"
                  color="#f59e0b"
                />
                <AnimatedIcon
                  icon={<Volume2 className="w-8 h-8" />}
                  animation="swing"
                  animateOnHover={true}
                  size="xl"
                  color="#3b82f6"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <AnimatedIcon
                    icon={<Wifi className="w-5 h-5" />}
                    animation="pulse"
                    autoAnimate={true}
                    color="#10b981"
                  />
                  <span className="text-sm text-slate-600">Conectado</span>
                </div>
                <div className="flex items-center gap-3">
                  <AnimatedIcon
                    icon={<Battery className="w-5 h-5" />}
                    animation="flash"
                    autoAnimate={true}
                    color="#ef4444"
                  />
                  <span className="text-sm text-slate-600">Bateria baixa</span>
                </div>
                <div className="flex items-center gap-3">
                  <AnimatedIcon
                    icon={<Signal className="w-5 h-5" />}
                    animation="bounce"
                    autoAnimate={true}
                    color="#3b82f6"
                  />
                  <span className="text-sm text-slate-600">Sincronizando</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações Sociais */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Sociais</CardTitle>
              <CardDescription>
                Feedback visual para interações do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <AnimatedIcon
                    icon={<ThumbsUp className="w-6 h-6" />}
                    animation="bounce"
                    animateOnClick={true}
                    color="#3b82f6"
                  />
                  <p className="text-xs text-slate-600">Curtir</p>
                </div>
                <div className="text-center space-y-2">
                  <AnimatedIcon
                    icon={<Share className="w-6 h-6" />}
                    animation="swing"
                    animateOnClick={true}
                    color="#10b981"
                  />
                  <p className="text-xs text-slate-600">Compartilhar</p>
                </div>
                <div className="text-center space-y-2">
                  <AnimatedIcon
                    icon={<Bookmark className="w-6 h-6" />}
                    animation="pulse"
                    animateOnClick={true}
                    color="#f59e0b"
                  />
                  <p className="text-xs text-slate-600">Salvar</p>
                </div>
                <div className="text-center space-y-2">
                  <AnimatedIcon
                    icon={<MessageCircle className="w-6 h-6" />}
                    animation="shake"
                    animateOnClick={true}
                    color="#8b5cf6"
                  />
                  <p className="text-xs text-slate-600">Comentar</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => triggerHeartbeat('heartbeat-1')}
                  variant="outline"
                  className="w-full"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Trigger Heartbeat
                </Button>
                <Button
                  onClick={() => triggerBounce('bounce-1')}
                  variant="outline"
                  className="w-full"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Trigger Bounce
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notificações Animadas */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações Animadas</CardTitle>
            <CardDescription>
              Sistema de notificações com ícones animados para diferentes tipos de feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={() => addNotification('success', 'Operação realizada com sucesso!')}
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Sucesso
                </Button>
                <Button
                  onClick={() => addNotification('error', 'Erro ao processar solicitação')}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Erro
                </Button>
                <Button
                  onClick={() => addNotification('warning', 'Atenção: Verifique os dados')}
                  variant="outline"
                  className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Aviso
                </Button>
                <Button
                  onClick={() => addNotification('info', 'Nova atualização disponível')}
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Info
                </Button>
              </div>

              {/* Container de Notificações */}
              <div className="fixed top-4 right-4 space-y-2 z-50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="bg-white border rounded-lg shadow-lg p-4 max-w-sm"
                  >
                    <div className="flex items-center gap-2">
                      <IconAnimation animation="bounce" animate={true}>
                        {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {notification.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                        {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                        {notification.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                      </IconAnimation>
                      <span className="text-sm text-slate-700">{notification.message}</span>
                      <button
                        onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                        className="ml-auto text-slate-400 hover:text-slate-600"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controles Programáticos */}
        <Card>
          <CardHeader>
            <CardTitle>Controles Programáticos</CardTitle>
            <CardDescription>
              Use o hook useIconAnimation para controlar animações via código
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center space-y-2">
                  <IconAnimation animation="pulse" animate={true}>
                    <Search className="w-8 h-8 text-blue-500" />
                  </IconAnimation>
                  <p className="text-sm text-slate-600">Buscando...</p>
                </div>
                <div className="text-center space-y-2">
                  <IconAnimation animation="rotate" animate={true}>
                    <RefreshCw className="w-8 h-8 text-green-500" />
                  </IconAnimation>
                  <p className="text-sm text-slate-600">Atualizando...</p>
                </div>
                <div className="text-center space-y-2">
                  <IconAnimation animation="bounce" animate={true}>
                    <Mail className="w-8 h-8 text-purple-500" />
                  </IconAnimation>
                  <p className="text-sm text-slate-600">Nova mensagem</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => triggerPulse('pulse-1')}
                  className="w-full"
                >
                  Trigger Pulse Animation
                </Button>
                <Button
                  onClick={() => {
                    // Simular múltiplas animações
                    triggerBounce('bounce-2');
                    setTimeout(() => triggerHeartbeat('heartbeat-2'), 500);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Sequência de Animações
                </Button>
                <Button
                  onClick={() => {
                    // Trigger todas as animações
                    setTimeout(() => triggerPulse('pulse-3'), 0);
                    setTimeout(() => triggerBounce('bounce-3'), 200);
                    setTimeout(() => triggerHeartbeat('heartbeat-3'), 400);
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  Todas as Animações
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estados de Visibilidade */}
        <Card>
          <CardHeader>
            <CardTitle>Estados de Visibilidade</CardTitle>
            <CardDescription>
              Animações para mostrar/ocultar elementos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              <AnimatedIcon
                icon={<Eye className="w-6 h-6" />}
                animation="pulse"
                animateOnHover={true}
                color="#10b981"
              />
              <AnimatedIcon
                icon={<EyeOff className="w-6 h-6" />}
                animation="flash"
                animateOnHover={true}
                color="#ef4444"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}