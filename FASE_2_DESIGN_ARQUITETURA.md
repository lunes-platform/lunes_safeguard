# Fase 2: Design de Arquitetura e Solução Técnica
## Plataforma Lunes SafeGuard - Front-end

---

## 1. Stack Tecnológico Selecionado

### Tecnologias Core (Versões Mais Recentes - 2025)

- **React 19.1.0** <mcreference link="https://react.dev/versions" index="1">1</mcreference>
  - Actions nativas para gerenciamento de estado assíncrono
  - useActionState para formulários otimizados
  - useOptimistic para atualizações otimistas
  - Melhor performance e TypeScript support

- **Vite 6.x** <mcreference link="https://vite.dev/releases" index="4">4</mcreference>
  - Build ultra-rápido com esbuild
  - HMR instantâneo para desenvolvimento
  - Suporte nativo ao TypeScript
  - Plugin ecosystem robusto

- **TypeScript 5.7+** <mcreference link="https://www.thecandidstartup.org/2025/03/31/vitest-3-vite-6-react-19.html" index="2">2</mcreference>
  - Tipagem estática completa
  - Melhor inferência de tipos
  - Compatibilidade com React 19

- **Tailwind CSS 4.0** <mcreference link="https://tailwindcss.com/blog/tailwindcss-v4-0" index="3">3</mcreference>
  - Performance 5x mais rápida em builds completos
  - 100x mais rápida em builds incrementais
  - Plugin nativo para Vite
  - CSS moderno com features nativas

### Ferramentas de Desenvolvimento

- **Vitest 3.x** - Testes unitários e de integração
- **Playwright** - Testes E2E
- **React Testing Library** - Testes de componentes
- **ESLint + Prettier** - Qualidade de código
- **Husky + lint-staged** - Git hooks

---

## 2. Arquitetura do Monorepo

### Estrutura de Packages

```
lunes_safeguard/
├── packages/
│   ├── shared-ui/              # Componentes reutilizáveis
│   │   ├── src/
│   │   │   ├── components/     # Button, Input, Modal, Card, etc.
│   │   │   ├── hooks/          # useWallet, useContract, etc.
│   │   │   ├── utils/          # formatters, validators
│   │   │   └── types/          # TypeScript definitions
│   │   └── package.json
│   │
│   ├── web3-integration/       # Lógica Web3 e Smart Contracts
│   │   ├── src/
│   │   │   ├── contracts/      # ABIs e wrappers
│   │   │   ├── hooks/          # useContract, useBalance
│   │   │   ├── services/       # API calls para blockchain
│   │   │   └── types/          # Contract types
│   │   └── package.json
│   │
│   ├── admin-dashboard/        # Painel Administrativo
│   │   ├── src/
│   │   │   ├── pages/          # Project management pages
│   │   │   ├── components/     # Admin-specific components
│   │   │   ├── hooks/          # Admin business logic
│   │   │   └── store/          # Admin state management
│   │   └── package.json
│   │
│   └── community-platform/     # Interface Pública
│       ├── src/
│       │   ├── pages/          # Home, ProjectDetails, etc.
│       │   ├── components/     # Public-facing components
│       │   ├── hooks/          # Community business logic
│       │   └── store/          # Public state management
│       └── package.json
│
├── apps/
│   ├── admin/                  # App administrativa
│   └── public/                 # App pública
│
├── tools/
│   ├── eslint-config/          # Configuração ESLint compartilhada
│   └── tsconfig/               # TypeScript configs
│
└── package.json                # Root workspace
```

---

## 3. Gerenciamento de Estado

### Estratégia Híbrida

#### 3.1 Estado Local (React 19 Actions)
```typescript
// Formulários com useActionState
const [state, formAction, isPending] = useActionState(
  async (prevState: FormState, formData: FormData) => {
    const result = await submitProject(formData);
    if (result.error) return { error: result.error };
    return { success: true };
  },
  { error: null, success: false }
);
```

#### 3.2 Estado Global (Zustand)
```typescript
// Store para dados da aplicação
interface AppStore {
  user: User | null;
  projects: Project[];
  wallet: WalletState;
  
  // Actions
  setUser: (user: User) => void;
  updateProjects: (projects: Project[]) => void;
  connectWallet: () => Promise<void>;
}
```

#### 3.3 Estado do Servidor (TanStack Query)
```typescript
// Cache e sincronização com APIs
const { data: projects, isLoading, error } = useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  staleTime: 5 * 60 * 1000, // 5 minutos
});
```

---

## 4. Estrutura de Componentes

### 4.1 Hierarquia de Componentes - Admin Dashboard

```
AdminApp
├── AuthGuard                   # HOC para autenticação
│   └── AdminLayout
│       ├── Sidebar             # Navegação administrativa
│       ├── Header              # User info, notifications
│       └── MainContent
│           ├── ProjectsPage
│           │   ├── ProjectList
│           │   │   └── ProjectCard
│           │   └── CreateProjectModal
│           │       ├── ProjectForm
│           │       └── ContractAddressInput
│           │
│           ├── GuaranteesPage
│           │   ├── GuaranteeOverview
│           │   ├── AddGuaranteeForm
│           │   └── GuaranteeHistory
│           │
│           └── VotingPage
│               ├── VotingStatus
│               ├── VotingCountdown
│               └── ImprovementProposalForm
```

### 4.2 Hierarquia de Componentes - Community Platform

```
CommunityApp
├── PublicLayout
│   ├── Header                  # Logo, wallet connection
│   ├── Navigation              # Public navigation
│   └── MainContent
│       ├── HomePage
│       │   ├── HeroSection
│       │   ├── ProjectGrid
│       │   │   └── ProjectCard
│       │   │       ├── ProjectLogo
│       │   │       ├── ProjectInfo
│       │   │       ├── GuaranteeRating
│       │   │       └── LearnMoreButton
│       │   └── StatsSection
│       │
│       └── ProjectDetailsPage
│           ├── ProjectHeader
│           ├── ProjectDescription
│           ├── GuaranteeDetails
│           │   ├── GuaranteeBreakdown
│           │   └── AddToGuaranteeButton
│           ├── VotingSection
│           │   ├── VotingInterface
│           │   ├── VotingRules
│           │   └── VotingHistory
│           └── ProjectLinks
```

---

## 5. Contratos de Dados e APIs

### 5.1 Tipos TypeScript Core

```typescript
// Tipos base do sistema
interface Project {
  id: string;
  name: string;
  description: string;
  logo: string;
  contractAddress: string;
  owner: string;
  status: ProjectStatus;
  guaranteeScore: number;
  totalGuarantee: GuaranteeBreakdown;
  votingData: VotingData;
  createdAt: Date;
  updatedAt: Date;
}

interface GuaranteeBreakdown {
  lunes: bigint;
  lusdt: bigint;
  otherTokens: TokenAmount[];
  nftCollections: NFTGuarantee[];
  totalValueUSD: number;
}

interface VotingData {
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  approvalPercentage: number;
  totalVotes: number;
  status: VotingStatus;
  improvementProposal?: ImprovementProposal;
}

type ProjectStatus = 
  | 'active' 
  | 'under_evaluation' 
  | 'closed' 
  | 'pending_approval';

type VotingStatus = 
  | 'not_started'
  | 'active'
  | 'completed'
  | 'failed'
  | 'improvement_period';
```

### 5.2 Contratos de API

#### Smart Contract Integration
```typescript
// Wrapper para o contrato SafeGuard
interface SafeGuardContract {
  // Project Management
  registerProject(name: string, description: string): Promise<TransactionResult>;
  
  // Guarantee Management
  addGuarantee(projectId: string, amount: bigint, token: string): Promise<TransactionResult>;
  donateToGuarantee(projectId: string, amount: bigint, token: string): Promise<TransactionResult>;
  
  // Voting
  castVote(projectId: string, vote: boolean): Promise<TransactionResult>;
  activateVoting(projectId: string): Promise<TransactionResult>;
  
  // Queries
  getProject(projectId: string): Promise<Project>;
  getProjectScore(projectId: string): Promise<number>;
  getUserVotingPower(userAddress: string, projectId: string): Promise<bigint>;
}
```

#### API REST (Metadata e Cache)
```typescript
// APIs para dados off-chain
interface ProjectAPI {
  // CRUD Operations
  GET    /api/projects              -> Project[]
  GET    /api/projects/:id          -> Project
  POST   /api/projects              -> Project
  PUT    /api/projects/:id          -> Project
  DELETE /api/projects/:id          -> void
  
  // Guarantee Operations
  GET    /api/projects/:id/guarantees     -> GuaranteeBreakdown
  POST   /api/projects/:id/guarantees     -> TransactionResult
  
  // Voting Operations
  GET    /api/projects/:id/voting         -> VotingData
  POST   /api/projects/:id/vote           -> VoteResult
  
  // User Operations
  GET    /api/user/projects               -> Project[]
  GET    /api/user/voting-power/:projectId -> VotingPower
}
```

---

## 6. Tratamento de Erros e Estados

### 6.1 Error Boundaries
```typescript
// Componente para captura de erros
class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log para serviço de monitoramento
    logErrorToService(error, errorInfo);
  }
}
```

### 6.2 Estados de Loading e Erro
```typescript
// Hook customizado para estados assíncronos
const useAsyncOperation = <T>() => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  });
  
  const execute = useCallback(async (operation: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await operation();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error }));
    }
  }, []);
  
  return { ...state, execute };
};
```

---

## 7. Plano de Testes (TDD)

### 7.1 Estrutura de Testes

```
tests/
├── unit/
│   ├── components/           # Testes de componentes isolados
│   ├── hooks/               # Testes de custom hooks
│   ├── utils/               # Testes de funções utilitárias
│   └── services/            # Testes de serviços
│
├── integration/
│   ├── pages/               # Testes de páginas completas
│   ├── flows/               # Testes de fluxos de usuário
│   └── api/                 # Testes de integração com APIs
│
└── e2e/
    ├── admin/               # Testes E2E do painel admin
    ├── community/           # Testes E2E da plataforma pública
    └── wallet/              # Testes de integração com carteira
```

### 7.2 Cenários de Teste Prioritários

#### Testes Unitários
- ✅ Componentes de UI renderizam corretamente
- ✅ Hooks customizados retornam dados esperados
- ✅ Validações de formulário funcionam
- ✅ Formatação de dados está correta
- ✅ Cálculos de score de garantia

#### Testes de Integração
- ✅ Fluxo completo de cadastro de projeto
- ✅ Adição de garantias com diferentes tokens
- ✅ Sistema de votação da comunidade
- ✅ Conexão e desconexão de carteira
- ✅ Sincronização de dados com blockchain

#### Testes E2E
- ✅ Jornada completa do administrador
- ✅ Jornada completa do usuário da comunidade
- ✅ Cenários de falha e recuperação
- ✅ Performance em diferentes dispositivos

---

## 8. Segurança e Performance

### 8.1 Medidas de Segurança

- **Validação de Input**: Sanitização de todos os dados de entrada
- **CSP Headers**: Content Security Policy rigorosa
- **Wallet Security**: Verificação de assinaturas e nonces
- **Rate Limiting**: Proteção contra spam de transações
- **Audit de Dependências**: `npm audit` automatizado

### 8.2 Otimizações de Performance

- **Code Splitting**: Lazy loading de rotas e componentes
- **Memoização**: React.memo e useMemo estratégicos
- **Virtualização**: Para listas grandes de projetos
- **Image Optimization**: WebP e lazy loading
- **Bundle Analysis**: Monitoramento do tamanho dos bundles

---

## 9. Próximos Passos

1. **Aprovação da Arquitetura**: Validação do design proposto
2. **Setup do Ambiente**: Configuração do monorepo e ferramentas
3. **Implementação TDD**: Início do desenvolvimento com testes
4. **Integração Contínua**: Setup de CI/CD
5. **Deploy e Monitoramento**: Configuração de produção

---

**Documento criado em:** Janeiro 2025  
**Versão:** 1.0  
**Status:** Aguardando aprovação para implementação