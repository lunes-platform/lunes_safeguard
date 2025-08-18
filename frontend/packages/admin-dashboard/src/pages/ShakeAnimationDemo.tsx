import React, { useState } from 'react'
import {
  ShakeAnimation,
  ShakeInput,
  ShakeDemo,
  useShakeAnimation,
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@safeguard/shared-ui'

/**
 * Página de demonstração para Shake Animation
 * Mostra diferentes usos da animação de shake para feedback visual
 */
export const ShakeAnimationDemo: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [demoStates, setDemoStates] = useState({
    input: false,
    button: false,
    card: false
  })

  const { shouldShake, triggerShake } = useShakeAnimation()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      triggerShake()
    } else {
      alert('Formulário válido!')
      setErrors({})
    }
  }

  const toggleDemo = (type: keyof typeof demoStates) => {
    setDemoStates(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Shake Animation Demo
        </h1>
        <p className="text-gray-600">
          Demonstração de animações de shake para feedback visual em campos inválidos e elementos de erro.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Formulário com Validação */}
        <Card>
          <CardHeader>
            <CardTitle>Formulário com Shake Animation</CardTitle>
          </CardHeader>
          <CardContent>
            <ShakeAnimation trigger={shouldShake} intensity={2} direction="horizontal">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <ShakeInput
                    hasError={!!errors.email}
                    errorMessage={errors.email || undefined}
                    shakeIntensity={2}
                  >
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="seu@email.com"
                      className={errors.email ? 'border-red-500 focus:ring-red-500' : ''}
                    />
                  </ShakeInput>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <ShakeInput
                    hasError={!!errors.password}
                    errorMessage={errors.password || undefined}
                    shakeIntensity={3}
                  >
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Sua senha"
                      className={errors.password ? 'border-red-500 focus:ring-red-500' : ''}
                    />
                  </ShakeInput>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Senha
                  </label>
                  <ShakeInput
                    hasError={!!errors.confirmPassword}
                    errorMessage={errors.confirmPassword || undefined}
                    shakeIntensity={4}
                  >
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirme sua senha"
                      className={errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}
                    />
                  </ShakeInput>
                </div>

                <Button type="submit" className="w-full">
                  Validar Formulário
                </Button>
              </form>
            </ShakeAnimation>
          </CardContent>
        </Card>

        {/* Diferentes Intensidades */}
        <Card>
          <CardHeader>
            <CardTitle>Diferentes Intensidades de Shake</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((intensity) => {
                const [isShaking, setIsShaking] = useState(false)
                
                return (
                  <div key={intensity} className="text-center">
                    <p className="text-sm font-medium mb-2">Intensidade {intensity}</p>
                    <ShakeAnimation
                      trigger={isShaking}
                      intensity={intensity as 1 | 2 | 3 | 4 | 5}
                      direction="horizontal"
                      duration={500}
                    >
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsShaking(true)
                          setTimeout(() => setIsShaking(false), 50)
                        }}
                        className="w-full"
                      >
                        Shake {intensity}
                      </Button>
                    </ShakeAnimation>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Diferentes Direções */}
        <Card>
          <CardHeader>
            <CardTitle>Diferentes Direções de Shake</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { direction: 'horizontal' as const, label: 'Horizontal', icon: '↔️' },
                { direction: 'vertical' as const, label: 'Vertical', icon: '↕️' },
                { direction: 'both' as const, label: 'Ambos', icon: '🔄' }
              ].map(({ direction, label, icon }) => {
                const [isShaking, setIsShaking] = useState(false)
                
                return (
                  <div key={direction} className="text-center">
                    <p className="text-sm font-medium mb-2">{icon} {label}</p>
                    <ShakeAnimation
                      trigger={isShaking}
                      intensity={3}
                      direction={direction}
                      duration={600}
                    >
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                           onClick={() => {
                             setIsShaking(true)
                             setTimeout(() => setIsShaking(false), 50)
                           }}>
                        <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2"></div>
                        <p className="text-sm">Clique para shake</p>
                      </div>
                    </ShakeAnimation>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Componentes de Demonstração */}
        <Card>
          <CardHeader>
            <CardTitle>Componentes com Shake</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Input com Erro</h3>
                <ShakeDemo
                  type="input"
                  active={demoStates.input}
                  onClick={() => toggleDemo('input')}
                />
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Botão com Erro</h3>
                <ShakeDemo
                  type="button"
                  active={demoStates.button}
                  onClick={() => toggleDemo('button')}
                />
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Card com Erro</h3>
                <ShakeDemo
                  type="card"
                  active={demoStates.card}
                  onClick={() => toggleDemo('card')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Casos de Uso Práticos */}
        <Card>
          <CardHeader>
            <CardTitle>Casos de Uso Práticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">🔐 Login Inválido</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Shake no formulário inteiro quando credenciais são inválidas
                </p>
                <div className="max-w-sm">
                  <LoginDemo />
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">💳 Pagamento Rejeitado</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Shake no cartão de crédito quando pagamento é rejeitado
                </p>
                <div className="max-w-sm">
                  <PaymentDemo />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente de demonstração de login
const LoginDemo: React.FC = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState(false)

  const handleLogin = () => {
    if (credentials.username !== 'admin' || credentials.password !== '123456') {
      setLoginError(true)
      setTimeout(() => setLoginError(false), 50)
    } else {
      alert('Login realizado com sucesso!')
      setLoginError(false)
    }
  }

  return (
    <ShakeAnimation trigger={loginError} intensity={3} direction="horizontal">
      <div className="p-4 border rounded-lg bg-white">
        <div className="space-y-3">
          <Input
            placeholder="Usuário (admin)"
            value={credentials.username}
            onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
          />
          <Input
            type="password"
            placeholder="Senha (123456)"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
          />
          <Button onClick={handleLogin} className="w-full">
            Entrar
          </Button>
          {loginError && (
            <p className="text-sm text-red-600 text-center">
              ❌ Credenciais inválidas!
            </p>
          )}
        </div>
      </div>
    </ShakeAnimation>
  )
}

// Componente de demonstração de pagamento
const PaymentDemo: React.FC = () => {
  const [cardNumber, setCardNumber] = useState('')
  const [paymentError, setPaymentError] = useState(false)

  const handlePayment = () => {
    if (cardNumber !== '4111111111111111') {
      setPaymentError(true)
      setTimeout(() => setPaymentError(false), 50)
    } else {
      alert('Pagamento aprovado!')
      setPaymentError(false)
    }
  }

  return (
    <ShakeAnimation trigger={paymentError} intensity={4} direction="horizontal">
      <div className="p-4 border rounded-lg bg-white">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Número do Cartão</label>
            <Input
              placeholder="4111 1111 1111 1111 (válido)"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
              className={paymentError ? 'border-red-500' : ''}
            />
          </div>
          <Button onClick={handlePayment} className="w-full">
            💳 Processar Pagamento
          </Button>
          {paymentError && (
            <p className="text-sm text-red-600 text-center">
              ❌ Cartão rejeitado!
            </p>
          )}
        </div>
      </div>
    </ShakeAnimation>
  )
}

export default ShakeAnimationDemo