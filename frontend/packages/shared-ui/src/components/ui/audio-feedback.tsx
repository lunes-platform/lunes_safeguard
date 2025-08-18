"use client"

import React, { useCallback, useRef, useEffect } from 'react'

export type SoundType = 
  | 'click' 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'notification'
  | 'hover'
  | 'focus'
  | 'toggle'
  | 'swipe'
  | 'pop'

export interface AudioFeedbackProps {
  /** Tipo de som a ser reproduzido */
  soundType: SoundType
  /** Volume do som (0 a 1) */
  volume?: number
  /** Se o som está habilitado */
  enabled?: boolean
  /** Callback quando o som termina */
  onSoundEnd?: () => void
}

/**
 * Hook para controle de feedback sonoro
 * Permite reproduzir sons de forma programática
 */
export const useAudioFeedback = (enabled: boolean = true) => {
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  useEffect(() => {
    if (enabled && typeof window !== 'undefined') {
      // Inicializa o AudioContext apenas quando necessário
      const initAudioContext = () => {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
          gainNodeRef.current = audioContextRef.current.createGain()
          gainNodeRef.current.connect(audioContextRef.current.destination)
        }
      }

      // Inicializa no primeiro clique do usuário (política do navegador)
      const handleFirstInteraction = () => {
        initAudioContext()
        document.removeEventListener('click', handleFirstInteraction)
        document.removeEventListener('keydown', handleFirstInteraction)
      }

      document.addEventListener('click', handleFirstInteraction)
      document.addEventListener('keydown', handleFirstInteraction)

      return () => {
        document.removeEventListener('click', handleFirstInteraction)
        document.removeEventListener('keydown', handleFirstInteraction)
      }
    }
  }, [enabled])

  const generateTone = useCallback((frequency: number, duration: number, volume: number = 0.1) => {
    if (!enabled || !audioContextRef.current || !gainNodeRef.current) return

    const oscillator = audioContextRef.current.createOscillator()
    const envelope = audioContextRef.current.createGain()
    
    oscillator.connect(envelope)
    envelope.connect(gainNodeRef.current)
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
    oscillator.type = 'sine'
    
    // Envelope ADSR simples
    envelope.gain.setValueAtTime(0, audioContextRef.current.currentTime)
    envelope.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01)
    envelope.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration)
    
    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + duration)
  }, [enabled])

  const playSound = useCallback((soundType: SoundType, volume: number = 0.1) => {
    if (!enabled) return

    switch (soundType) {
      case 'click':
        generateTone(800, 0.1, volume * 0.3)
        break
      case 'success':
        generateTone(523, 0.1, volume * 0.4) // C5
        setTimeout(() => generateTone(659, 0.1, volume * 0.4), 100) // E5
        setTimeout(() => generateTone(784, 0.15, volume * 0.4), 200) // G5
        break
      case 'error':
        generateTone(300, 0.2, volume * 0.5)
        setTimeout(() => generateTone(250, 0.2, volume * 0.5), 150)
        break
      case 'warning':
        generateTone(440, 0.1, volume * 0.4) // A4
        setTimeout(() => generateTone(440, 0.1, volume * 0.4), 200)
        break
      case 'notification':
        generateTone(880, 0.1, volume * 0.3) // A5
        setTimeout(() => generateTone(1108, 0.15, volume * 0.3), 100) // C#6
        break
      case 'hover':
        generateTone(1000, 0.05, volume * 0.2)
        break
      case 'focus':
        generateTone(600, 0.08, volume * 0.25)
        break
      case 'toggle':
        generateTone(700, 0.1, volume * 0.3)
        setTimeout(() => generateTone(500, 0.1, volume * 0.3), 80)
        break
      case 'swipe':
        generateTone(400, 0.05, volume * 0.2)
        setTimeout(() => generateTone(600, 0.05, volume * 0.2), 50)
        setTimeout(() => generateTone(800, 0.05, volume * 0.2), 100)
        break
      case 'pop':
        generateTone(1200, 0.08, volume * 0.4)
        break
    }
  }, [enabled, generateTone])

  return { playSound }
}

/**
 * Componente wrapper que adiciona feedback sonoro a elementos filhos
 */
export interface SoundWrapperProps {
  children: React.ReactNode
  /** Tipo de som para clique */
  clickSound?: SoundType
  /** Tipo de som para hover */
  hoverSound?: SoundType
  /** Tipo de som para focus */
  focusSound?: SoundType
  /** Volume dos sons */
  volume?: number
  /** Se o feedback sonoro está habilitado */
  enabled?: boolean
  /** Classe CSS adicional */
  className?: string
}

export const SoundWrapper: React.FC<SoundWrapperProps> = ({
  children,
  clickSound,
  hoverSound,
  focusSound,
  volume = 0.1,
  enabled = true,
  className
}) => {
  const { playSound } = useAudioFeedback(enabled)

  const handleClick = useCallback(() => {
    if (clickSound) {
      playSound(clickSound, volume)
    }
  }, [clickSound, playSound, volume])

  const handleMouseEnter = useCallback(() => {
    if (hoverSound) {
      playSound(hoverSound, volume)
    }
  }, [hoverSound, playSound, volume])

  const handleFocus = useCallback(() => {
    if (focusSound) {
      playSound(focusSound, volume)
    }
  }, [focusSound, playSound, volume])

  return (
    <div
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
    >
      {children}
    </div>
  )
}

/**
 * Componente de botão com feedback sonoro integrado
 */
export interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Tipo de som para clique */
  clickSound?: SoundType
  /** Tipo de som para hover */
  hoverSound?: SoundType
  /** Volume dos sons */
  volume?: number
  /** Se o feedback sonoro está habilitado */
  soundEnabled?: boolean
  /** Variante visual do botão */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg'
}

export const SoundButton: React.FC<SoundButtonProps> = ({
  children,
  clickSound = 'click',
  hoverSound = 'hover',
  volume = 0.1,
  soundEnabled = true,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  onMouseEnter,
  ...props
}) => {
  const { playSound } = useAudioFeedback(soundEnabled)

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (soundEnabled && clickSound) {
      playSound(clickSound, volume)
    }
    onClick?.(e)
  }, [clickSound, playSound, volume, soundEnabled, onClick])

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (soundEnabled && hoverSound) {
      playSound(hoverSound, volume)
    }
    onMouseEnter?.(e)
  }, [hoverSound, playSound, volume, soundEnabled, onMouseEnter])

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white'
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white'
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white'
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white'
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'lg':
        return 'px-6 py-3 text-lg'
      default:
        return 'px-4 py-2 text-base'
    }
  }

  return (
    <button
      {...props}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-md
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className || ''}
      `}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </button>
  )
}

/**
 * Provider de contexto para configurações globais de áudio
 */
export interface AudioSettingsContextType {
  enabled: boolean
  volume: number
  setEnabled: (enabled: boolean) => void
  setVolume: (volume: number) => void
}

const AudioSettingsContext = React.createContext<AudioSettingsContextType | null>(null)

export interface AudioSettingsProviderProps {
  children: React.ReactNode
  defaultEnabled?: boolean
  defaultVolume?: number
}

export const AudioSettingsProvider: React.FC<AudioSettingsProviderProps> = ({
  children,
  defaultEnabled = true,
  defaultVolume = 0.1
}) => {
  const [enabled, setEnabled] = React.useState(defaultEnabled)
  const [volume, setVolume] = React.useState(defaultVolume)

  const value = React.useMemo(() => ({
    enabled,
    volume,
    setEnabled,
    setVolume
  }), [enabled, volume])

  return (
    <AudioSettingsContext.Provider value={value}>
      {children}
    </AudioSettingsContext.Provider>
  )
}

/**
 * Hook para acessar as configurações de áudio
 */
export const useAudioSettings = () => {
  const context = React.useContext(AudioSettingsContext)
  if (!context) {
    throw new Error('useAudioSettings deve ser usado dentro de AudioSettingsProvider')
  }
  return context
}

export default useAudioFeedback