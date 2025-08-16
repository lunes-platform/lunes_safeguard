import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { useCurrencyFormat } from '@safeguard/shared-ui';
import { useToast } from '../contexts/ToastContext';

// Função para validar endereços Ethereum
const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Schema de validação local
const createProjectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(500, 'Descrição muito longa'),
  contractAddress: z.string()
    .min(1, 'Endereço do contrato é obrigatório')
    .refine(isValidEthereumAddress, 'Endereço Ethereum inválido (deve começar com 0x e ter 42 caracteres)'),
  tokenAddress: z.string()
    .optional()
    .refine((val) => !val || isValidEthereumAddress(val), 'Endereço de token inválido'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  documentation: z.string().url('URL inválida').optional().or(z.literal('')),
  initialGuarantee: z.object({
    lunesAmount: z.string()
      .min(1, 'Valor LUNES é obrigatório')
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Valor deve ser um número positivo'),
    lustdAmount: z.string()
      .min(1, 'Valor LUSTD é obrigatório')
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Valor deve ser um número positivo'),
  }),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectFormData & { logo?: File | undefined }) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();
  
  // Hook para formatação de valores monetários
  const { formatForDisplay, createInputHandlers, isValidNumber, getDisplayValue } = useCurrencyFormat();
  
  // Estados para controlar a validação visual dos campos monetários
  const [lunesError, setLunesError] = useState<string>('');
  const [lustdError, setLustdError] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
  });

  const contractAddress = watch('contractAddress');
  const tokenAddress = watch('tokenAddress');
  const nameValue = watch('name') || '';
  const descriptionValue = watch('description') || '';

  const handleFormSubmit = async (data: CreateProjectFormData) => {
    try {
      const submitData = {
        ...data,
        website: data.website || undefined,
        documentation: data.documentation || undefined,
        logo: selectedLogo || undefined,
      };
      await onSubmit(submitData);
      
      // Notificação de sucesso
      showSuccess(
        'Projeto criado com sucesso!',
        `O projeto "${data.name}" foi cadastrado e está aguardando aprovação.`
      );
      
      reset();
      setSelectedLogo(null);
      setLogoPreview(null);
      setLogoError(null);
      onClose();
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      
      // Notificação de erro
      showError(
        'Erro ao criar projeto',
        error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente.'
      );
    }
  };

  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setLogoError(null);
    
    if (!file) {
      setSelectedLogo(null);
      setLogoPreview(null);
      return;
    }

    // Validações do arquivo
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

    if (!allowedTypes.includes(file.type)) {
      setLogoError('Formato de arquivo não suportado. Use PNG, JPG ou SVG.');
      return;
    }

    if (file.size > maxSize) {
      setLogoError('Arquivo muito grande. O tamanho máximo é 2MB.');
      return;
    }

    setSelectedLogo(file);
    
    // Criar preview da imagem
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-[5px] flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground">Criar Novo Projeto</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-[5px]"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Nome do Projeto *
              </div>
              <span className={`text-xs ${ nameValue.length > 100 ? 'text-destructive' : nameValue.length > 80 ? 'text-yellow-500' : 'text-muted-foreground' }`}>
                {nameValue.length}/100
              </span>
            </label>
            <input
              {...register('name')}
              type="text"
              disabled={isSubmitting}
              className="input-modern w-full disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Digite o nome do projeto"
              maxLength={100}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descrição *
              </div>
              <span className={`text-xs ${ descriptionValue.length > 500 ? 'text-destructive' : descriptionValue.length > 400 ? 'text-yellow-500' : 'text-muted-foreground' }`}>
                {descriptionValue.length}/500
              </span>
            </label>
            <textarea
              {...register('description')}
              rows={4}
              disabled={isSubmitting}
              className="input-modern w-full resize-none disabled:opacity-50 disabled:cursor-not-allowed min-h-[100px]"
              placeholder="Descreva o projeto, seus objetivos e funcionalidades principais..."
              maxLength={500}
            />
            <div className="mt-1 text-xs text-muted-foreground">
              Mínimo de 10 caracteres. Seja específico sobre o propósito e benefícios do projeto.
            </div>
            {errors.description && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Endereços - Layout lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Endereço do Contrato */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Endereço do Contrato *
              </label>
              <div className="relative">
                <input
                  {...register('contractAddress')}
                  type="text"
                  disabled={isSubmitting}
                  className={`input-modern font-mono pr-10 disabled:opacity-50 disabled:cursor-not-allowed ${
                    contractAddress && isValidEthereumAddress(contractAddress)
                      ? 'border-green-500 focus:border-green-500'
                      : contractAddress && contractAddress.length > 0
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }`}
                  placeholder="0x..."
                />
                {contractAddress && contractAddress.length > 0 && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isValidEthereumAddress(contractAddress) ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {errors.contractAddress && (
                <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.contractAddress.message}
                </p>
              )}
            </div>

            {/* Endereço do Token */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Endereço do Token
              </label>
              <div className="relative">
                <input
                  {...register('tokenAddress')}
                  type="text"
                  disabled={isSubmitting}
                  className={`input-modern font-mono pr-10 disabled:opacity-50 disabled:cursor-not-allowed ${
                    tokenAddress && isValidEthereumAddress(tokenAddress)
                      ? 'border-green-500 focus:border-green-500'
                      : tokenAddress && tokenAddress.length > 0
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }`}
                  placeholder="0x... (opcional)"
                />
                {tokenAddress && tokenAddress.length > 0 && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isValidEthereumAddress(tokenAddress) ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {errors.tokenAddress && (
                <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.tokenAddress.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
                Website
              </label>
              <input
                {...register('website')}
                type="url"
                disabled={isSubmitting}
                className="input-modern disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="https://..."
              />
              {errors.website && (
                <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.website.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Documentação
              </label>
              <input
                {...register('documentation')}
                type="url"
                disabled={isSubmitting}
                className="input-modern disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="https://..."
              />
              {errors.documentation && (
                <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.documentation.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Garantia Inicial *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">LUNES</label>
                <input
                  {...register('initialGuarantee.lunesAmount')}
                  {...createInputHandlers((value) => {
                    setValue('initialGuarantee.lunesAmount', value);
                    // Validação em tempo real
                    if (value && !isValidNumber(value)) {
                      setLunesError('Valor inválido');
                    } else {
                      setLunesError('');
                    }
                  })}
                  type="text"
                  disabled={isSubmitting}
                  className={`input-modern disabled:opacity-50 disabled:cursor-not-allowed ${
                    (errors.initialGuarantee?.lunesAmount || lunesError) ? 'border-destructive focus:border-destructive' : ''
                  }`}
                  placeholder="0,00"
                />
                {(errors.initialGuarantee?.lunesAmount || lunesError) && (
                  <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.initialGuarantee?.lunesAmount?.message || lunesError}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">LUSTD</label>
                <input
                  {...register('initialGuarantee.lustdAmount')}
                  {...createInputHandlers((value) => {
                    setValue('initialGuarantee.lustdAmount', value);
                    // Validação em tempo real
                    if (value && !isValidNumber(value)) {
                      setLustdError('Valor inválido');
                    } else {
                      setLustdError('');
                    }
                  })}
                  type="text"
                  disabled={isSubmitting}
                  className={`input-modern disabled:opacity-50 disabled:cursor-not-allowed ${
                    (errors.initialGuarantee?.lustdAmount || lustdError) ? 'border-destructive focus:border-destructive' : ''
                  }`}
                  placeholder="0,00"
                />
                {(errors.initialGuarantee?.lustdAmount || lustdError) && (
                  <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.initialGuarantee?.lustdAmount?.message || lustdError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Logo do Projeto
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {logoPreview ? (
                  <div className="w-16 h-16 rounded-lg border border-border bg-muted overflow-hidden">
                    <img 
                      src={logoPreview} 
                      alt="Preview do logo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                    <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    disabled={isSubmitting}
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo"
                    className={`inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background transition-colors ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted'
                    }`}
                  >
                    {selectedLogo ? 'Alterar arquivo' : 'Escolher arquivo'}
                  </label>
                  {selectedLogo && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setSelectedLogo(null);
                        setLogoPreview(null);
                        setLogoError(null);
                        // Limpar o input file
                        const input = document.getElementById('logo') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                      className="inline-flex items-center px-3 py-2 border border-destructive text-destructive rounded-md shadow-sm text-sm font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remover
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  PNG, JPG ou SVG até 2MB
                </p>
                {logoError && (
                  <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {logoError}
                  </p>
                )}
                {selectedLogo && !logoError && (
                  <p className="mt-1 text-sm text-primary flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Arquivo selecionado: {selectedLogo.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!logoError}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Criar Projeto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};