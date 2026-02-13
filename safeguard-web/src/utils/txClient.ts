// Mock transaction client with realistic latency and error simulation
// Provides: estimateFee, submitDeposit, submitVote, submitClaim

export type Address = string;
export type TokenSymbol = 'LUNES' | 'LUSDT' | 'PSP22';

export type FeeQuote = {
  token: TokenSymbol;
  amount: number; // for mock UI only
  breakdown?: Record<string, number>;
};

export type TxReceipt = {
  txId: string;
  status: 'success' | 'failed';
  timestamp: number;
  meta?: Record<string, unknown>;
};

export type DepositInput = {
  from?: Address;
  projectId: string;
  token: TokenSymbol;
  amount: number;
};

export type VoteInput = {
  from?: Address;
  projectId: string;
  choice: 'yes' | 'no';
  weight?: number;
};

export type ClaimInput = {
  from?: Address;
  projectId: string;
  portion?: number; // percentage 0..100 (mock)
};

export type ClientOptions = {
  minLatencyMs?: number;
  maxLatencyMs?: number;
  failureRate?: number; // 0..1
};

const DEFAULTS: Required<ClientOptions> = {
  minLatencyMs: 500,
  maxLatencyMs: 1500,
  failureRate: 0.12, // 12% failures
};

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function jitter({ minLatencyMs, maxLatencyMs }: Required<ClientOptions>) {
  const span = Math.max(0, maxLatencyMs - minLatencyMs);
  return minLatencyMs + Math.floor(Math.random() * (span + 1));
}

function maybeFail(failureRate: number) {
  return Math.random() < failureRate;
}

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export class TxClient {
  private opts: Required<ClientOptions>;

  constructor(opts: ClientOptions = {}) {
    this.opts = { ...DEFAULTS, ...opts };
  }

  async estimateFee(_projectId: string, token: TokenSymbol): Promise<FeeQuote[]> {
    await sleep(jitter(this.opts));
    // Simple mock: base fee varies slightly
    const base = 100 + Math.floor(Math.random() * 15);
    const lusdt = 10 + Math.floor(Math.random() * 5);
    const breakdown = { base, priority: Math.floor(base * 0.15), network: Math.floor(base * 0.1) };
    const quotes: FeeQuote[] = [
      { token: 'LUNES', amount: base, breakdown },
      { token: 'LUSDT', amount: lusdt, breakdown: { conversion: 1, network: 1 } },
    ];
    // prioritize requested token first (purely cosmetic)
    quotes.sort((a, b) => (a.token === token ? -1 : b.token === token ? 1 : 0));
    return quotes;
  }

  async submitDeposit(input: DepositInput): Promise<TxReceipt> {
    await sleep(jitter(this.opts));
    if (maybeFail(this.opts.failureRate)) {
      throw new Error('Falha na submissão do depósito. Tente novamente.');
    }
    return {
      txId: id('dep'),
      status: 'success',
      timestamp: Date.now(),
      meta: { projectId: input.projectId, token: input.token, amount: input.amount },
    };
  }

  async submitVote(input: VoteInput): Promise<TxReceipt> {
    await sleep(jitter(this.opts));
    if (maybeFail(this.opts.failureRate)) {
      throw new Error('Falha ao registrar voto. Verifique sua conexão.');
    }
    return {
      txId: id('vote'),
      status: 'success',
      timestamp: Date.now(),
      meta: { projectId: input.projectId, choice: input.choice, weight: input.weight ?? 1 },
    };
  }

  async submitClaim(input: ClaimInput): Promise<TxReceipt> {
    await sleep(jitter(this.opts));
    if (maybeFail(this.opts.failureRate)) {
      throw new Error('Falha no claim. Janela encerrada ou requisitos não atendidos.');
    }
    const portion = Math.max(0, Math.min(100, input.portion ?? 100));
    return {
      txId: id('claim'),
      status: 'success',
      timestamp: Date.now(),
      meta: { projectId: input.projectId, portion },
    };
  }
}

// Default singleton with standard settings
export const txClient = new TxClient();
