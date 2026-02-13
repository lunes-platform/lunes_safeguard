import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  FileText, 
  CreditCard, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SEOHead } from '../../components/seo/SEOHead';
import { DepositGuaranteeModal } from '../project-registration/components/DepositGuaranteeModal';
import type { ProjectRegistrationData } from '../project-registration/types';

/**
 * Etapas do processo de onboarding
 */
type OnboardingStep = 'form' | 'review' | 'deposit' | 'confirmation';

/**
 * Interface para o estado do onboarding
 */
interface OnboardingState {
  currentStep: OnboardingStep;
  projectData: ProjectRegistrationData | null;
  isDepositModalOpen: boolean;
  isSubmitting: boolean;
  submissionResult: {
    success: boolean;
    projectId?: string;
    transactionHash?: string;
    message?: string;
  } | null;
}

/**
 * Configuração das etapas
 */
const stepConfig = {
  form: {
    title: 'Informações do Projeto',
    description: 'Preencha os dados básicos do seu projeto',
    icon: FileText,
    status: 'current' as const
  },
  review: {
    title: 'Revisão',
    description: 'Confirme as informações antes de prosseguir',
    icon: Check,
    status: 'upcoming' as const
  },
  deposit: {
    title: 'Depósito de Garantia',
    description: 'Realize o depósito de garantia em LUNES',
    icon: CreditCard,
    status: 'upcoming' as const
  },
  confirmation: {
    title: 'Confirmação',
    description: 'Projeto submetido com sucesso',
    icon: CheckCircle,
    status: 'upcoming' as const
  }
};

/**
 * Componente de indicador de progresso
 */
const StepIndicator: React.FC<{
  steps: OnboardingStep[];
  currentStep: OnboardingStep;
}> = ({ steps, currentStep }) => {
  const currentIndex = steps.indexOf(currentStep);
  
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const config = stepConfig[step];
        const Icon = config.icon;
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        // isUpcoming available for future use: index > currentIndex
        
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-lunes-purple border-lunes-purple text-white'
                      : 'bg-white border-neutral-300 text-neutral-400'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${
                  isCurrent ? 'text-lunes-purple' : isCompleted ? 'text-green-600' : 'text-neutral-500'
                }`}>
                  {config.title}
                </p>
                <p className="text-xs text-neutral-500 max-w-24">
                  {config.description}
                </p>
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={`
                  w-16 h-0.5 mx-4 transition-all duration-300
                  ${isCompleted ? 'bg-green-500' : 'bg-neutral-300'}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/**
 * Componente de revisão dos dados
 */
const ReviewStep: React.FC<{
  projectData: ProjectRegistrationData;
  onEdit: () => void;
  onConfirm: () => void;
}> = ({ projectData, onEdit, onConfirm }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revisão dos Dados do Projeto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">Informações Básicas</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-neutral-600">Nome:</span>
                <p className="font-medium">{projectData.name}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-600">Categoria:</span>
                <p className="font-medium">{projectData.category}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-600">Website:</span>
                <p className="font-medium">{projectData.website}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">Detalhes Técnicos</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-neutral-600">GitHub:</span>
                <p className="font-medium">{projectData.github || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-600">Website:</span>
                <p className="font-medium">{projectData.website || 'Não informado'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-neutral-900 mb-3">Descrição</h3>
          <p className="text-neutral-700 bg-neutral-50 p-4 rounded-lg">
            {projectData.description}
          </p>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onEdit} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Editar
          </Button>
          <Button onClick={onConfirm} className="flex items-center gap-2">
            Confirmar e Prosseguir
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Componente de confirmação final
 */
const ConfirmationStep: React.FC<{
  submissionResult: NonNullable<OnboardingState['submissionResult']>;
}> = ({ submissionResult }) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardContent className="pt-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">
          Projeto Submetido com Sucesso!
        </h2>
        
        <p className="text-neutral-600 mb-6">
          Seu projeto foi submetido e está aguardando aprovação da comunidade.
        </p>
        
        {submissionResult.projectId && (
          <div className="bg-neutral-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-neutral-600 mb-2">ID do Projeto:</p>
            <p className="font-mono text-sm font-medium">{submissionResult.projectId}</p>
          </div>
        )}
        
        {submissionResult.transactionHash && (
          <div className="bg-neutral-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-neutral-600 mb-2">Hash da Transação:</p>
            <p className="font-mono text-sm font-medium break-all">{submissionResult.transactionHash}</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            Voltar ao Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/projetos')}
            className="flex items-center gap-2"
          >
            Ver Todos os Projetos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Componente principal do onboarding de projetos
 */
export const ProjectOnboarding: React.FC = () => {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 'form',
    projectData: null,
    isDepositModalOpen: false,
    isSubmitting: false,
    submissionResult: null
  });
  
  const steps: OnboardingStep[] = ['form', 'review', 'deposit', 'confirmation'];
  
  /**
   * Manipula o sucesso do formulário
   */
  const handleFormSuccess = (data: ProjectRegistrationData) => {
    setState(prev => ({
      ...prev,
      projectData: data,
      currentStep: 'review'
    }));
  };
  
  /**
   * Volta para o formulário
   */
  const handleBackToForm = () => {
    setState(prev => ({
      ...prev,
      currentStep: 'form'
    }));
  };
  
  /**
   * Confirma os dados e vai para o depósito
   */
  const handleConfirmData = () => {
    setState(prev => ({
      ...prev,
      currentStep: 'deposit',
      isDepositModalOpen: true
    }));
  };
  
  /**
   * Manipula o sucesso do depósito
   */
  const handleDepositSuccess = () => {
    setState(prev => ({
      ...prev,
      isDepositModalOpen: false,
      currentStep: 'confirmation',
      submissionResult: {
        success: true,
        projectId: `PRJ-${Date.now()}`,
        message: 'Projeto submetido com sucesso!'
      }
    }));
    
    // TODO: Integrar com backend para salvar status do projeto
    console.log('Depósito realizado com sucesso');
  };
  

  
  /**
   * Fecha o modal de depósito
   */
  const handleCloseDepositModal = () => {
    setState(prev => ({
      ...prev,
      isDepositModalOpen: false
    }));
  };
  
  return (
    <>
      <SEOHead
        title="Onboarding de Projetos - Lunes SafeGuard"
        description="Cadastre seu projeto no protocolo Lunes SafeGuard. Processo guiado para submissão e aprovação."
        keywords={["onboarding", "cadastro", "projeto", "submissão", "SafeGuard"]}
        noIndex={true}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Link to="/admin">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Voltar ao Dashboard</span>
                </Button>
              </Link>
            </div>
            
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Onboarding de Projeto
            </h1>
            <p className="text-lg text-neutral-600">
              Siga os passos para cadastrar seu projeto no protocolo SafeGuard
            </p>
          </motion.div>

          {/* Indicador de Progresso */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <StepIndicator steps={steps} currentStep={state.currentStep} />
          </motion.div>

          {/* Conteúdo das Etapas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {state.currentStep === 'form' && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* TODO: Implementar ProjectRegistrationForm ou usar o componente existente */}
                  <Card>
                    <CardContent className="pt-8 text-center">
                      <p className="text-neutral-600 mb-4">
                        Formulário de cadastro será implementado aqui.
                      </p>
                      <Button onClick={() => handleFormSuccess({
                        id: Date.now(),
                        name: 'Projeto Exemplo',
                        description: 'Descrição do projeto exemplo',
                        category: 'DeFi',
                        website: 'https://exemplo.com',
                        github: 'https://github.com/exemplo',
                        tokenContract: '0x123...',
                        treasuryAddress: '0x456...',
                        teamSize: 5,
                        hasAudit: true,
                        hasKYC: false,
                        agreedToTerms: true,
                        status: 'pending_deposit',
                        createdAt: new Date(),
                        estimatedScore: 85
                      } as ProjectRegistrationData)}>
                        Continuar (Exemplo)
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {state.currentStep === 'review' && state.projectData && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ReviewStep
                    projectData={state.projectData}
                    onEdit={handleBackToForm}
                    onConfirm={handleConfirmData}
                  />
                </motion.div>
              )}
              
              {state.currentStep === 'deposit' && (
                <motion.div
                  key="deposit"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardContent className="pt-8 text-center">
                      <Clock className="w-16 h-16 text-lunes-purple mx-auto mb-6" />
                      <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                        Aguardando Depósito de Garantia
                      </h2>
                      <p className="text-neutral-600 mb-6">
                        Complete o depósito de garantia para finalizar a submissão do projeto.
                      </p>
                      <Button
                        onClick={() => setState(prev => ({ ...prev, isDepositModalOpen: true }))}
                        className="flex items-center gap-2 mx-auto"
                      >
                        <CreditCard className="w-4 h-4" />
                        Realizar Depósito
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {state.currentStep === 'confirmation' && state.submissionResult && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ConfirmationStep submissionResult={state.submissionResult} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
      
      {/* Modal de Depósito */}
      {state.projectData && (
        <DepositGuaranteeModal
          isOpen={state.isDepositModalOpen}
          onClose={handleCloseDepositModal}
          projectData={state.projectData}
          onSuccess={handleDepositSuccess}
        />
      )}
    </>
  );
};

export default ProjectOnboarding;