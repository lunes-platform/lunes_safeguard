import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  User,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, Textarea } from '../ui';
import { useProjectStatus } from '../../hooks/useProjectStatus';
import type { ProjectStatus } from '../../features/project-registration/types';

/**
 * Interface para os dados do projeto
 */
interface ProjectData {
  id: string | number;
  name: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt?: Date;
  adminNotes?: string;
  rejectionReason?: string;
}

/**
 * Props do componente ProjectStatusManager
 */
interface ProjectStatusManagerProps {
  project: ProjectData;
  isAdmin?: boolean;
  onStatusChange?: (newStatus: ProjectStatus) => void;
  className?: string;
}

/**
 * Interface para o modal de ação
 */
interface ActionModalState {
  isOpen: boolean;
  action: 'approve' | 'reject' | 'resubmit' | null;
  reason: string;
  adminNotes: string;
}

/**
 * Componente para gerenciar e exibir o status de projetos
 * 
 * Funcionalidades:
 * - Exibe o status atual com badge colorido
 * - Mostra histórico de mudanças de status
 * - Permite ações administrativas (aprovar/rejeitar)
 * - Suporte a resubmissão de projetos rejeitados
 */
export const ProjectStatusManager: React.FC<ProjectStatusManagerProps> = ({
  project,
  isAdmin = false,
  onStatusChange,
  className = ''
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [actionModal, setActionModal] = useState<ActionModalState>({
    isOpen: false,
    action: null,
    reason: '',
    adminNotes: ''
  });

  const {
    isLoading,
    error,
    approveProject,
    rejectProject,
    resubmitProject,
    getAvailableActions,
    getStatusDescription,
    getStatusColor,
    clearError
  } = useProjectStatus();

  /**
   * Obtém o ícone para cada status
   */
  const getStatusIcon = (status: ProjectStatus) => {
    const icons = {
      'pending_deposit': <Clock className="w-4 h-4" />,
      'pending_approval': <AlertTriangle className="w-4 h-4" />,
      'approved': <CheckCircle className="w-4 h-4" />,
      'rejected': <XCircle className="w-4 h-4" />
    };
    return icons[status];
  };

  /**
   * Abre o modal para uma ação específica
   */
  const openActionModal = (action: 'approve' | 'reject' | 'resubmit') => {
    setActionModal({
      isOpen: true,
      action,
      reason: '',
      adminNotes: ''
    });
    clearError();
  };

  /**
   * Fecha o modal de ação
   */
  const closeActionModal = () => {
    setActionModal({
      isOpen: false,
      action: null,
      reason: '',
      adminNotes: ''
    });
  };

  /**
   * Executa a ação selecionada
   */
  const handleAction = async () => {
    if (!actionModal.action) return;

    const options = {
      projectId: project.id,
      reason: actionModal.reason,
      adminNotes: actionModal.adminNotes
    };

    let result;
    switch (actionModal.action) {
      case 'approve':
        result = await approveProject(options);
        break;
      case 'reject':
        if (!actionModal.reason.trim()) {
          return; // Razão é obrigatória para rejeição
        }
        result = await rejectProject({ ...options, reason: actionModal.reason });
        break;
      case 'resubmit':
        result = await resubmitProject(options);
        break;
      default:
        return;
    }

    if (result.success && result.newStatus) {
      onStatusChange?.(result.newStatus);
      closeActionModal();
    }
  };

  /**
   * Histórico mockado de mudanças de status
   * TODO: Integrar com API real
   */
  const statusHistory = [
    {
      status: 'pending_deposit' as ProjectStatus,
      timestamp: project.createdAt,
      user: 'Sistema',
      notes: 'Projeto criado, aguardando depósito'
    },
    ...(project.status !== 'pending_deposit' ? [{
      status: 'pending_approval' as ProjectStatus,
      timestamp: new Date(project.createdAt.getTime() + 3600000), // +1 hora
      user: 'Sistema',
      notes: 'Depósito realizado com sucesso'
    }] : []),
    ...(project.status === 'approved' ? [{
      status: 'approved' as ProjectStatus,
      timestamp: project.updatedAt || new Date(),
      user: 'Admin',
      notes: project.adminNotes || 'Projeto aprovado'
    }] : []),
    ...(project.status === 'rejected' ? [{
      status: 'rejected' as ProjectStatus,
      timestamp: project.updatedAt || new Date(),
      user: 'Admin',
      notes: project.rejectionReason || 'Projeto rejeitado'
    }] : [])
  ];

  const availableActions = getAvailableActions(project.status);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Status do Projeto</span>
          <Badge className={`${getStatusColor(project.status)} flex items-center gap-2`}>
            {getStatusIcon(project.status)}
            {getStatusDescription(project.status)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações do Status Atual */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-neutral-900">Status Atual</h4>
            <span className="text-sm text-neutral-600">
              {project.updatedAt?.toLocaleDateString() || project.createdAt.toLocaleDateString()}
            </span>
          </div>
          <p className="text-neutral-700 text-sm">
            {getStatusDescription(project.status)}
          </p>
          
          {/* Notas de Rejeição */}
          {project.status === 'rejected' && project.rejectionReason && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h5 className="font-medium text-red-900 mb-1">Motivo da Rejeição:</h5>
              <p className="text-red-700 text-sm">{project.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Ações Administrativas */}
        {isAdmin && availableActions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-neutral-900">Ações Disponíveis</h4>
            <div className="flex gap-2 flex-wrap">
              {availableActions.includes('approve') && (
                <Button
                  onClick={() => openActionModal('approve')}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
              )}
              {availableActions.includes('reject') && (
                <Button
                  onClick={() => openActionModal('reject')}
                  disabled={isLoading}
                  variant="destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar
                </Button>
              )}
              {availableActions.includes('resubmit') && (
                <Button
                  onClick={() => openActionModal('resubmit')}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Resubmeter
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Histórico de Status */}
        <div>
          <Button
            variant="ghost"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full justify-between p-0 h-auto font-semibold text-neutral-900"
          >
            Histórico de Mudanças
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-3"
            >
              {statusHistory.map((entry, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-neutral-200 last:border-b-0">
                  <div className={`p-2 rounded-full ${getStatusColor(entry.status)}`}>
                    {getStatusIcon(entry.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-neutral-900">
                        {getStatusDescription(entry.status)}
                      </h5>
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {entry.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-1">{entry.notes}</p>
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                      <User className="w-3 h-3" />
                      {entry.user}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Exibir Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Erro</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}
      </CardContent>

      {/* Modal de Ação */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={closeActionModal}
        title={`${actionModal.action === 'approve' ? 'Aprovar' : actionModal.action === 'reject' ? 'Rejeitar' : 'Resubmeter'} Projeto`}
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-neutral-900 mb-2">Projeto: {project.name}</h4>
            <p className="text-neutral-600 text-sm">
              {actionModal.action === 'approve' && 'Tem certeza que deseja aprovar este projeto?'}
              {actionModal.action === 'reject' && 'Informe o motivo da rejeição:'}
              {actionModal.action === 'resubmit' && 'Resubmeter projeto para nova análise:'}
            </p>
          </div>

          {actionModal.action === 'reject' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Motivo da Rejeição *
              </label>
              <Textarea
                value={actionModal.reason}
                onChange={(e) => setActionModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Descreva o motivo da rejeição..."
                rows={3}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Notas Administrativas (Opcional)
            </label>
            <Textarea
              value={actionModal.adminNotes}
              onChange={(e) => setActionModal(prev => ({ ...prev, adminNotes: e.target.value }))}
              placeholder="Adicione notas internas..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={closeActionModal}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAction}
              disabled={isLoading || (actionModal.action === 'reject' && !actionModal.reason.trim())}
              className={`flex-1 ${
                actionModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                actionModal.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Processando...' : 
                actionModal.action === 'approve' ? 'Aprovar' :
                actionModal.action === 'reject' ? 'Rejeitar' : 'Resubmeter'
              }
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};