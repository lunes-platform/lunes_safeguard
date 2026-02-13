/**
 * Contract Configuration
 * Configuração para integração com o smart contract SafeGard
 * 
 * Para alternar entre MOCK e REAL mode:
 * 1. Defina USE_MOCK_MODE = false para usar blockchain real
 * 2. Configure CONTRACT_ADDRESS com o endereço do contrato deployed
 * 3. Configure NETWORK para a rede desejada
 */

// ==================== CONFIGURAÇÃO PRINCIPAL ====================

/**
 * Modo Mock (desenvolvimento)
 * true = usa dados simulados (sem blockchain)
 * false = conecta com blockchain real
 */
export const USE_MOCK_MODE = true;

/**
 * Rede de conexão
 * 'mainnet' = Lunes Mainnet (produção)
 * 'testnet' = Lunes Testnet (staging)
 * 'local' = Node local (desenvolvimento)
 */
export const NETWORK: 'mainnet' | 'testnet' | 'local' = 'testnet';

// ==================== ENDEREÇOS DO CONTRATO ====================

/**
 * Endereços do contrato SafeGard por rede
 * Atualize após cada deploy
 */
export const CONTRACT_ADDRESSES = {
  mainnet: '', // Preenchido após deploy em mainnet
  testnet: '', // Preenchido após deploy em testnet
  local: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY' // Alice (dev)
};

// ==================== ENDPOINTS RPC ====================

export const RPC_ENDPOINTS = {
  mainnet: 'wss://rpc.lunes.io',
  testnet: 'wss://testnet.lunes.io',
  local: 'ws://127.0.0.1:9944'
};

// ==================== EXPLORERS ====================

export const EXPLORER_URLS = {
  mainnet: 'https://explorer.lunes.io',
  testnet: 'https://testnet-explorer.lunes.io',
  local: 'http://localhost:3000'
};

// ==================== TOKENS ====================

/**
 * Token IDs para os tokens suportados
 */
export const TOKEN_IDS = {
  LUNES: 1,
  LUSDT: 2
};

/**
 * Decimais por token
 */
export const TOKEN_DECIMALS = {
  LUNES: 18,
  LUSDT: 6
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Obtém a configuração atual
 */
export function getContractConfig() {
  return {
    useMock: USE_MOCK_MODE,
    network: NETWORK,
    contractAddress: CONTRACT_ADDRESSES[NETWORK],
    rpcEndpoint: RPC_ENDPOINTS[NETWORK],
    explorerUrl: EXPLORER_URLS[NETWORK]
  };
}

/**
 * Converte valor para unidades do token (com decimais)
 */
export function toTokenUnits(amount: number, tokenSymbol: 'LUNES' | 'LUSDT'): bigint {
  const decimals = TOKEN_DECIMALS[tokenSymbol];
  return BigInt(Math.floor(amount * 10 ** decimals));
}

/**
 * Converte de unidades do token para valor legível
 */
export function fromTokenUnits(units: bigint, tokenSymbol: 'LUNES' | 'LUSDT'): number {
  const decimals = TOKEN_DECIMALS[tokenSymbol];
  return Number(units) / 10 ** decimals;
}

/**
 * Obtém URL do explorer para uma transação
 */
export function getExplorerTxUrl(txHash: string): string {
  return `${EXPLORER_URLS[NETWORK]}/extrinsic/${txHash}`;
}

/**
 * Obtém URL do explorer para um endereço
 */
export function getExplorerAddressUrl(address: string): string {
  return `${EXPLORER_URLS[NETWORK]}/account/${address}`;
}

// ==================== LOG DE CONFIGURAÇÃO ====================

console.log(`
╔════════════════════════════════════════════════════════════╗
║             SafeGard Contract Configuration                ║
╠════════════════════════════════════════════════════════════╣
║  Mode:     ${USE_MOCK_MODE ? 'MOCK (simulação)' : 'REAL (blockchain)'}
║  Network:  ${NETWORK}
║  RPC:      ${RPC_ENDPOINTS[NETWORK]}
║  Contract: ${CONTRACT_ADDRESSES[NETWORK] || 'Não configurado'}
╚════════════════════════════════════════════════════════════╝
`);

export default getContractConfig;
