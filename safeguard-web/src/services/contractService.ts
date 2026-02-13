/**
 * SafeGard Contract Service
 * Serviço para integração com o smart contract ink!
 * 
 * Este serviço suporta:
 * - Modo MOCK: Para desenvolvimento sem blockchain
 * - Modo REAL: Integração com @polkadot/api-contract
 */

import { ApiPromise } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { polkadotService } from './polkadotService';

// Contract ABI - será carregado do arquivo JSON compilado
// Por enquanto, usando um ABI simplificado para as funções principais
const CONTRACT_ABI = {
  source: { hash: '', language: 'ink! 4.3.0', compiler: 'rustc 1.70.0' },
  contract: { name: 'safeguard', version: '1.0.0' },
  spec: {
    constructors: [{ label: 'new', selector: '0x9bae9d5e' }],
    messages: [
      {
        label: 'register_project',
        selector: '0x4e6f7465',
        mutates: true,
        payable: false,
        args: [
          { label: 'name', type: { lookup: 0 } },
          { label: 'metadata_uri', type: { lookup: 0 } },
          { label: 'token_contract', type: { lookup: 1 } },
          { label: 'treasury_address', type: { lookup: 1 } }
        ]
      },
      {
        label: 'get_project_total_guarantee',
        selector: '0xec292f7c', // Placeholder or label-based resolution
        mutates: false,
        payable: false,
        args: [
          { label: 'project_id', type: { lookup: 2 } },
          { label: 'token_id', type: { lookup: 2 } }
        ]
      },
      { label: 'get_supported_tokens', selector: '0x995779c1', mutates: false, payable: false },
    ]
  }
};

// Endereço do contrato deployed (configurar para cada ambiente)
const CONTRACT_ADDRESSES = {
  mainnet: '',
  testnet: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', // Default dev account for local/testnet
  local: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
};

// Types matching the smart contract
export type ProjectId = number;
export type VotingId = number;
export type TokenId = number;
export type Balance = bigint;
export type AccountId = string;

export type ProjectStatus = 'active' | 'voting' | 'liquidating' | 'closed' | 'paused';
export type VoteResult = 'approved' | 'rejected' | 'pending';

export interface ProjectVault {
  projectId: ProjectId;
  totalLunes: Balance;
  totalLusdt: Balance;
  nftCollateralCount: number;
  creationTimestamp: number;
  lastVotingTimestamp: number;
  status: ProjectStatus;
}

export interface ProjectInfo {
  id: ProjectId;
  name: string;
  owner: string;
  pairPsp22: string | null;
  voteYes: number;
  voteNo: number;
  totalGuarantee: Balance;
  withdrawEnabled: boolean;
  status: ProjectStatus;
  creationTimestamp: number;
  score: number;
  metadataUri?: string;
}

export interface VotingInfo {
  votingId: VotingId;
  projectId: ProjectId;
  startTime: number;
  endTime: number;
  votesYes: Balance;
  votesNo: Balance;
  quorumRequired: number;
  result: VoteResult;
  isActive: boolean;
  timeLeft?: number; // Added for UI helper
}

export interface ClaimInfo {
  projectId: ProjectId;
  user: string;
  claimableAmount: Balance;
  claimedAmount: Balance;
  claimDeadline: number;
}

export interface ScoreParameters {
  alpha: Balance;        // Base threshold multiplier
  gamma: number;         // Project size exponent
  delta: number;         // Asset diversity exponent
  tMin: Balance;         // Minimum threshold
  theta: number;         // Burn progress factor
  sRef: Balance;         // Reference project size
  floorF: Balance;       // Burn floor
  kappa: number;         // Reserved parameter
  epsilon: number;       // Reserved parameter
}

export interface ContractConfig {
  useMock: boolean;
  network: 'mainnet' | 'testnet' | 'local';
  contractAddress?: string;
}

// Mock data for development
const MOCK_PROJECTS: ProjectInfo[] = [
  {
    id: 1,
    name: 'Lunes DeFi Protocol',
    owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    pairPsp22: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    voteYes: 1250000,
    voteNo: 180000,
    totalGuarantee: BigInt('2500000000000000000000000'), // 2.5M LUNES
    withdrawEnabled: false,
    status: 'active',
    creationTimestamp: Date.now() - 365 * 24 * 60 * 60 * 1000,
    score: 95
  },
  {
    id: 2,
    name: 'Lunes NFT Marketplace',
    owner: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    pairPsp22: null,
    voteYes: 800000,
    voteNo: 50000,
    totalGuarantee: BigInt('1800000000000000000000000'), // 1.8M LUNES
    withdrawEnabled: false,
    status: 'active',
    creationTimestamp: Date.now() - 300 * 24 * 60 * 60 * 1000,
    score: 88
  },
  {
    id: 3,
    name: 'Lunes Gaming Platform',
    owner: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
    pairPsp22: '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY',
    voteYes: 500000,
    voteNo: 200000,
    totalGuarantee: BigInt('1200000000000000000000000'), // 1.2M LUNES
    withdrawEnabled: false,
    status: 'voting',
    creationTimestamp: Date.now() - 200 * 24 * 60 * 60 * 1000,
    score: 82,
    metadataUri: 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'
  }
];

const MOCK_VOTINGS: VotingInfo[] = [
  {
    votingId: 1,
    projectId: 3,
    startTime: Date.now() - 3 * 24 * 60 * 60 * 1000,
    endTime: Date.now() + 4 * 24 * 60 * 60 * 1000,
    votesYes: BigInt('500000000000000000000000'),
    votesNo: BigInt('200000000000000000000000'),
    quorumRequired: 75,
    result: 'pending',
    isActive: true,
    timeLeft: 4 * 24 * 60 * 60 * 1000
  }
];

// Simulated delay for realistic API behavior - Reduced for better UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms / 2)); // 50% faster

/**
 * Contract Service - Handles all interactions with the SafeGard smart contract
 * Supports both MOCK mode (for development) and REAL mode (with blockchain)
 */
class ContractService {
  private isConnected: boolean = false;
  private mockMode: boolean = true; // Set via configure()
  private contract: ContractPromise | null = null;
  private api: ApiPromise | null = null;
  private currentAccount: string | null = null;
  private network: 'mainnet' | 'testnet' | 'local' = 'testnet';

  constructor() {
    // Check environment to determine mode
    const envMode = typeof window !== 'undefined'
      ? (window as unknown as Record<string, string>).VITE_CONTRACT_MODE
      : 'mock';
    this.mockMode = envMode !== 'real';
    console.log(`[ContractService] Initialized in ${this.mockMode ? 'MOCK' : 'REAL'} mode`);
  }

  /**
   * Configure the service
   */
  configure(config: ContractConfig): void {
    this.mockMode = config.useMock;
    this.network = config.network;
    console.log(`[ContractService] Configured: mockMode=${this.mockMode}, network=${this.network}`);
  }

  /**
   * Safe method to throw error if in real mode and not implemented
   */
  private checkRealMode(methodName: string) {
    if (!this.mockMode) {
      console.warn(`[ContractService] ${methodName} called in REAL mode but not implemented/connected.`);
      throw new Error(`Real contract integration for ${methodName} is not fully implemented yet. Please switch to Mock mode.`);
    }
  }

  /**
   * Connect to the blockchain
   */
  async connect(): Promise<boolean> {
    if (this.mockMode) {
      await delay(300); // Faster connection in mock
      this.isConnected = true;
      console.log('[ContractService] Connected (mock mode)');
      return true;
    }

    try {
      console.log(`[ContractService] Attempting to connect to ${this.network}...`);
      // Connect to Polkadot network
      const connected = await polkadotService.init(this.network);
      if (!connected) {
        throw new Error('Failed to connect to Polkadot network');
      }

      this.api = polkadotService.getApi();
      if (!this.api) {
        throw new Error('API not available');
      }

      // Initialize contract instance
      const contractAddress = CONTRACT_ADDRESSES[this.network];
      if (!contractAddress || contractAddress.length < 10) {
        console.warn(`[ContractService] No valid contract address for ${this.network}. Flow might adhere to read-only.`);
        // Don't throw here to allow at least read-only or partial functionality if possible
      } else {
        this.contract = new ContractPromise(this.api, CONTRACT_ABI as unknown as Record<string, unknown>, contractAddress);
      }

      this.isConnected = true;

      console.log(`[ContractService] Connected to ${this.network}`);
      return true;
    } catch (error) {
      console.error('[ContractService] Connection failed:', error);
      return false;
    }
  }

  /**
   * Set the current account for transactions
   */
  setAccount(address: string): void {
    this.currentAccount = address;
    console.log(`[ContractService] Account set: ${address.slice(0, 8)}...`);
  }

  /**
   * Check if connected
   */
  isContractConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Check if in mock mode
   */
  isMockMode(): boolean {
    return this.mockMode;
  }

  // ==================== PROJECT FUNCTIONS ====================

  /**
   * Register a new project
   */
  async registerProject(
    name: string,
    metadataUri: string,
    owner: string,
    pairPsp22?: string
  ): Promise<{ projectId: ProjectId; txHash: string }> {
    // MOCK MODE
    if (this.mockMode) {
      await delay(800); // Faster
      const newId = MOCK_PROJECTS.length + 1;
      MOCK_PROJECTS.push({
        id: newId,
        name,
        owner,
        pairPsp22: pairPsp22 || null,
        voteYes: 0,
        voteNo: 0,
        totalGuarantee: BigInt(0),
        withdrawEnabled: false,
        status: 'active',
        creationTimestamp: Date.now(),
        score: 50 // Start with base score
      });

      return {
        projectId: newId,
        txHash: `0x${Math.random().toString(16).slice(2)}`
      };
    }

    // REAL MODE - Contract call
    if (!this.isConnected || !this.contract) {
      throw new Error('Contract not connected. Call connect() first.');
    }

    if (!this.currentAccount) {
      throw new Error('No account set. Call setAccount() first.');
    }

    try {
      console.log(`[ContractService] Registering project "${name}" in REAL mode...`);

      // Get the signer from polkadotService
      const injector = await polkadotService.getInjector(this.currentAccount);

      // Perform the transaction
      // @ts-ignore - ink! parameters mapping
      const gasLimit = 100000000000; // Placeholder gas limit, ideally estimated
      const storageDepositLimit = null;

      // Parameters: name, metadata_uri, token_contract, treasury_address
      const tx = this.contract.tx.register_project(
        { gasLimit, storageDepositLimit },
        name,
        metadataUri,
        pairPsp22 || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', // Placeholder if null
        owner
      );

      const txHash = await new Promise<string>((resolve, reject) => {
        tx.signAndSend(this.currentAccount!, { signer: injector.signer }, (result) => {
          if (result.status.isInBlock) {
            console.log(`[ContractService] Transaction in block: ${result.status.asInBlock.toHex()}`);
            resolve(result.txHash.toHex());
          } else if (result.status.isFinalized) {
            console.log(`[ContractService] Transaction finalized`);
          } else if (result.isError) {
            reject(new Error('Transaction failed'));
          }
        });
      });

      // After registration, we might want to fetch the project ID from events
      // For now, return a placeholder or 0 as we need event parsing for real ID
      return { projectId: 0, txHash };
    } catch (error) {
      console.error('[ContractService] registerProject failed:', error);
      throw error;
    }
  }

  /**
   * Get project info by ID
   */
  async getProjectInfo(projectId: ProjectId): Promise<ProjectInfo | null> {
    if (this.mockMode) {
      await delay(150); // Very fast read
      return MOCK_PROJECTS.find(p => p.id === projectId) || null;
    }

    if (!this.isConnected || !this.contract) {
      throw new Error('Contract not connected');
    }

    try {
      // @ts-ignore
      const { result, output } = await this.contract.query.get_project_info(
        this.currentAccount || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        { gasLimit: -1 },
        projectId
      );

      if (result.isOk && output) {
        const data = output.toHuman() as any;
        if (!data) return null;

        // Map contract data to ProjectInfo
        return {
          id: projectId,
          name: data.name || '',
          owner: data.owner || '',
          pairPsp22: data.pairPsp22 || null,
          voteYes: parseInt(data.qtdVoteYes || '0'),
          voteNo: parseInt(data.qtdVoteNo || '0'),
          totalGuarantee: BigInt(0), // Would need another query for total collateral
          withdrawEnabled: data.statusWithdraw || false,
          status: data.status ? 'active' : 'paused',
          creationTimestamp: parseInt(data.creationTimestamp || '0'),
          score: 0, // Placeholder
          metadataUri: data.metadataUri || ''
        };
      }
      return null;
    } catch (error) {
      console.error('[ContractService] getProjectInfo failed:', error);
      return null;
    }
  }

  /**
   * Get all projects
   * In Pure dApp mode, we iterate through project IDs from the contract
   */
  async getAllProjects(): Promise<ProjectInfo[]> {
    if (this.mockMode) {
      await delay(300);
      return [...MOCK_PROJECTS];
    }

    if (!this.isConnected || !this.contract) {
      return [];
    }

    try {
      // 1. Get total projects from contract
      // @ts-ignore
      const { result, output } = await this.contract.query.get_next_project_id(
        this.currentAccount || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        { gasLimit: -1 }
      );

      let nextId = 1;
      if (result.isOk && output) {
        nextId = parseInt(output.toString() || '1');
      }

      const projects: ProjectInfo[] = [];
      const MAX_ITERATIONS = Math.min(nextId - 1, 100); // Guard against infinite or too many calls

      for (let i = 1; i <= MAX_ITERATIONS; i++) {
        const info = await this.getProjectInfo(i);
        if (info) {
          projects.push(info);
        }
      }
      return projects;
    } catch (error) {
      console.error('[ContractService] getAllProjects failed:', error);
      return [];
    }
  }

  /**
   * Get project score
   */
  async getProjectScore(projectId: ProjectId): Promise<number> {
    if (this.mockMode) {
      await delay(100);
      const project = MOCK_PROJECTS.find(p => p.id === projectId);
      return project?.score || 0;
    }

    if (!this.isConnected || !this.contract) return 0;

    try {
      // @ts-ignore
      const { result, output } = await this.contract.query.get_project_score(
        this.currentAccount || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        { gasLimit: -1 },
        projectId
      );

      if (result.isOk && output) {
        return parseInt(output.toString() || '0');
      }
      return 0;
    } catch (error) {
      console.error('[ContractService] getProjectScore failed:', error);
      return 0;
    }
  }

  /**
   * Get project vault info
   */
  async getProjectVault(projectId: ProjectId): Promise<ProjectVault | null> {
    if (this.mockMode) {
      await delay(200);
      const project = MOCK_PROJECTS.find(p => p.id === projectId);
      if (!project) return null;

      return {
        projectId: project.id,
        totalLunes: project.totalGuarantee,
        totalLusdt: BigInt(0),
        nftCollateralCount: 0,
        creationTimestamp: project.creationTimestamp,
        lastVotingTimestamp: 0,
        status: project.status
      };
    }

    if (!this.isConnected || !this.contract) return null;

    try {
      // 1. Get Lunes balance (TokenId 0 assumed for Lunes)
      // @ts-ignore
      const { result: res0, output: out0 } = await this.contract.query.get_project_total_guarantee(
        this.currentAccount || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        { gasLimit: -1 },
        projectId,
        0 // Lunes
      );

      // 2. Get LUSDT balance (TokenId 1 assumed for LUSDT)
      // @ts-ignore
      const { result: res1, output: out1 } = await this.contract.query.get_project_total_guarantee(
        this.currentAccount || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        { gasLimit: -1 },
        projectId,
        1 // LUSDT
      );

      const totalLunes = res0.isOk && out0 ? BigInt(out0.toString().replace(/,/g, '')) : BigInt(0);
      const totalLusdt = res1.isOk && out1 ? BigInt(out1.toString().replace(/,/g, '')) : BigInt(0);

      // Fetch project info for timestamps/status
      const info = await this.getProjectInfo(projectId);

      return {
        projectId,
        totalLunes,
        totalLusdt,
        nftCollateralCount: 0, // Need multi-asset implementation for full NFT support
        creationTimestamp: info?.creationTimestamp || 0,
        lastVotingTimestamp: 0,
        status: info?.status || 'active'
      };
    } catch (error) {
      console.error('[ContractService] getProjectVault failed:', error);
      return null;
    }
  }

  // ==================== GUARANTEE FUNCTIONS ====================

  /**
   * Add guarantee to a project
   */
  async addGuarantee(
    projectId: ProjectId,
    tokenId: TokenId,
    amount: Balance
  ): Promise<{ txHash: string }> {
    // MOCK MODE
    if (this.mockMode) {
      await delay(1000);
      const project = MOCK_PROJECTS.find(p => p.id === projectId);
      if (project) {
        project.totalGuarantee = project.totalGuarantee + amount;
        // Update score simulation
        project.score = Math.min(100, project.score + 5);
      }
      return { txHash: `0x${Math.random().toString(16).slice(2)}` };
    }

    if (!this.isConnected || !this.contract || !this.currentAccount) {
      throw new Error('Contract or account not connected');
    }

    try {
      const injector = await polkadotService.getInjector(this.currentAccount);

      // @ts-ignore
      const gasLimit = 100000000000;

      const tx = this.contract.tx.add_guarantee(
        { gasLimit },
        projectId,
        tokenId,
        amount
      );

      const txHash = await new Promise<string>((resolve, reject) => {
        tx.signAndSend(this.currentAccount!, { signer: injector.signer }, (result) => {
          if (result.status.isInBlock) {
            resolve(result.txHash.toHex());
          } else if (result.isError) {
            reject(new Error('Transaction failed'));
          }
        });
      });

      return { txHash };
    } catch (error) {
      console.error('[ContractService] addGuarantee failed:', error);
      throw error;
    }
  }

  /**
   * Withdraw guarantee from a project
   */
  async withdrawGuarantee(
    projectId: ProjectId,
    tokenId: TokenId,
    amount: Balance
  ): Promise<{ txHash: string }> {
    // MOCK MODE
    if (this.mockMode) {
      await delay(1000);
      const project = MOCK_PROJECTS.find(p => p.id === projectId);
      if (project && project.totalGuarantee >= amount) {
        project.totalGuarantee = project.totalGuarantee - amount;
      }
      return { txHash: `0x${Math.random().toString(16).slice(2)}` };
    }

    if (!this.isConnected || !this.contract || !this.currentAccount) {
      throw new Error('Contract or account not connected');
    }

    try {
      const injector = await polkadotService.getInjector(this.currentAccount);

      // @ts-ignore
      const gasLimit = 100000000000;

      const tx = this.contract.tx.withdraw_guarantee(
        { gasLimit },
        projectId,
        tokenId,
        amount
      );

      const txHash = await new Promise<string>((resolve, reject) => {
        tx.signAndSend(this.currentAccount!, { signer: injector.signer }, (result) => {
          if (result.status.isInBlock) {
            resolve(result.txHash.toHex());
          } else if (result.isError) {
            reject(new Error('Transaction failed'));
          }
        });
      });

      return { txHash };
    } catch (error) {
      console.error('[ContractService] withdrawGuarantee failed:', error);
      throw error;
    }
  }

  /**
   * Get user guarantee for a project
   */
  async getUserGuarantee(
    projectId: ProjectId,
    tokenId: TokenId,
    user: string
  ): Promise<Balance> {
    if (this.mockMode) {
      await delay(150);
      return BigInt(100000 * 10 ** 18); // Mock 100k
    }

    if (!this.isConnected || !this.contract) return BigInt(0);

    try {
      // @ts-ignore
      const { result, output } = await this.contract.query.get_user_guarantee(
        this.currentAccount || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        { gasLimit: -1 },
        projectId,
        tokenId,
        user
      );

      if (result.isOk && output) {
        return BigInt(output.toString() || '0');
      }
      return BigInt(0);
    } catch (error) {
      console.error('[ContractService] getUserGuarantee failed:', error);
      return BigInt(0);
    }
  }

  // ==================== VOTING FUNCTIONS ====================

  /**
   * Start annual voting for a project
   */
  async startAnnualVoting(projectId: ProjectId): Promise<{ votingId: VotingId; txHash: string }> {
    // MOCK MODE
    if (this.mockMode) {
      await delay(1000);
      const newVotingId = MOCK_VOTINGS.length + 1;
      MOCK_VOTINGS.push({
        votingId: newVotingId,
        projectId,
        startTime: Date.now(),
        endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
        votesYes: BigInt(0),
        votesNo: BigInt(0),
        quorumRequired: 75,
        result: 'pending',
        isActive: true,
        timeLeft: 7 * 24 * 60 * 60 * 1000
      });

      const project = MOCK_PROJECTS.find(p => p.id === projectId);
      if (project) project.status = 'voting';

      return {
        votingId: newVotingId,
        txHash: `0x${Math.random().toString(16).slice(2)}`
      };
    }

    // REAL MODE
    if (!this.isConnected || !this.contract || !this.currentAccount) {
      throw new Error('Contract or account not connected');
    }

    try {
      const injector = await polkadotService.getInjector(this.currentAccount);
      const gasLimit = 100000000000;

      const tx = this.contract.tx.start_annual_voting(
        { gasLimit },
        projectId
      );

      const result = await new Promise<{ votingId: VotingId; txHash: string }>((resolve, reject) => {
        tx.signAndSend(this.currentAccount!, { signer: injector.signer }, (result) => {
          if (result.status.isInBlock) {
            // Find the voting ID from events if possible, or assume success
            // For now, we return the txHash and a generic success indicator
            resolve({
              votingId: 0, // In dynamic apps, we'd parse the event
              txHash: result.txHash.toHex()
            });
          } else if (result.isError) {
            reject(new Error('Transaction failed'));
          }
        });
      });

      return result;
    } catch (error) {
      console.error('[ContractService] startAnnualVoting failed:', error);
      throw error;
    }
  }

  /**
   * Vote on a proposal
   */
  async vote(
    projectId: ProjectId,
    voteValue: boolean // true = yes, false = no
  ): Promise<{ txHash: string }> {
    // MOCK MODE
    if (this.mockMode) {
      await delay(800);
      const voting = MOCK_VOTINGS.find(v => v.projectId === projectId && v.isActive);
      if (voting) {
        const voteAmount = BigInt(100000 * 10 ** 18); // Mock vote weight
        if (voteValue) {
          voting.votesYes = voting.votesYes + voteAmount;
        } else {
          voting.votesNo = voting.votesNo + voteAmount;
        }
      }
      return { txHash: `0x${Math.random().toString(16).slice(2)}` };
    }

    if (!this.isConnected || !this.contract || !this.currentAccount) {
      throw new Error('Contract or account not connected');
    }

    try {
      const injector = await polkadotService.getInjector(this.currentAccount);

      // @ts-ignore
      const gasLimit = 100000000000;

      const tx = this.contract.tx.vote_on_proposal(
        { gasLimit },
        projectId,
        voteValue
      );

      const txHash = await new Promise<string>((resolve, reject) => {
        tx.signAndSend(this.currentAccount!, { signer: injector.signer }, (result) => {
          if (result.status.isInBlock) {
            resolve(result.txHash.toHex());
          } else if (result.isError) {
            reject(new Error('Transaction failed'));
          }
        });
      });

      return { txHash };
    } catch (error) {
      console.error('[ContractService] vote failed:', error);
      throw error;
    }
  }

  /**
   * Get voting info
   */
  async getVotingInfo(votingId: VotingId): Promise<VotingInfo | null> {
    if (this.mockMode) {
      await delay(150);
      return MOCK_VOTINGS.find(v => v.votingId === votingId) || null;
    }

    if (!this.isConnected || !this.contract) return null;

    try {
      const { result, output } = await this.contract.query.get_voting_info(
        this.currentAccount || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        { gasLimit: -1 },
        votingId
      );

      if (result.isOk && output) {
        const data = output.toHuman() as any;
        if (!data) return null;

        return {
          votingId,
          projectId: Number(data.projectId),
          startTime: Number(data.startTimestamp),
          endTime: Number(data.endTimestamp),
          votesYes: BigInt(data.yesVotes.toString().replace(/,/g, '')),
          votesNo: BigInt(data.noVotes.toString().replace(/,/g, '')),
          quorumRequired: 75, // Default for annual voting
          result: data.result.toLowerCase() as any,
          isActive: data.result === 'Pending' && Date.now() < Number(data.endTimestamp),
          timeLeft: Math.max(0, Number(data.endTimestamp) - Date.now())
        };
      }
      return null;
    } catch (error) {
      console.error('[ContractService] getVotingInfo failed:', error);
      return null;
    }
  }

  /**
   * Get active voting for a project
   */
  async getActiveVoting(projectId: ProjectId): Promise<VotingInfo | null> {
    if (this.mockMode) {
      await delay(150);
      return MOCK_VOTINGS.find(v => v.projectId === projectId && v.isActive) || null;
    }

    if (!this.isConnected || !this.contract) return null;

    try {
      // First, get the project vault to find current_voting_id
      const { result, output } = await this.contract.query.get_project_vault(
        this.currentAccount || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        { gasLimit: -1 },
        projectId
      );

      if (result.isOk && output) {
        const vault = output.toHuman() as any;
        if (vault && vault.currentVotingId) {
          const votingId = Number(vault.currentVotingId.replace(/,/g, ''));
          return this.getVotingInfo(votingId);
        }
      }
      return null;
    } catch (error) {
      console.error('[ContractService] getActiveVoting failed:', error);
      return null;
    }
  }

  /**
   * Check if user has voted
   */
  async hasVoted(projectId: ProjectId, user: string): Promise<boolean> {
    if (this.mockMode) {
      await delay(100);
      return Math.random() > 0.5; // Random for demo
    }

    if (!this.isConnected || !this.contract) return false;

    try {
      const { result, output } = await this.contract.query.has_voted(
        this.currentAccount || user,
        { gasLimit: -1 },
        projectId,
        user
      );

      if (result.isOk && output) {
        return (output.toHuman() as any) === true;
      }
      return false;
    } catch (error) {
      console.error('[ContractService] hasVoted failed:', error);
      return false;
    }
  }

  /**
   * Finalize voting
   */
  async finalizeVoting(projectId: ProjectId): Promise<{ result: VoteResult; txHash: string }> {
    // MOCK MODE
    if (this.mockMode) {
      await delay(1000);
      const voting = MOCK_VOTINGS.find(v => v.projectId === projectId && v.isActive);
      if (voting) {
        const totalVotes = voting.votesYes + voting.votesNo;
        const approvalRate = totalVotes > 0
          ? Number(voting.votesYes * BigInt(100) / totalVotes)
          : 0;

        voting.result = approvalRate >= voting.quorumRequired ? 'approved' : 'rejected';
        voting.isActive = false;

        const project = MOCK_PROJECTS.find(p => p.id === projectId);
        if (project) {
          project.status = voting.result === 'approved' ? 'active' : 'liquidating';
        }

        return {
          result: voting.result,
          txHash: `0x${Math.random().toString(16).slice(2)}`
        };
      }
      throw new Error('No active voting found');
    }

    // REAL MODE
    if (!this.isConnected || !this.contract || !this.currentAccount) {
      throw new Error('Contract or account not connected');
    }

    try {
      const injector = await polkadotService.getInjector(this.currentAccount);
      const gasLimit = 100000000000;

      const tx = this.contract.tx.finalize_voting(
        { gasLimit },
        projectId
      );

      const txHash = await new Promise<string>((resolve, reject) => {
        tx.signAndSend(this.currentAccount!, { signer: injector.signer }, (result) => {
          if (result.status.isInBlock) {
            resolve(result.txHash.toHex());
          } else if (result.isError) {
            reject(new Error('Transaction failed'));
          }
        });
      });

      // After finalization, the result would be in the events. 
      // For the UI, we just return the txHash and expected result would be fetched by refreshing.
      return { result: 'pending' as any, txHash };
    } catch (error) {
      console.error('[ContractService] finalizeVoting failed:', error);
      throw error;
    }
  }

  // ==================== SCORE FUNCTIONS ====================

  /**
   * Get score parameters
   */
  async getScoreParameters(): Promise<ScoreParameters> {
    await delay(150);

    if (this.mockMode) {
      return {
        alpha: BigInt(500000 * 10 ** 18),
        gamma: 1.2,
        delta: 1.0,
        tMin: BigInt(100000 * 10 ** 18),
        theta: 0.20,
        sRef: BigInt(1000000000 * 10 ** 18),
        floorF: BigInt(50000000 * 10 ** 18),
        kappa: 0.0,
        epsilon: 0.0
      };
    }

    this.checkRealMode('getScoreParameters');
    return {} as ScoreParameters;
  }

  /**
   * Calculate project score (client-side estimation)
   */
  calculateScoreEstimate(
    lunesAmount: number,
    otherTokensValue: number,
    nftValue: number
  ): number {
    // Simplified Score v1.1 calculation for UI preview
    if (lunesAmount === 0) return 0;

    const T_min = 100000; // 100k LUNES minimum
    const lunesScore = Math.min(95, (lunesAmount / T_min) * 95);
    const otherScore = Math.min(5, (otherTokensValue / 100000) * 2.5 + (nftValue / 50000) * 2.5);

    return Math.round(Math.min(100, lunesScore + otherScore));
  }

  // ==================== CLAIM FUNCTIONS ====================

  /**
   * Process claim for liquidating project
   */
  async processClaim(projectId: ProjectId): Promise<{ txHash: string; amount: Balance }> {
    // MOCK MODE
    if (this.mockMode) {
      await delay(1000);
      return {
        txHash: `0x${Math.random().toString(16).slice(2)}`,
        amount: BigInt(10000 * 10 ** 18) // Mock claim amount
      };
    }

    if (!this.isConnected || !this.contract || !this.currentAccount) {
      throw new Error('Contract or account not connected');
    }

    try {
      const injector = await polkadotService.getInjector(this.currentAccount);
      const gasLimit = 100000000000;

      const tx = this.contract.tx.process_claim(
        { gasLimit },
        projectId
      );

      const txHash = await new Promise<string>((resolve, reject) => {
        tx.signAndSend(this.currentAccount!, { signer: injector.signer }, (result) => {
          if (result.status.isInBlock) {
            resolve(result.txHash.toHex());
          } else if (result.isError) {
            reject(new Error('Transaction failed'));
          }
        });
      });

      return { txHash, amount: BigInt(0) }; // Amount would be confirmed in event
    } catch (error) {
      console.error('[ContractService] processClaim failed:', error);
      throw error;
    }
  }

  /**
   * Get user claim info
   */
  async getUserClaim(projectId: ProjectId, user: AccountId): Promise<ClaimInfo | null> {
    if (this.mockMode) {
      await delay(150);
      return {
        projectId,
        user,
        claimableAmount: BigInt(10000 * 10 ** 18),
        claimedAmount: BigInt(0),
        claimDeadline: Date.now() + 30 * 24 * 60 * 60 * 1000
      };
    }

    if (!this.isConnected || !this.contract) return null;

    try {
      const { result, output } = await this.contract.query.get_user_claim(
        this.currentAccount || user,
        { gasLimit: -1 },
        projectId,
        user
      );

      if (result.isOk && output) {
        const data = output.toHuman() as any;
        if (!data) return null;

        return {
          projectId,
          user,
          claimableAmount: BigInt(data.claimableAmount?.toString().replace(/,/g, '') || '0'),
          claimedAmount: BigInt(data.claimedAmount?.toString().replace(/,/g, '') || '0'),
          claimDeadline: Number(data.claimDeadline || 0)
        };
      }
      return null;
    } catch (error) {
      console.error('[ContractService] getUserClaim failed:', error);
      return null;
    }
  }
}

// Singleton instance
export const contractService = new ContractService();
export default contractService;
