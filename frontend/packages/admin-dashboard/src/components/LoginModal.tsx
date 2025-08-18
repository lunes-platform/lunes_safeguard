import React, { useState } from 'react';
import { X, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Input, useEmailValidation, usePasswordValidation } from '@safeguard/shared-ui';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal de Login
 * 
 * Funcionalidades:
 * - Formulário de login com email e senha
 * - Validação básica de campos
 * - Integração com contexto de autenticação
 * - Feedback visual de loading e erros
 */
export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { connectWallet, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Validação em tempo real para email
  const emailValidation = useEmailValidation({
    debounceMs: 300
  });

  // Validação em tempo real para senha
  const passwordValidation = usePasswordValidation({
    debounceMs: 300
  });

  /**
   * Manipula mudanças nos campos do formulário
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Aplica validação em tempo real
    if (name === 'email') {
      emailValidation.handleChange(e);
    } else if (name === 'password') {
      passwordValidation.handleChange(e);
    }
    
    // Limpa erro quando usuário digita
    if (error) setError('');
  };

  /**
   * Manipula perda de foco nos campos
   */
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    
    if (name === 'email') {
      emailValidation.handleBlur(e);
    } else if (name === 'password') {
      passwordValidation.handleBlur(e);
    }
  };

  /**
   * Manipula submissão do formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação usando os hooks de validação
    emailValidation.validate(formData.email);
    passwordValidation.validate(formData.password);
    
    if (!emailValidation.state.isValid) {
      setError(emailValidation.state.error || 'Email inválido');
      return;
    }
    
    if (!passwordValidation.state.isValid) {
      setError(passwordValidation.state.error || 'Senha inválida');
      return;
    }

    try {
      // Para demonstração, vamos simular um login tradicional
      // Em um cenário real, você faria uma chamada de API aqui
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simula login bem-sucedido - conecta a carteira
      await connectWallet();
      
      // Reset form e fecha modal
      setFormData({ email: '', password: '' });
      setError('');
      onClose();
    } catch (error) {
      setError('Erro ao conectar. Tente novamente.');
    }
  };

  /**
   * Fecha modal e reseta estado
   */
  const handleClose = () => {
    setFormData({ email: '', password: '' });
    setError('');
    emailValidation.reset();
    passwordValidation.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <LogIn className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Entrar</h2>
              <p className="text-sm text-muted-foreground">Acesse sua conta SafeGuard</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              floatingLabel
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="seu@email.com"
              disabled={isLoading}
              required
              isValidating={emailValidation.state.isValidating}
              isValid={emailValidation.state.isValid}
              showValidationIcon
              error={emailValidation.state.error || undefined}
            />
          </div>

          {/* Senha */}
          <div>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Senha"
              floatingLabel
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="Sua senha"
              disabled={isLoading}
              required
              isValidating={passwordValidation.state.isValidating}
              isValid={passwordValidation.state.isValid}
              showValidationIcon
              rightIcon={showPassword ? EyeOff : Eye}
               onRightIconClick={() => setShowPassword(!showPassword)}
               error={passwordValidation.state.error || undefined}
            />
          </div>

          {/* Erro */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Credenciais de demonstração */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 font-medium mb-1">Credenciais de demonstração:</p>
            <p className="text-xs text-blue-600">Email: admin@safeguard.com</p>
            <p className="text-xs text-blue-600">Senha: admin123</p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Entrar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}