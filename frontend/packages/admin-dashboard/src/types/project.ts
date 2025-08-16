/**
 * Tipos relacionados aos projetos do Lunes SafeGuard
 */

export interface CreateProjectData {
  name: string;
  description: string;
  contractAddress: string;
  tokenAddress: string;
  website?: string | undefined;
  documentation?: string | undefined;
  initialGuarantee: number;
}

export interface Project extends CreateProjectData {
  id: string;
  transactionHash?: string;
  createdAt: string;
  createdBy: string;
  status: 'active' | 'inactive' | 'pending';
  logo?: string;
}

export type ProjectStatus = 'active' | 'inactive' | 'pending';

export interface ProjectInfo {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  lunesAmount: number;
  contractAddress: string;
  tokenAddress: string;
  website?: string;
  documentation?: string;
  logo?: string;
  createdAt: string;
  createdBy: string;
}