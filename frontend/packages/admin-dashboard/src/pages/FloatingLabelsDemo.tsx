import React, { useState } from 'react'
import {
  FloatingInput,
  FloatingTextarea,
  FloatingSelect,
  FloatingForm,
  FloatingFieldGroup,
  useFloatingLabel
} from '../../../shared-ui/src'
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Eye, 
  EyeOff,
  Search,
  Globe,
  Building,
  Briefcase
} from 'lucide-react'

/**
 * Componente de demonstração das variantes de floating labels
 */
const VariantsDemo: React.FC = () => {
  const [values, setValues] = useState({
    default: '',
    outlined: '',
    filled: '',
    underlined: ''
  })

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-6">Variantes de Estilo</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FloatingInput
            label="Default"
            variant="default"
            value={values.default}
            onValueChange={(value) => setValues(prev => ({ ...prev, default: value }))}
            leftIcon={<User className="w-4 h-4" />}
            helpText="Estilo padrão com borda simples"
          />
          
          <FloatingInput
            label="Outlined"
            variant="outlined"
            value={values.outlined}
            onValueChange={(value) => setValues(prev => ({ ...prev, outlined: value }))}
            leftIcon={<Mail className="w-4 h-4" />}
            helpText="Estilo com borda destacada"
          />
        </div>
        
        <div className="space-y-4">
          <FloatingInput
            label="Filled"
            variant="filled"
            value={values.filled}
            onValueChange={(value) => setValues(prev => ({ ...prev, filled: value }))}
            leftIcon={<Phone className="w-4 h-4" />}
            helpText="Estilo com fundo preenchido"
          />
          
          <FloatingInput
            label="Underlined"
            variant="underlined"
            value={values.underlined}
            onValueChange={(value) => setValues(prev => ({ ...prev, underlined: value }))}
            leftIcon={<MapPin className="w-4 h-4" />}
            helpText="Estilo minimalista com linha inferior"
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Componente de demonstração dos tamanhos
 */
const SizesDemo: React.FC = () => {
  const [values, setValues] = useState({
    small: '',
    medium: '',
    large: ''
  })

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-6">Tamanhos Disponíveis</h3>
      
      <div className="space-y-4">
        <FloatingInput
          label="Pequeno (sm)"
          size="sm"
          value={values.small}
          onValueChange={(value) => setValues(prev => ({ ...prev, small: value }))}
          leftIcon={<Search className="w-3 h-3" />}
          helpText="Tamanho compacto para interfaces densas"
        />
        
        <FloatingInput
          label="Médio (md)"
          size="md"
          value={values.medium}
          onValueChange={(value) => setValues(prev => ({ ...prev, medium: value }))}
          leftIcon={<User className="w-4 h-4" />}
          helpText="Tamanho padrão recomendado"
        />
        
        <FloatingInput
          label="Grande (lg)"
          size="lg"
          value={values.large}
          onValueChange={(value) => setValues(prev => ({ ...prev, large: value }))}
          leftIcon={<Briefcase className="w-5 h-5" />}
          helpText="Tamanho maior para destaque"
        />
      </div>
    </div>
  )
}

/**
 * Componente de demonstração de estados
 */
const StatesDemo: React.FC = () => {
  const [values, setValues] = useState({
    normal: '',
    error: 'valor-inválido',
    disabled: 'Campo desabilitado',
    required: ''
  })

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-6">Estados dos Campos</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FloatingInput
            label="Campo Normal"
            value={values.normal}
            onValueChange={(value) => setValues(prev => ({ ...prev, normal: value }))}
            leftIcon={<User className="w-4 h-4" />}
            helpText="Estado padrão do campo"
          />
          
          <FloatingInput
            label="Campo com Erro"
            value={values.error}
            onValueChange={(value) => setValues(prev => ({ ...prev, error: value }))}
            leftIcon={<Mail className="w-4 h-4" />}
            error
            errorMessage="Este campo contém um erro"
          />
        </div>
        
        <div className="space-y-4">
          <FloatingInput
            label="Campo Desabilitado"
            value={values.disabled}
            onValueChange={(value) => setValues(prev => ({ ...prev, disabled: value }))}
            leftIcon={<Lock className="w-4 h-4" />}
            disabled
            helpText="Campo não editável"
          />
          
          <FloatingInput
            label="Campo Obrigatório"
            value={values.required}
            onValueChange={(value) => setValues(prev => ({ ...prev, required: value }))}
            leftIcon={<User className="w-4 h-4" />}
            required
            helpText="Este campo é obrigatório"
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Componente de demonstração de tipos de campo
 */
const FieldTypesDemo: React.FC = () => {
  const [values, setValues] = useState({
    text: '',
    email: '',
    password: '',
    number: '',
    date: '',
    textarea: '',
    select: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)

  const countryOptions = [
    { value: 'br', label: 'Brasil' },
    { value: 'us', label: 'Estados Unidos' },
    { value: 'ca', label: 'Canadá' },
    { value: 'mx', label: 'México' },
    { value: 'ar', label: 'Argentina' }
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-6">Tipos de Campo</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FloatingInput
            label="Nome Completo"
            type="text"
            value={values.text}
            onValueChange={(value) => setValues(prev => ({ ...prev, text: value }))}
            leftIcon={<User className="w-4 h-4" />}
            required
          />
          
          <FloatingInput
            label="Email"
            type="email"
            value={values.email}
            onValueChange={(value) => setValues(prev => ({ ...prev, email: value }))}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
          
          <FloatingInput
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            value={values.password}
            onValueChange={(value) => setValues(prev => ({ ...prev, password: value }))}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
          />
          
          <FloatingInput
            label="Idade"
            type="number"
            value={values.number}
            onValueChange={(value) => setValues(prev => ({ ...prev, number: value }))}
            leftIcon={<Calendar className="w-4 h-4" />}
            min="18"
            max="120"
          />
        </div>
        
        <div className="space-y-4">
          <FloatingInput
            label="Data de Nascimento"
            type="date"
            value={values.date}
            onValueChange={(value) => setValues(prev => ({ ...prev, date: value }))}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          
          <FloatingSelect
            label="País"
            value={values.select}
            onValueChange={(value) => setValues(prev => ({ ...prev, select: value }))}
            options={countryOptions}
            placeholder="Selecione um país"
            required
          />
          
          <FloatingTextarea
            label="Comentários"
            value={values.textarea}
            onValueChange={(value) => setValues(prev => ({ ...prev, textarea: value }))}
            rows={3}
            autoResize
            helpText="Máximo de 500 caracteres"
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Componente de formulário completo
 */
const CompleteFormDemo: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    country: '',
    city: '',
    address: '',
    bio: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação simples
    const newErrors: Record<string, string> = {}
    
    if (!formData.firstName) newErrors.firstName = 'Nome é obrigatório'
    if (!formData.lastName) newErrors.lastName = 'Sobrenome é obrigatório'
    if (!formData.email) newErrors.email = 'Email é obrigatório'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido'
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const countryOptions = [
    { value: 'br', label: 'Brasil' },
    { value: 'us', label: 'Estados Unidos' },
    { value: 'ca', label: 'Canadá' },
    { value: 'mx', label: 'México' },
    { value: 'ar', label: 'Argentina' }
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-6">Formulário Completo</h3>
      
      <FloatingForm onSubmit={handleSubmit}>
        <FloatingFieldGroup 
          title="Informações Pessoais"
          description="Dados básicos do usuário"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FloatingInput
              label="Nome"
              value={formData.firstName}
              onValueChange={(value) => updateField('firstName', value)}
              leftIcon={<User className="w-4 h-4" />}
              error={!!errors.firstName}
              {...(errors.firstName && { errorMessage: errors.firstName })}
              required
            />
            
            <FloatingInput
              label="Sobrenome"
              value={formData.lastName}
              onValueChange={(value) => updateField('lastName', value)}
              leftIcon={<User className="w-4 h-4" />}
              error={!!errors.lastName}
              {...(errors.lastName && { errorMessage: errors.lastName })}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FloatingInput
              label="Email"
              type="email"
              value={formData.email}
              onValueChange={(value) => updateField('email', value)}
              leftIcon={<Mail className="w-4 h-4" />}
              error={!!errors.email}
              {...(errors.email && { errorMessage: errors.email })}
              required
            />
            
            <FloatingInput
              label="Telefone"
              type="tel"
              value={formData.phone}
              onValueChange={(value) => updateField('phone', value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>
        </FloatingFieldGroup>
        
        <FloatingFieldGroup 
          title="Informações Profissionais"
          description="Dados sobre trabalho e empresa"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FloatingInput
              label="Empresa"
              value={formData.company}
              onValueChange={(value) => updateField('company', value)}
              leftIcon={<Building className="w-4 h-4" />}
            />
            
            <FloatingInput
              label="Cargo"
              value={formData.position}
              onValueChange={(value) => updateField('position', value)}
              leftIcon={<Briefcase className="w-4 h-4" />}
            />
          </div>
        </FloatingFieldGroup>
        
        <FloatingFieldGroup 
          title="Localização"
          description="Informações de endereço"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FloatingSelect
              label="País"
              value={formData.country}
              onValueChange={(value) => updateField('country', value)}
              options={countryOptions}
              placeholder="Selecione um país"
            />
            
            <FloatingInput
              label="Cidade"
              value={formData.city}
              onValueChange={(value) => updateField('city', value)}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
          </div>
          
          <FloatingInput
            label="Endereço"
            value={formData.address}
            onValueChange={(value) => updateField('address', value)}
            leftIcon={<MapPin className="w-4 h-4" />}
          />
        </FloatingFieldGroup>
        
        <FloatingFieldGroup title="Sobre Você">
          <FloatingTextarea
            label="Biografia"
            value={formData.bio}
            onValueChange={(value) => updateField('bio', value)}
            rows={4}
            autoResize
            helpText="Conte um pouco sobre você (opcional)"
          />
        </FloatingFieldGroup>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className={`
              px-6 py-3 rounded-lg font-medium transition-all
              ${submitted 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            {submitted ? '✓ Enviado!' : 'Enviar Formulário'}
          </button>
        </div>
      </FloatingForm>
    </div>
  )
}

/**
 * Componente de demonstração do hook useFloatingLabel
 */
const HookDemo: React.FC = () => {
  const {
    value,
    focused,
    hasValue,
    isFloating,
    setValue,
    onFocus,
    onBlur
  } = useFloatingLabel('')

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-6">Hook useFloatingLabel</h3>
      
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            className="
              w-full px-3 py-3 border border-gray-300 rounded-md
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
          <label
            className={`
              absolute left-3 transition-all duration-200 pointer-events-none
              ${isFloating 
                ? 'top-1.5 text-xs text-blue-500 bg-white px-1 -ml-1' 
                : 'top-3 text-base text-gray-500'
              }
            `}
          >
            Campo Customizado
          </label>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Estado do Hook:</h4>
          <div className="text-sm space-y-1">
            <div>Valor: <code className="bg-gray-200 px-1 rounded">{value || '(vazio)'}</code></div>
            <div>Focado: <code className="bg-gray-200 px-1 rounded">{focused.toString()}</code></div>
            <div>Tem Valor: <code className="bg-gray-200 px-1 rounded">{hasValue.toString()}</code></div>
            <div>Label Flutuante: <code className="bg-gray-200 px-1 rounded">{isFloating.toString()}</code></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Página principal de demonstração dos floating labels
 */
const FloatingLabelsDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sistema de Labels Flutuantes
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Demonstração do sistema de labels flutuantes para formulários modernos.
            Labels que se movem suavemente para cima quando o campo está focado ou preenchido.
          </p>
        </div>
        
        <div className="space-y-8">
          <VariantsDemo />
          <SizesDemo />
          <StatesDemo />
          <FieldTypesDemo />
          <HookDemo />
          <CompleteFormDemo />
        </div>
        
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Características dos Floating Labels
          </h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Labels que flutuam suavemente quando o campo está ativo</li>
            <li>• Múltiplas variantes de estilo (default, outlined, filled, underlined)</li>
            <li>• Três tamanhos disponíveis (sm, md, lg)</li>
            <li>• Suporte a ícones à esquerda e direita</li>
            <li>• Estados visuais para erro, desabilitado e obrigatório</li>
            <li>• Componentes para Input, Textarea e Select</li>
            <li>• Hook personalizado para implementações customizadas</li>
            <li>• Totalmente acessível com labels apropriados</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default FloatingLabelsDemo