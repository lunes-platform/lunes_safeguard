import { Project } from './project';

export type VoteType = 'community' | 'milestone_release' | 'cancellation';

export interface Vote {
  id: string;
  projectId: string;
  project: Project;
  type: VoteType;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  voters: string[];
}