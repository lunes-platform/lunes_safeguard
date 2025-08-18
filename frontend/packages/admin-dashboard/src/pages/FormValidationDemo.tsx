import React from 'react';
import { useEmailValidation, usePasswordValidation, Input } from '@safeguard/shared-ui';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Página de demonstração da validação em tempo real
 * Mostra como usar os hooks de validação com inputs simples
 */
export function FormValidationDemo() {
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });

  // Hooks de validação em tempo real
  const emailValidation = useEmailValidation({ debounceMs: 300 });
  const passwordValidation = usePasswordValidation({ debounceMs: 300 });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));
    emailValidation.handleChange(e);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, password: value }));
    passwordValidation.handleChange(e);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos antes do envio
    emailValidation.validate(formData.email);
    passwordValidation.validate(formData.password);
    
    if (emailValidation.state.isValid && passwordValidation.state.isValid) {
      alert('Formulário válido! Dados: ' + JSON.stringify(formData, null, 2));
    } else {
      alert('Por favor, corrija os erros no formulário.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Demonstração de Validação em Tempo Real
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
                onBlur={emailValidation.handleBlur}
                placeholder="Digite seu email"
                className={emailValidation.state.error ? 'border-destructive focus:border-destructive' : emailValidation.state.isValid ? 'border-green-500 focus:border-green-500' : ''}
                rightIcon={
                  emailValidation.state.isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : emailValidation.state.isValid && !emailValidation.state.isValidating ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : emailValidation.state.error ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : null
                }
              />
            </div>
            
            {/* Mensagem de erro */}
            {emailValidation.state.error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {emailValidation.state.error}
              </p>
            )}
          </div>

          {/* Campo Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handlePasswordChange}
              onBlur={passwordValidation.handleBlur}
              placeholder="Digite sua senha"
              className={passwordValidation.state.error ? 'border-destructive focus:border-destructive' : passwordValidation.state.isValid ? 'border-green-500 focus:border-green-500' : ''}
              rightIcon={
                passwordValidation.state.isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : passwordValidation.state.isValid && !passwordValidation.state.isValidating ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : passwordValidation.state.error ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : null
              }
            />
            
            {/* Mensagem de erro */}
            {passwordValidation.state.error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {passwordValidation.state.error}
              </p>
            )}
          </div>

          {/* Botão de envio */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Enviar Formulário
          </button>
        </form>

        {/* Status do formulário */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Status da Validação:</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Email:</span>
              <span className={emailValidation.state.isValid ? 'text-green-600' : 'text-red-600'}>
                {emailValidation.state.isValidating ? 'Validando...' : 
                 emailValidation.state.isValid ? 'Válido' : 
                 emailValidation.state.error ? 'Inválido' : 'Não validado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Senha:</span>
              <span className={passwordValidation.state.isValid ? 'text-green-600' : 'text-red-600'}>
                {passwordValidation.state.isValidating ? 'Validando...' : 
                 passwordValidation.state.isValid ? 'Válida' : 
                 passwordValidation.state.error ? 'Inválida' : 'Não validada'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}