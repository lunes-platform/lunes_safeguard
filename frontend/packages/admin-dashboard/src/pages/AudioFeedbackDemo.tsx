import React, { useState } from 'react'
import {
  useAudioFeedback,
  SoundWrapper,
  SoundButton,
  AudioSettingsProvider,
  useAudioSettings,
  SoundType
} from '../../../shared-ui/src'
import { 
  Play, 
  Volume2, 
  VolumeX, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Bell,
  MousePointer,
  Focus,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  Zap
} from 'lucide-react'

/**
 * Componente de controle de configurações de áudio
 */
const AudioControls: React.FC = () => {
  const { enabled, volume, setEnabled, setVolume } = useAudioSettings()

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Configurações de Áudio
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium">
            {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            Feedback Sonoro
          </label>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${enabled ? 'bg-blue-600' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${enabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Volume: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            disabled={!enabled}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Componente de teste de sons individuais
 */
const SoundTester: React.FC = () => {
  const { enabled, volume } = useAudioSettings()
  const { playSound } = useAudioFeedback(enabled)

  const sounds: { type: SoundType; label: string; icon: React.ReactNode; description: string }[] = [
    { type: 'click', label: 'Click', icon: <MousePointer className="w-4 h-4" />, description: 'Som de clique básico' },
    { type: 'success', label: 'Sucesso', icon: <CheckCircle className="w-4 h-4" />, description: 'Melodia de sucesso' },
    { type: 'error', label: 'Erro', icon: <XCircle className="w-4 h-4" />, description: 'Som de erro/falha' },
    { type: 'warning', label: 'Aviso', icon: <AlertTriangle className="w-4 h-4" />, description: 'Som de alerta' },
    { type: 'notification', label: 'Notificação', icon: <Bell className="w-4 h-4" />, description: 'Som de notificação' },
    { type: 'hover', label: 'Hover', icon: <MousePointer className="w-4 h-4" />, description: 'Som sutil de hover' },
    { type: 'focus', label: 'Focus', icon: <Focus className="w-4 h-4" />, description: 'Som de foco em elemento' },
    { type: 'toggle', label: 'Toggle', icon: <ToggleLeft className="w-4 h-4" />, description: 'Som de alternância' },
    { type: 'swipe', label: 'Swipe', icon: <ArrowRight className="w-4 h-4" />, description: 'Som de deslizar' },
    { type: 'pop', label: 'Pop', icon: <Zap className="w-4 h-4" />, description: 'Som de pop/destaque' }
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Play className="w-5 h-5" />
        Teste de Sons
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sounds.map((sound) => (
          <button
            key={sound.type}
            onClick={() => playSound(sound.type, volume)}
            disabled={!enabled}
            className="
              flex items-center gap-3 p-3 rounded-lg border
              hover:bg-gray-50 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              text-left
            "
          >
            <div className="flex-shrink-0 text-blue-600">
              {sound.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{sound.label}</div>
              <div className="text-xs text-gray-500 truncate">{sound.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Componente de demonstração de botões com som
 */
const SoundButtonDemo: React.FC = () => {
  const { enabled, volume } = useAudioSettings()
  const [count, setCount] = useState(0)
  const [toggle, setToggle] = useState(false)

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Botões com Feedback Sonoro</h3>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <SoundButton
            variant="primary"
            clickSound="click"
            hoverSound="hover"
            volume={volume}
            soundEnabled={enabled}
            onClick={() => setCount(c => c + 1)}
          >
            Clique Simples ({count})
          </SoundButton>
          
          <SoundButton
            variant="success"
            clickSound="success"
            hoverSound="hover"
            volume={volume}
            soundEnabled={enabled}
          >
            Sucesso
          </SoundButton>
          
          <SoundButton
            variant="error"
            clickSound="error"
            hoverSound="hover"
            volume={volume}
            soundEnabled={enabled}
          >
            Erro
          </SoundButton>
          
          <SoundButton
            variant="warning"
            clickSound="warning"
            hoverSound="hover"
            volume={volume}
            soundEnabled={enabled}
          >
            Aviso
          </SoundButton>
        </div>
        
        <div className="flex items-center gap-3">
          <SoundButton
            variant={toggle ? 'success' : 'secondary'}
            clickSound="toggle"
            hoverSound="hover"
            volume={volume}
            soundEnabled={enabled}
            onClick={() => setToggle(!toggle)}
            className="flex items-center gap-2"
          >
            {toggle ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            Toggle: {toggle ? 'ON' : 'OFF'}
          </SoundButton>
        </div>
      </div>
    </div>
  )
}

/**
 * Componente de demonstração de wrapper sonoro
 */
const SoundWrapperDemo: React.FC = () => {
  const { enabled, volume } = useAudioSettings()

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Elementos com SoundWrapper</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SoundWrapper
          clickSound="pop"
          hoverSound="hover"
          volume={volume}
          enabled={enabled}
          className="
            p-4 border-2 border-dashed border-gray-300 rounded-lg
            hover:border-blue-400 hover:bg-blue-50
            cursor-pointer transition-all
            text-center
          "
        >
          <div className="text-blue-600 mb-2">
            <Zap className="w-8 h-8 mx-auto" />
          </div>
          <div className="font-medium">Clique para Pop</div>
          <div className="text-sm text-gray-500">Hover para som sutil</div>
        </SoundWrapper>
        
        <SoundWrapper
          clickSound="notification"
          hoverSound="hover"
          volume={volume}
          enabled={enabled}
          className="
            p-4 border-2 border-dashed border-gray-300 rounded-lg
            hover:border-green-400 hover:bg-green-50
            cursor-pointer transition-all
            text-center
          "
        >
          <div className="text-green-600 mb-2">
            <Bell className="w-8 h-8 mx-auto" />
          </div>
          <div className="font-medium">Clique para Notificação</div>
          <div className="text-sm text-gray-500">Som de notificação</div>
        </SoundWrapper>
      </div>
    </div>
  )
}

/**
 * Componente de casos de uso práticos
 */
const PracticalExamples: React.FC = () => {
  const { enabled, volume } = useAudioSettings()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2000)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Casos de Uso Práticos</h3>
      
      <div className="space-y-6">
        {/* Formulário com feedback sonoro */}
        <div>
          <h4 className="font-medium mb-3">Formulário de Login</h4>
          <form onSubmit={handleSubmit} className="space-y-3">
            <SoundWrapper
              focusSound="focus"
              volume={volume}
              enabled={enabled}
            >
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="
                  w-full px-3 py-2 border border-gray-300 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />
            </SoundWrapper>
            
            <SoundWrapper
              focusSound="focus"
              volume={volume}
              enabled={enabled}
            >
              <input
                type="password"
                placeholder="Senha"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="
                  w-full px-3 py-2 border border-gray-300 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />
            </SoundWrapper>
            
            <SoundButton
              type="submit"
              variant={submitted ? 'success' : 'primary'}
              clickSound={submitted ? 'success' : 'click'}
              hoverSound="hover"
              volume={volume}
              soundEnabled={enabled}
              className="w-full"
            >
              {submitted ? 'Enviado!' : 'Entrar'}
            </SoundButton>
          </form>
        </div>
        
        {/* Notificações */}
        <div>
          <h4 className="font-medium mb-3">Sistema de Notificações</h4>
          <div className="flex flex-wrap gap-2">
            <SoundButton
              size="sm"
              variant="success"
              clickSound="success"
              volume={volume}
              soundEnabled={enabled}
            >
              Sucesso
            </SoundButton>
            
            <SoundButton
              size="sm"
              variant="error"
              clickSound="error"
              volume={volume}
              soundEnabled={enabled}
            >
              Erro
            </SoundButton>
            
            <SoundButton
              size="sm"
              variant="warning"
              clickSound="warning"
              volume={volume}
              soundEnabled={enabled}
            >
              Aviso
            </SoundButton>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Página principal de demonstração do feedback sonoro
 */
const AudioFeedbackDemo: React.FC = () => {
  return (
    <AudioSettingsProvider defaultEnabled={true} defaultVolume={0.1}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Sistema de Feedback Sonoro
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Demonstração do sistema de feedback sonoro leve para melhorar a experiência do usuário.
              Sons sutis que fornecem confirmação auditiva para ações importantes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <AudioControls />
            <SoundTester />
          </div>
          
          <div className="space-y-8">
            <SoundButtonDemo />
            <SoundWrapperDemo />
            <PracticalExamples />
          </div>
          
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              💡 Dicas de Implementação
            </h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Use sons sutis e de baixo volume para não incomodar</li>
              <li>• Sempre forneça opção para desabilitar o áudio</li>
              <li>• Diferentes sons para diferentes tipos de ação</li>
              <li>• Considere a acessibilidade e preferências do usuário</li>
              <li>• Teste em diferentes dispositivos e navegadores</li>
            </ul>
          </div>
        </div>
      </div>
    </AudioSettingsProvider>
  )
}

export default AudioFeedbackDemo