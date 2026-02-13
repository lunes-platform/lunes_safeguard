/**
 * Polkadot Service
 * Serviço de conexão com a blockchain Polkadot/Substrate
 */

import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';

// Configurações de rede
export const NETWORK_CONFIG = {
  // Lunes Mainnet
  mainnet: {
    name: 'Lunes Mainnet',
    rpcUrl: [
      'wss://ws-lunes-main-01.lunes.io',
      'wss://ws-lunes-main-02.lunes.io'
    ],
    explorerUrl: 'https://explorer.lunes.io'
  },
  // Testnet para desenvolvimento
  testnet: {
    name: 'Lunes Testnet',
    rpcUrl: 'wss://testnet.lunes.io',
    explorerUrl: 'https://testnet-explorer.lunes.io'
  },
  // Local para desenvolvimento
  local: {
    name: 'Local Node',
    rpcUrl: 'ws://127.0.0.1:9944',
    explorerUrl: 'http://localhost:3000'
  }
};

export type NetworkType = keyof typeof NETWORK_CONFIG;

export interface WalletAccount {
  address: string;
  name: string;
  source: string;
}

class PolkadotService {
  private api: ApiPromise | null = null;
  private accounts: WalletAccount[] = [];
  private currentNetwork: NetworkType = 'testnet';
  private isInitialized = false;

  /**
   * Initialize the Polkadot API connection
   */
  async init(network: NetworkType = 'testnet'): Promise<boolean> {
    if (this.api && this.isInitialized && this.currentNetwork === network) {
      return true;
    }

    try {
      this.currentNetwork = network;
      const config = NETWORK_CONFIG[network];

      console.log(`[PolkadotService] Connecting to ${config.name}...`);

      const provider = new WsProvider(config.rpcUrl);
      this.api = await ApiPromise.create({ provider });

      await this.api.isReady;
      this.isInitialized = true;

      const [chain, nodeName, nodeVersion] = await Promise.all([
        this.api.rpc.system.chain(),
        this.api.rpc.system.name(),
        this.api.rpc.system.version()
      ]);

      console.log(`[PolkadotService] Connected to ${chain} using ${nodeName} v${nodeVersion}`);

      return true;
    } catch (error) {
      console.error('[PolkadotService] Failed to connect:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Get the API instance
   */
  getApi(): ApiPromise | null {
    return this.api;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.isInitialized && this.api !== null && this.api.isConnected;
  }

  /**
   * Connect to Polkadot.js extension and get accounts
   */
  async connectWallet(): Promise<WalletAccount[]> {
    try {
      // Request access to the extension
      const extensions = await web3Enable('Lunes SafeGuard');

      if (extensions.length === 0) {
        throw new Error('Nenhuma extensão Polkadot.js encontrada. Por favor, instale a extensão.');
      }

      // Get all accounts
      const allAccounts = await web3Accounts();

      this.accounts = allAccounts.map(account => ({
        address: account.address,
        name: account.meta.name || 'Unknown',
        source: account.meta.source
      }));

      console.log(`[PolkadotService] Found ${this.accounts.length} accounts`);

      return this.accounts;
    } catch (error) {
      console.error('[PolkadotService] Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * Get connected accounts
   */
  getAccounts(): WalletAccount[] {
    return this.accounts;
  }

  /**
   * Get signer for a specific address
   */
  async getSigner(address: string) {
    const injector = await web3FromAddress(address);
    return injector.signer;
  }

  /**
   * Get injector for a specific address
   */
  async getInjector(address: string) {
    return await web3FromAddress(address);
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<string> {
    if (!this.api) {
      throw new Error('API not initialized');
    }

    const { data: { free } } = await this.api.query.system.account(address) as any;
    return free.toString();
  }

  /**
   * Format balance with decimals
   */
  formatBalance(balance: string, decimals: number = 12): string {
    const value = BigInt(balance);
    const divisor = BigInt(10 ** decimals);
    const integerPart = value / divisor;
    const fractionalPart = value % divisor;

    const fractionalStr = fractionalPart.toString().padStart(decimals, '0').slice(0, 4);
    return `${integerPart}.${fractionalStr}`;
  }

  /**
   * Disconnect from the network
   */
  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
      this.isInitialized = false;
    }
  }

  /**
   * Get current network config
   */
  getNetworkConfig() {
    return NETWORK_CONFIG[this.currentNetwork];
  }

  /**
   * Get explorer URL for a transaction
   */
  getExplorerUrl(txHash: string): string {
    const config = NETWORK_CONFIG[this.currentNetwork];
    return `${config.explorerUrl}/extrinsic/${txHash}`;
  }
}

// Singleton instance
export const polkadotService = new PolkadotService();
export default polkadotService;
