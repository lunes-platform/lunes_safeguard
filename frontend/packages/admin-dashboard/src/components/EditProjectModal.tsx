import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button, Badge } from '@safeguard/shared-ui';

// Schema de validação para edição de projeto
const editProjectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(500, 'Descrição muito longa'),
  contractAddress: z.string().min(1, 'Endereço do contrato é obrigatório'),
  tokenAddress: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  documentation: z.string().url('URL inválida').optional().or(z.literal('')),
  status: z.enum(['Ativo', 'Em Votação', 'Pendente', 'Rejeitado', 'Pausado']),
  guarantee: z.string().min(1, 'Valor da garantia é obrigatório'),
  timeRemaining: z.string().min(1, 'Tempo restante é obrigatório')
});

type EditProjectFormData = z.infer<typeof editProjectSchema>;

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Ativo' | 'Em Votação' | 'Pendente' | 'Rejeitado' | 'Pausado';
  guarantee: string;
  timeRemaining: string;
  icon: string;
  createdAt: string;
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditProjectFormData) => Promise<void>;
  project: Project | null;
}

/**
 * Modal para edição de projetos
 * 
 * Funcionalidades:
 * - Formulário pré-preenchido com dados do projeto
 * - Validação de campos
 * - Upload de logo (opcional)
 * - Notificações de sucesso/erro
 */
export function EditProjectModal({ isOpen, onClose, onSubmit, project }: EditProjectModalProps) {
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue
  } = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    mode: 'onChange'
  });

  // Preencher formulário quando o projeto for selecionado
  useEffect(() => {
    if (project && isOpen) {
      setValue('name', project.name);
      setValue('description', project.description);
      setValue('status', project.status);
      setValue('guarantee', project.guarantee);
      setValue('timeRemaining', project.timeRemaining);
      // Valores padrão para campos que não existem no mock
      setValue('contractAddress', '0x1234567890abcdef1234567890abcdef12345678');
      setValue('tokenAddress', '');
      setValue('website', '');
      setValue('documentation', '');
    }
  }, [project, isOpen, setValue]);

  const handleFormSubmit = async (data: EditProjectFormData) => {
    if (!project) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
      setSelectedLogo(null);
      setLogoPreview(null);
      setLogoError(null);
      onClose();
    } catch (error) {
      console.error('Erro ao editar projeto:', error);
    } finally {
      setIsSubmitting(false);
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

  const removeLogo = () => {
    setSelectedLogo(null);
    setLogoPreview(null);
    setLogoError(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Em Votação':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Pendente':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Rejeitado':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Pausado':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Editar Projeto</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Atualize as informações do projeto {project.name}
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome do Projeto */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nome do Projeto *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground"
                    placeholder="Ex: DeFi Protocol"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status *
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Em Votação">Em Votação</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Rejeitado">Rejeitado</option>
                    <option value="Pausado">Pausado</option>
                  </select>
                  {errors.status && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.status.message}
                    </p>
                  )}
                </div>

                {/* Garantia */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Valor da Garantia *
                  </label>
                  <input
                    {...register('guarantee')}
                    type="text"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground"
                    placeholder="Ex: 50,000 LUNES"
                  />
                  {errors.guarantee && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.guarantee.message}
                    </p>
                  )}
                </div>

                {/* Tempo Restante */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tempo Restante *
                  </label>
                  <input
                    {...register('timeRemaining')}
                    type="text"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground"
                    placeholder="Ex: 15 dias"
                  />
                  {errors.timeRemaining && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.timeRemaining.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descrição *
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground resize-none"
                  placeholder="Descreva o projeto, seus objetivos e funcionalidades principais..."
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Informações Técnicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Informações Técnicas</h3>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Endereço do Contrato */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Endereço do Contrato *
                  </label>
                  <input
                    {...register('contractAddress')}
                    type="text"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground font-mono text-sm"
                    placeholder="0x..."
                  />
                  {errors.contractAddress && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.contractAddress.message}
                    </p>
                  )}
                </div>

                {/* Endereço do Token */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Endereço do Token (Opcional)
                  </label>
                  <input
                    {...register('tokenAddress')}
                    type="text"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground font-mono text-sm"
                    placeholder="0x..."
                  />
                  {errors.tokenAddress && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.tokenAddress.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Links Externos */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Links Externos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Website (Opcional)
                  </label>
                  <input
                    {...register('website')}
                    type="url"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground"
                    placeholder="https://exemplo.com"
                  />
                  {errors.website && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.website.message}
                    </p>
                  )}
                </div>

                {/* Documentação */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Documentação (Opcional)
                  </label>
                  <input
                    {...register('documentation')}
                    type="url"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground"
                    placeholder="https://docs.exemplo.com"
                  />
                  {errors.documentation && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.documentation.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Upload de Logo */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Logo do Projeto</h3>
              
              <div className="border-2 border-dashed border-border rounded-lg p-6">
                {logoPreview ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={logoPreview}
                      alt="Preview do logo"
                      className="w-16 h-16 object-cover rounded-lg border border-border"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {selectedLogo?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedLogo && (selectedLogo.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={removeLogo}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Clique para fazer upload do logo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG ou SVG até 2MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      onChange={handleLogoSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
                
                {logoError && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {logoError}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Badge className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
              {project.status}
            </Badge>
            <span className="text-sm text-muted-foreground">ID: {project.id}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit(handleFormSubmit)}
              disabled={!isValid || isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}