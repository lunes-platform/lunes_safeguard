// Legacy Ethereum-only exports (maintained for backward compatibility)
export * from './provider';
export * from './useWallet';
export * from './store/walletStore';

// Substrate/Polkadot exports
export { SubstrateProvider, useSubstrate, useSubstrateWallet } from './polkadot/SubstrateProvider';
export type { 
  SubstrateWallet, 
  SubstrateAccount, 
  SubstrateWalletContextType,
  LunesNetworkConfig 
} from './polkadot/types';

// Unified wallet exports (recommended for new implementations)
export { 
  UnifiedWalletProvider, 
  useUnifiedWalletContext, 
  useUnifiedWallet 
} from './unified/UnifiedWalletProvider';
export type { 
  UnifiedWalletInfo, 
  UnifiedAccount, 
  UnifiedWalletState 
} from './unified/types';
export { WalletType } from './unified/types';

// Diagnostic utilities
export {
  runFullDiagnostic,
  printDiagnosticReport,
  diagnose,
  quickTests
} from './utils/diagnostics';
export type {
  DiagnosticResult,
  DiagnosticReport
} from './utils/diagnostics';

export * from './utils/chromeExtensionErrorHandler';
export { chromeExtensionErrorHandler } from './utils/chromeExtensionErrorHandler';

// Diagnostic components
export { DiagnosticPanel } from './components/DiagnosticPanel';