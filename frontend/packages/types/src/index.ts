// Core SafeGuard Types
export * from './common';
export * from './project';
export * from './guarantee';
export * from './voting';
export * from './user';
export * from './api';
export * from './safeguard';

// Re-export commonly used types for convenience
export type {
  Address,
  Amount,
  Hash,
  LoadingState,
} from './common';

export type {
  Project,
  ProjectStatus,
} from './project';

export type {
  GuaranteeBreakdown,
} from './guarantee';

export type {
  VotingData,
  VotingStatus,
  VotingStats,
} from './voting';

export type {
  UserProfile,
  UserRole,
} from './user';

export type {
  ApiResponse,
  PaginatedResponse,
  NetworkConfig,
  PlatformVotingStats,
} from './api';